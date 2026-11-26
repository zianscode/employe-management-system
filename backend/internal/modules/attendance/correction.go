package attendance

import (
	"fmt"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/notification"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type correctionRow struct {
	AttendanceCorrection
	Name                         string
	NIP, ManagerID, ReviewerName *string
}

func correctionQuery(db *gorm.DB) *gorm.DB {
	return db.Table(`"AttendanceCorrection" AS c`).Joins(`JOIN "Employee" AS e ON e.id=c."employeeId"`)
}

func listCorrectionsHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := identity.Current(c)
		var rows []correctionRow
		q := correctionQuery(db.WithContext(c.Request.Context())).
			Select(`c.*,e.name,e.nip,e."managerId" AS manager_id,r.name AS reviewer_name`).
			Joins(`LEFT JOIN "Employee" AS r ON r.id=c."reviewedById"`).Order(`c.status ASC,c."createdAt" DESC,c.id`)
		if err := employees.WorkScope(q, actor).Find(&rows).Error; err != nil {
			web.Fail(c, err)
			return
		}
		result := make([]gin.H, 0, len(rows))
		for _, row := range rows {
			pending := row.Status == "PENDING"
			result = append(result, gin.H{"id": row.ID, "employeeId": row.EmployeeID, "nip": web.Fallback(web.String(row.NIP), "-"),
				"nama": row.Name, "tanggal": workday.Display(row.Date), "jamMasuk": workday.ClockOr(row.CheckIn, "-"), "jamKeluar": workday.ClockOr(row.CheckOut, "-"),
				"reason": row.Reason, "status": row.Status, "reviewedBy": row.ReviewerName, "rejectionReason": row.RejectionReason,
				"canReview": pending && employees.CanReviewWork(actor, row.EmployeeID, row.ManagerID), "canCancel": pending && web.String(actor.EmployeeID) == row.EmployeeID})
		}
		web.OK(c, 200, "Koreksi absensi", result)
	}
}

func PendingCount(db *gorm.DB, actor identity.Actor) (int64, error) {
	if actor.EmployeeID == nil || (!identity.IsAdmin(actor.Role) && actor.Role != "MANAGER") {
		return 0, nil
	}
	q := correctionQuery(db).Where("c.status = 'PENDING'")
	if actor.Role != "SUPER_ADMIN" {
		q = q.Where(`c."employeeId" <> ?`, *actor.EmployeeID)
	}
	if actor.Role == "MANAGER" {
		q = q.Where(`e."managerId" = ?`, *actor.EmployeeID)
	}
	var count int64
	err := q.Count(&count).Error
	return count, err
}

func submitCorrectionHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := employees.WorkID(identity.Current(c))
		if err != nil {
			web.Fail(c, err)
			return
		}
		var input struct {
			Date     string `json:"date"`
			CheckIn  string `json:"checkIn"`
			CheckOut string `json:"checkOut"`
			Reason   string `json:"reason"`
		}
		if !web.Bind(c, &input, 16<<10) {
			return
		}
		date, err := web.ParseDate(input.Date)
		if err != nil || date == nil {
			web.Fail(c, web.Invalid("Tanggal tidak valid"))
			return
		}
		input.Reason = strings.TrimSpace(input.Reason)
		if !web.Text(input.Reason, 1, 2000) {
			web.Fail(c, web.Invalid("Alasan koreksi wajib diisi dan maksimal 2000 karakter"))
			return
		}
		if input.CheckIn == "" && input.CheckOut == "" {
			web.Fail(c, web.Invalid("Isi jam masuk dan/atau jam pulang"))
			return
		}
		in, err := workday.TimeOn(*date, input.CheckIn)
		if err != nil {
			web.Fail(c, err)
			return
		}
		out, err := workday.TimeOn(*date, input.CheckOut)
		if err != nil {
			web.Fail(c, err)
			return
		}
		today := workday.Date(time.Now())
		if date.After(today) {
			web.Fail(c, web.Invalid("Tidak bisa mengoreksi tanggal yang belum terjadi"))
			return
		}
		if date.Before(today.AddDate(0, 0, -30)) {
			web.Fail(c, web.Invalid("Koreksi hanya bisa untuk 30 hari terakhir"))
			return
		}
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			person, err := employees.LockWork(tx, id)
			if err != nil {
				return err
			}
			if !employees.WorkActive(person.Status) {
				return web.Forbidden("Karyawan tidak aktif")
			}
			row, err := recordFor(tx, id, *date)
			if err != nil {
				return err
			}
			if err := applyTimes(&row, in, out); err != nil {
				return err
			}
			var pending int64
			if err := tx.Model(&AttendanceCorrection{}).Where(`"employeeId" = ? AND date = ? AND status = 'PENDING'`, id, *date).Count(&pending).Error; err != nil {
				return err
			}
			if pending > 0 {
				return web.Conflict("Sudah ada pengajuan koreksi yang menunggu untuk tanggal tersebut")
			}
			return tx.Create(&AttendanceCorrection{ID: uuid.NewString(), EmployeeID: id, Date: *date, CheckIn: in, CheckOut: out, Reason: input.Reason, Status: "PENDING"}).Error
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 201, "Pengajuan koreksi absensi terkirim", nil)
	}
}

