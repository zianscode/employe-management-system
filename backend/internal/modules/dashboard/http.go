package dashboard

import (
	"database/sql"
	"math"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/leave"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(active *gin.RouterGroup, db *gorm.DB) {
	active.GET("/dashboard/pending-approvals", pendingApprovals(db))
	active.GET("/dashboard/stats", func(c *gin.Context) {
		actor := identity.Current(c)
		var result gin.H
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var err error
			if actor.Role == "EMPLOYEE" {
				result, err = personal(tx, actor, time.Now())
			} else {
				result, err = organization(tx, workday.Date(time.Now()))
			}
			return err
		}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Dashboard stats fetched", result)
	})
	active.GET("/dashboard/me", func(c *gin.Context) {
		actor := identity.Current(c)
		if actor.EmployeeID == nil || identity.IsAdmin(actor.Role) {
			web.OK(c, 200, "Tidak ditampilkan", nil)
			return
		}
		var overview gin.H
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var err error
			overview, err = employees.Overview(tx, *actor.EmployeeID)
			return err
		}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Ringkasan", overview)
	})
}

func pendingApprovals(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := identity.Current(c)
		var leaves, corrections int64
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var err error
			if leaves, err = leave.PendingCount(tx, actor); err != nil {
				return err
			}
			corrections, err = attendance.PendingCount(tx, actor)
			return err
		}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Pending approvals", gin.H{"leave": leaves, "attendanceCorrection": corrections})
	}
}

func personal(db *gorm.DB, actor identity.Actor, now time.Time) (gin.H, error) {
	id, err := employees.WorkID(actor)
	if err != nil {
		return nil, err
	}
	today, err := attendance.MyToday(db, id, now)
	if err != nil {
		return nil, err
	}
	balance, err := leave.BalanceFor(db, id, workday.Date(now).Year())
	if err != nil {
		return nil, err
	}
	var salaries int64
	if err := db.Table(`"Salary"`).Where(`"employeeId"=? AND "isPaid"`, id).Count(&salaries).Error; err != nil {
		return nil, err
	}
	return gin.H{"type": "PERSONAL", "stats": gin.H{"attendanceStatus": attendance.StatusLabel(today["status"].(string)),
		"checkInTime": today["checkIn"], "remainingLeave": balance.Remaining, "totalSalaryReceived": salaries}}, nil
}

func organization(db *gorm.DB, today time.Time) (gin.H, error) {
	var out struct{ TotalEmployees, PresentToday, LeaveRequests int64 }
	err := db.Raw(`SELECT (SELECT count(*) FROM "Employee" WHERE status IN ('ACTIVE','PROBATION')) AS total_employees,
		(SELECT count(*) FROM "Attendance" WHERE date=?) AS present_today,
		(SELECT count(*) FROM "LeaveRequest" WHERE status IN ('PENDING','MANAGER_APPROVED')) AS leave_requests`, today).Scan(&out).Error
	if err != nil {
		return nil, err
	}
	efficiency := 0
	if out.TotalEmployees > 0 {
		efficiency = int(math.Round(float64(out.PresentToday) / float64(out.TotalEmployees) * 100))
	}
	return gin.H{"type": "ORGANIZATIONAL", "stats": gin.H{"totalEmployees": out.TotalEmployees, "presentToday": out.PresentToday,
		"leaveRequests": out.LeaveRequests, "efficiency": efficiency}}, nil
}
