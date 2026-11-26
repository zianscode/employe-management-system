package leave

import (
	"database/sql"
	"fmt"
	"slices"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/notification"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var openStatuses = []string{"PENDING", "MANAGER_APPROVED"}
var reservedStatuses = []string{"PENDING", "MANAGER_APPROVED", "HR_APPROVED"}

type balance struct {
	Year      int `json:"year"`
	Quota     int `json:"quota"`
	Used      int `json:"used"`
	Remaining int `json:"remaining"`
}

func allocated(db *gorm.DB, id string, year int, statuses []string) (int, error) {
	start := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	var total int
	err := db.Model(&LeaveRequest{}).Select("COALESCE(sum(duration),0)").
		Where(`"employeeId"=? AND type='ANNUAL' AND status IN ? AND "startDate">=? AND "startDate"<?`, id, statuses, start, start.AddDate(1, 0, 0)).
		Scan(&total).Error
	return total, err
}

func BalanceFor(db *gorm.DB, id string, year int) (balance, error) {
	result := balance{Year: year}
	err := db.Transaction(func(tx *gorm.DB) error {
		var row struct{ Quota int }
		if err := tx.Table(`"Employee"`).Select(`"leaveQuota" AS quota`).Where("id = ?", id).Take(&row).Error; err != nil {
			return err
		}
		used, err := allocated(tx, id, year, []string{"HR_APPROVED"})
		if err != nil {
			return err
		}
		result.Quota, result.Used, result.Remaining = row.Quota, used, max(0, row.Quota-used)
		return nil
	}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
	return result, err
}

func subject(actor identity.Actor, requested string) (string, error) {
	if requested == "" {
		return employees.WorkID(actor)
	}
	if identity.IsAdmin(actor.Role) || web.String(actor.EmployeeID) == requested {
		return requested, nil
	}
	return "", web.Forbidden("Pengajuan hanya bisa dibuat untuk akun sendiri")
}

func duration(db *gorm.DB, start, end time.Time) (int, error) {
	holidays, err := settings.HolidayDates(db, start, end)
	if err != nil {
		return 0, err
	}
	return workday.Count(start, end, holidays), nil
}

type leaveInput struct {
	EmployeeID string `json:"employeeId"`
	Type       string `json:"type"`
	StartDate  string `json:"startDate"`
	EndDate    string `json:"endDate"`
	Reason     string `json:"reason"`
}

func event(row LeaveRequest, name string) notification.LeaveEvent {
	return notification.LeaveEvent{ID: row.ID, EmployeeID: row.EmployeeID, Name: name, Kind: row.Type, Reason: row.Reason, Start: row.StartDate, End: row.EndDate, Duration: row.Duration}
}

func overlap(db *gorm.DB, row LeaveRequest, statuses []string) (bool, error) {
	var count int64
	err := db.Model(&LeaveRequest{}).Where(`"employeeId" = ? AND id <> ? AND status IN ? AND "startDate" <= ? AND "endDate" >= ?`,
		row.EmployeeID, row.ID, statuses, row.EndDate, row.StartDate).Count(&count).Error
	return count > 0, err
}

func submit(db *gorm.DB, actor identity.Actor, input leaveInput) error {
	id, err := subject(actor, input.EmployeeID)
	if err != nil {
		return err
	}
	input.Reason = strings.TrimSpace(input.Reason)
	if !web.Text(input.Reason, 1, 2000) {
		return web.Invalid("Alasan cuti wajib diisi dan maksimal 2000 karakter")
	}
	if !slices.Contains([]string{"ANNUAL", "SICK", "EMERGENCY", "UNPAID"}, input.Type) {
		return web.Invalid("Jenis cuti tidak valid")
	}
	start, startErr := web.ParseDate(input.StartDate)
	end, endErr := web.ParseDate(input.EndDate)
	if startErr != nil || endErr != nil || start == nil || end == nil {
		return web.Invalid("Tanggal tidak valid")
	}
	if end.Before(*start) {
		return web.Invalid("Tanggal selesai tidak boleh sebelum tanggal mulai")
	}
	row := LeaveRequest{ID: uuid.NewString(), EmployeeID: id, Type: input.Type, StartDate: *start, EndDate: *end, Reason: input.Reason, Status: "PENDING"}
	return db.Transaction(func(tx *gorm.DB) error {
		person, err := employees.LockWork(tx, id)
		if err != nil {
			return err
		}
		if !employees.WorkActive(person.Status) {
			return web.Forbidden("Karyawan tidak aktif")
		}
		count, err := duration(tx, *start, *end)
		if err != nil {
			return err
		}
		if count == 0 {
			return web.Invalid("Rentang tanggal tidak mengandung hari kerja (Senin-Jumat, bukan hari libur)")
		}
		row.Duration = int32(count)
		exists, err := overlap(tx, row, reservedStatuses)
		if err != nil {
			return err
		}
		if exists {
			return web.Conflict("Sudah ada pengajuan cuti pada rentang tanggal tersebut")
		}
		if row.Type == "ANNUAL" {
			year := row.StartDate.Year()
			reserved, err := allocated(tx, id, year, reservedStatuses)
			if err != nil {
				return err
			}
			if reserved+count > int(person.LeaveQuota) {
				return web.Conflict(fmt.Sprintf("Sisa kuota cuti tahunan %d tidak cukup (tersisa %d hari)", year, max(0, int(person.LeaveQuota)-reserved)))
			}
		}
		if err := tx.Create(&row).Error; err != nil {
			return err
		}
		return notification.LeaveSubmitted(tx, event(row, person.Name), person.ManagerID)
	})
}

func leaveQuery(db *gorm.DB) *gorm.DB {
	return db.Table(`"LeaveRequest" AS l`).Joins(`JOIN "Employee" AS e ON e.id=l."employeeId"`)
}

func canDecide(actor identity.Actor, row LeaveRequest, manager *string) bool {
	return slices.Contains(openStatuses, row.Status) && (actor.Role != "MANAGER" || row.Status == "PENDING") &&
		employees.CanReviewWork(actor, row.EmployeeID, manager)
}

func move(db *gorm.DB, actor identity.Actor, id, action, reason string) (string, error) {
	actorID, err := employees.WorkID(actor)
	if err != nil {
		return "", err
	}
	var status string
	err = db.Transaction(func(tx *gorm.DB) error {
		var row LeaveRequest
		q := employees.WorkScope(leaveQuery(tx).Select("l.*"), actor)
		if err := q.Where("l.id = ?", id).Take(&row).Error; err != nil {
			return err
		}
		person, err := employees.LockWork(tx, row.EmployeeID)
		if err != nil {
			return err
		}
		row = LeaveRequest{}
		if err := tx.Take(&row, "id = ?", id).Error; err != nil {
			return err
		}
		if !employees.CanAccessWork(actor, person.ID, person.ManagerID) {
			return web.NotFound("Pengajuan cuti tidak ditemukan")
		}
		if !slices.Contains(openStatuses, row.Status) {
			return web.Conflict("Pengajuan cuti sudah diproses")
		}
		if action == "cancel" {
			if actorID != person.ID {
				return web.Forbidden("Pengajuan ini tidak dapat dibatalkan")
			}
		} else if !canDecide(actor, row, person.ManagerID) {
			return web.Forbidden("Anda tidak berwenang memproses pengajuan ini")
		}
		updates := map[string]any{}
		now := time.Now().UTC()
		switch action {
		case "cancel":
			status = "CANCELLED"
		case "reject":
			status = "REJECTED"
			updates["rejectedById"], updates["rejectedAt"], updates["rejectionReason"] = actorID, now, reason
		case "approve":
			if actor.Role == "MANAGER" {
				status = "MANAGER_APPROVED"
				updates["managerApproverId"], updates["managerApprovedAt"] = actorID, now
			} else {
				status = "HR_APPROVED"
				exists, err := overlap(tx, row, []string{"HR_APPROVED"})
				if err != nil {
					return err
				}
				if exists {
					return web.Conflict("Sudah ada cuti disetujui pada rentang tanggal tersebut")
				}
				if row.Type == "ANNUAL" {
					used, err := allocated(tx, row.EmployeeID, row.StartDate.Year(), []string{"HR_APPROVED"})
					if err != nil {
						return err
					}
					if used+int(row.Duration) > int(person.LeaveQuota) {
						return web.Conflict("Kuota cuti tahunan karyawan tidak mencukupi")
					}
				}
				updates["hrApproverId"], updates["hrApprovedAt"] = actorID, now
			}
		}
		updates["status"] = status
		result := tx.Model(&row).Where("status = ?", row.Status).Updates(updates)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected != 1 {
			return web.Conflict("Pengajuan cuti sudah diproses")
		}
		if status == "CANCELLED" {
			return nil
		}
		auditAction := "LEAVE_APPROVED"
		if status == "REJECTED" {
			auditAction = "LEAVE_REJECTED"
		}
		if err := identity.Audit(tx, actor, auditAction, "LEAVE", id, person.Name, reason); err != nil {
			return err
		}
		return notification.LeaveDecided(tx, event(row, person.Name), status, reason)
	})
	return status, err
}

func PendingCount(db *gorm.DB, actor identity.Actor) (int64, error) {
	if actor.EmployeeID == nil || (!identity.IsAdmin(actor.Role) && actor.Role != "MANAGER") {
		return 0, nil
	}
	q := leaveQuery(db).Where("l.status IN ?", openStatuses)
	if actor.Role != "SUPER_ADMIN" {
		q = q.Where(`l."employeeId" <> ?`, *actor.EmployeeID)
	}
	if actor.Role == "MANAGER" {
		q = q.Where(`e."managerId" = ? AND l.status='PENDING'`, *actor.EmployeeID)
	}
	var count int64
	err := q.Count(&count).Error
	return count, err
}
