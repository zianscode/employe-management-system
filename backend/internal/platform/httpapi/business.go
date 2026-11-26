package httpapi

import (
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/audit"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/dashboard"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/leave"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/organization"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/payroll"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/reports"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterBusiness(router *gin.Engine, db *gorm.DB, service *identity.Service, avatars employees.AvatarStore) {
	api := router.Group("/api/v1", service.SameOrigin)
	active := api.Group("", service.Require(true, false))
	admin := api.Group("", service.Require(true, true))
	authenticated := api.Group("", service.Require(false, false))
	approver := active.Group("", func(c *gin.Context) {
		role := identity.Current(c).Role
		if !identity.IsAdmin(role) && role != "MANAGER" {
			web.Fail(c, web.Forbidden("Anda tidak memiliki akses untuk tindakan ini"))
		}
	})

	service.Register(api)
	employees.Register(admin, active, authenticated, db, avatars)
	organization.Register(admin, db)
	settings.Register(admin, active, db)
	attendance.Register(active, db)
	leave.Register(active, admin, db)
	payroll.Register(active, admin, db)
	dashboard.Register(active, db)
	reports.Register(active, approver, admin, db)
	admin.GET("/audit-logs", audit.ListHTTP(db))
	admin.GET("/employees.csv", employees.ExportHTTP(db))
	active.GET("/attendance/daily.csv", attendance.ExportDailyHTTP(db))
}
