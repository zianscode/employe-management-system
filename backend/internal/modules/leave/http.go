package leave

import (
	"database/sql"
	"slices"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(active, admin *gin.RouterGroup, db *gorm.DB) {
	active.GET("/leave-requests", listHTTP(db))
	active.GET("/leave-requests/stats", statsHTTP(db))
	active.GET("/leave-requests/me/balance", balanceHTTP(db))
	active.POST("/leave-requests/preview", previewHTTP(db))
	active.POST("/leave-requests", submitHTTP(db))
	active.POST("/leave-requests/:id/approve", moveHTTP(db, "approve"))
	active.POST("/leave-requests/:id/reject", moveHTTP(db, "reject"))
	active.POST("/leave-requests/:id/cancel", moveHTTP(db, "cancel"))
	admin.GET("/leave-requests/employee-options", employeeOptionsHTTP(db))
}

func submitHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input leaveInput
		if !web.Bind(c, &input, 16<<10) {
			return
		}
		if err := submit(db.WithContext(c.Request.Context()), identity.Current(c), input); err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 201, "Pengajuan cuti berhasil dikirim", nil)
	}
}

func moveHTTP(db *gorm.DB, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Reason string `json:"reason"`
		}
		if action == "reject" {
			if !web.Bind(c, &input, 16<<10) {
				return
			}
			input.Reason = strings.TrimSpace(input.Reason)
			if !web.Text(input.Reason, 1, 2000) {
				web.Fail(c, web.Invalid("Alasan penolakan wajib diisi dan maksimal 2000 karakter"))
				return
			}
		}
		status, err := move(db.WithContext(c.Request.Context()), identity.Current(c), c.Param("id"), action, input.Reason)
		if err != nil {
			web.Fail(c, err)
			return
		}
		message := map[string]string{"MANAGER_APPROVED": "Disetujui atasan, menunggu persetujuan HR", "HR_APPROVED": "Cuti disetujui",
			"REJECTED": "Pengajuan cuti ditolak", "CANCELLED": "Pengajuan cuti dibatalkan"}[status]
		web.OK(c, 200, message, nil)
	}
}

func balanceHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := employees.WorkID(identity.Current(c))
		if err != nil {
			web.Fail(c, err)
			return
		}
		result, err := BalanceFor(db.WithContext(c.Request.Context()), id, workday.Date(time.Now()).Year())
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Sisa cuti", result)
	}
}

func previewHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			EmployeeID string `json:"employeeId"`
			StartDate  string `json:"startDate"`
			EndDate    string `json:"endDate"`
		}
		if !web.Bind(c, &input, 16<<10) {
			return
		}
		id, err := subject(identity.Current(c), input.EmployeeID)
		if err != nil {
			web.Fail(c, err)
			return
		}
		start, err := web.ParseDate(input.StartDate)
		if err != nil || start == nil {
			web.Fail(c, web.Invalid("Tanggal tidak valid"))
			return
		}
		end, err := web.ParseDate(input.EndDate)
		if err != nil {
			web.Fail(c, err)
			return
		}
		var row struct {
			Quota       int
			ManagerName *string
		}
		var used, pending int
		var working *int
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			err := tx.Table(`"Employee" AS e`).Select(`e."leaveQuota" AS quota,m.name AS manager_name`).
				Joins(`LEFT JOIN "Employee" AS m ON m.id=e."managerId"`).Where("e.id = ?", id).Take(&row).Error
			if err != nil {
				return err
			}
			if used, err = allocated(tx, id, start.Year(), []string{"HR_APPROVED"}); err != nil {
				return err
			}
			if pending, err = allocated(tx, id, start.Year(), openStatuses); err != nil {
				return err
			}
			if end != nil && !end.Before(*start) {
				days, err := duration(tx, *start, *end)
				if err != nil {
					return err
				}
				working = &days
			}
			return nil
		}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Pratinjau cuti", gin.H{"year": start.Year(), "quota": row.Quota, "used": used, "pending": pending,
			"available": max(0, row.Quota-used-pending), "workingDays": working, "managerName": row.ManagerName})
	}
}

func listHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		type row struct {
			LeaveRequest
			Name                                                               string
			NIP, ManagerID, ManagerName, ManagerApprover, HRApprover, Rejector *string
		}
		actor := identity.Current(c)
		var rows []row
		q := leaveQuery(db.WithContext(c.Request.Context())).
			Select(`l.*,e.name,e.nip,e."managerId" AS manager_id,m.name AS manager_name,a.name AS manager_approver,h.name AS hr_approver,r.name AS rejector`).
			Joins(`LEFT JOIN "Employee" AS m ON m.id=e."managerId" LEFT JOIN "Employee" AS a ON a.id=l."managerApproverId"
			LEFT JOIN "Employee" AS h ON h.id=l."hrApproverId" LEFT JOIN "Employee" AS r ON r.id=l."rejectedById"`).
			Order(`l."createdAt" DESC,l.id`)
		if err := employees.WorkScope(q, actor).Find(&rows).Error; err != nil {
			web.Fail(c, err)
			return
		}
		approver := func(name *string, at *time.Time) any {
			if web.String(name) == "" {
				return nil
			}
			return gin.H{"name": *name, "at": at}
		}
		result := make([]gin.H, 0, len(rows))
		for _, r := range rows {
			var next *string
			switch r.Status {
			case "PENDING":
				next = web.Ptr("Menunggu persetujuan HR")
				if manager := web.String(r.ManagerName); manager != "" {
					next = web.Ptr("Menunggu persetujuan atasan (" + manager + ")")
				}
			case "MANAGER_APPROVED":
				next = web.Ptr("Menunggu persetujuan akhir HR")
			}
			can := canDecide(actor, r.LeaveRequest, r.ManagerID)
			result = append(result, gin.H{"id": r.ID, "employeeId": r.EmployeeID, "nip": web.Fallback(web.String(r.NIP), "-"), "nama": r.Name, "tipeCuti": r.Type,
				"tanggalMulai": workday.Display(r.StartDate), "tanggalSelesai": workday.Display(r.EndDate), "durasi": r.Duration, "status": r.Status, "reason": r.Reason,
				"managerApprover": approver(r.ManagerApprover, r.ManagerApprovedAt), "hrApprover": approver(r.HRApprover, r.HRApprovedAt), "rejectedBy": approver(r.Rejector, r.RejectedAt),
				"rejectionReason": r.RejectionReason, "nextStep": next, "canApprove": can, "canReject": can, "canCancel": slices.Contains(openStatuses, r.Status) && web.String(actor.EmployeeID) == r.EmployeeID})
		}
		web.OK(c, 200, "Data cuti", result)
	}
}

func statsHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var stat struct{ Total, Approved, Pending, Rejected int }
		q := leaveQuery(db.WithContext(c.Request.Context())).
			Select(`count(*) AS total,count(*) FILTER (WHERE l.status='HR_APPROVED') AS approved,
			count(*) FILTER (WHERE l.status IN ('PENDING','MANAGER_APPROVED')) AS pending,count(*) FILTER (WHERE l.status='REJECTED') AS rejected`)
		if err := employees.WorkScope(q, identity.Current(c)).Scan(&stat).Error; err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Statistik cuti", []web.Stat{
			web.CardStat("Total pengajuan", stat.Total, "neutral", ""), web.CardStat("Disetujui", stat.Approved, "success", ""),
			web.CardStat("Menunggu", stat.Pending, "warning", ""), web.CardStat("Ditolak", stat.Rejected, "danger", ""),
		})
	}
}

func employeeOptionsHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var rows []struct {
			ID, Name string
			NIP      *string
		}
		err := db.WithContext(c.Request.Context()).Model(&employees.Employee{}).Select("id", "name", "nip").Where("status IN ('ACTIVE','PROBATION')").Order("name,id").Find(&rows).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		options := make([]gin.H, 0, len(rows))
		for _, r := range rows {
			options = append(options, gin.H{"id": r.ID, "name": r.Name, "nip": web.Fallback(web.String(r.NIP), "-")})
		}
		web.OK(c, 200, "Karyawan", options)
	}
}