func applyTimes(row *Attendance, in, out *time.Time) error {
	if in != nil {
		row.CheckIn = in
	}
	if out != nil {
		row.CheckOut = out
	}
	if row.CheckIn == nil {
		return web.Invalid("Jam masuk wajib diisi karena belum ada catatan check-in di tanggal tersebut")
	}
	if row.CheckOut != nil && !row.CheckOut.After(*row.CheckIn) {
		return web.Invalid("Jam pulang harus setelah jam masuk")
	}
	return nil
}

func decideCorrectionHTTP(db *gorm.DB, status string) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := identity.Current(c)
		actorID, err := employees.WorkID(actor)
		if err != nil {
			web.Fail(c, err)
			return
		}
		var input struct {
			Reason string `json:"reason"`
		}
		if status == "REJECTED" {
			if !web.Bind(c, &input, 16<<10) {
				return
			}
			input.Reason = strings.TrimSpace(input.Reason)
			if !web.Text(input.Reason, 1, 2000) {
				web.Fail(c, web.Invalid("Alasan penolakan wajib diisi dan maksimal 2000 karakter"))
				return
			}
		}
		id := c.Param("id")
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var row AttendanceCorrection
			q := employees.WorkScope(correctionQuery(tx).Select("c.*"), actor)
			if err := q.Where("c.id = ?", id).Take(&row).Error; err != nil {
				return err
			}
			person, err := employees.LockWork(tx, row.EmployeeID)
			if err != nil {
				return err
			}
			row = AttendanceCorrection{}
			if err := tx.Take(&row, "id = ?", id).Error; err != nil {
				return err
			}
			if !employees.CanAccessWork(actor, person.ID, person.ManagerID) {
				return web.NotFound("Pengajuan koreksi tidak ditemukan")
			}
			if status == "CANCELLED" {
				if actorID != person.ID {
					return web.Forbidden("Pengajuan koreksi tidak dapat dibatalkan")
				}
			} else if !employees.CanReviewWork(actor, person.ID, person.ManagerID) {
				return web.Forbidden("Anda tidak berwenang meninjau koreksi ini")
			}
			if row.Status != "PENDING" {
				return web.Conflict("Pengajuan koreksi sudah diproses")
			}
			updates := map[string]any{"status": status}
			if status == "APPROVED" {
				schedule, err := settings.AttendanceSchedule(tx)
				if err != nil {
					return err
				}
				record, err := recordFor(tx, row.EmployeeID, row.Date)
				if err != nil {
					return err
				}
				if err := applyTimes(&record, row.CheckIn, row.CheckOut); err != nil {
					return err
				}
				record.Notes = web.Ptr("Dikoreksi: " + row.Reason)
				evaluate(&record, schedule)
				if record.ID == "" {
					record.ID, record.EmployeeID, record.Date = uuid.NewString(), row.EmployeeID, row.Date
					if err := tx.Create(&record).Error; err != nil {
						return err
					}
				} else {
					fields := recordFields(record)
					fields["notes"] = record.Notes
					if err := tx.Model(&record).Updates(fields).Error; err != nil {
						return err
					}
				}
			}
			if status != "CANCELLED" {
				updates["reviewedById"], updates["reviewedAt"] = actorID, time.Now().UTC()
				if status == "REJECTED" {
					updates["rejectionReason"] = input.Reason
				}
			}
			result := tx.Model(&row).Where("status = 'PENDING'").Updates(updates)
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected != 1 {
				return web.Conflict("Pengajuan koreksi sudah diproses")
			}
			if status == "CANCELLED" {
				return nil
			}
			if err := identity.Audit(tx, actor, "CORRECTION_"+status, "ATTENDANCE_CORRECTION", id, fmt.Sprintf("%s (%s)", person.Name, workday.Display(row.Date)), input.Reason); err != nil {
				return err
			}
			return notification.CorrectionDecided(tx, id, row.EmployeeID, status, input.Reason, row.Date)
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		message := map[string]string{"APPROVED": "Koreksi disetujui, data absensi diperbarui", "REJECTED": "Koreksi ditolak", "CANCELLED": "Pengajuan koreksi dibatalkan"}[status]
		web.OK(c, 200, message, nil)
	}
}
