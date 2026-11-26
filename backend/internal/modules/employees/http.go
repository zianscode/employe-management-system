package employees

import (
	"math"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const joins = `LEFT JOIN "Department" AS d ON d.id=e."departmentId" LEFT JOIN "Position" AS p ON p.id=e."positionId"`

type employeeRow struct {
	Employee
	Division           *string
	Position           *string
	ManagerName        *string
	RoleID             *string
	MustChangePassword bool
	LockedUntil        *time.Time
}

func Register(admin, active, authenticated *gin.RouterGroup, db *gorm.DB, avatars AvatarStore) {
	admin.GET("/employees", listHTTP(db))
	admin.POST("/employees", saveHTTP(db, true))
	admin.GET("/employees/:id", detailHTTP(db))
	admin.GET("/employees/:id/history", historyHTTP(db))
	admin.PATCH("/employees/:id", saveHTTP(db, false))
	admin.PATCH("/employees/:id/role", roleHTTP(db))
	admin.POST("/employees/:id/activate", activateHTTP(db))
	admin.DELETE("/employees/:id", deleteHTTP(db))
	active.GET("/me", getProfileHTTP(db))
	active.PATCH("/me", updateProfileHTTP(db, avatars))
	authenticated.POST("/me/onboarding", onboardHTTP(db, avatars))
	authenticated.GET("/avatars/:file", avatars.Get)
}

func dateString(date *time.Time, format string) string {
	if date == nil {
		return ""
	}
	return date.UTC().Format(format)
}

func listQuery(db *gorm.DB) *gorm.DB {
	return db.Table(`"Employee" AS e`).Select(`e.id,e.name,e.email,e.nip,e.status,e."joinDate",e.avatar,d.name AS division,p.name AS position`).
		Joins(joins).Order(`e."createdAt" DESC,e.id DESC`)
}

func listHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		q := listQuery(db.WithContext(c.Request.Context()))
		if status := c.Query("status"); status != "" {
			if !validStatus(status) {
				web.Fail(c, web.Invalid("Status karyawan tidak valid"))
				return
			}
			q = q.Where("e.status = ?", status)
		}
		if department := c.Query("departmentId"); department != "" {
			q = q.Where(`e."departmentId" = ?`, department)
		}
		var rows []employeeRow
		if err := q.Find(&rows).Error; err != nil {
			web.Fail(c, err)
			return
		}
		result := make([]gin.H, 0, len(rows))
		for _, r := range rows {
			var days *int
			if r.Status == "PROBATION" && r.JoinDate != nil {
				end := r.JoinDate.UTC().AddDate(0, 3, 0).Truncate(24 * time.Hour)
				value := int(math.Ceil(end.Sub(time.Now().UTC().Truncate(24*time.Hour)).Hours() / 24))
				days = &value
			}
			result = append(result, gin.H{"id": r.ID, "name": r.Name, "email": r.Email, "nip": web.Fallback(web.String(r.NIP), "-"), "status": r.Status,
				"division": web.Fallback(web.String(r.Division), "-"), "position": web.Fallback(web.String(r.Position), "-"), "avatar": web.String(r.Avatar),
				"joinDate": web.Fallback(dateString(r.JoinDate, "2/1/2006"), "-"), "probationDaysLeft": days})
		}
		web.OK(c, 200, "Employees fetched successfully", result)
	}
}

func detail(db *gorm.DB, employeeID string) (employeeRow, error) {
	var row employeeRow
	err := db.Table(`"Employee" AS e`).Select(`e.*,d.name AS division,p.name AS position,m.name AS manager_name,
		u."roleId" AS role_id,COALESCE(u."mustChangePassword",false) AS must_change_password,u."lockedUntil" AS locked_until`).Joins(joins).
		Joins(`LEFT JOIN "Employee" AS m ON m.id=e."managerId" LEFT JOIN "User" AS u ON u.id=e."userId"`).Where("e.id = ?", employeeID).Take(&row).Error
	return row, err
}

func detailHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		r, err := detail(db.WithContext(c.Request.Context()), c.Param("id"))
		if err != nil {
			web.Fail(c, err)
			return
		}
		var account *identity.AccountInfo
		if r.UserID != nil {
			account = web.Ptr(identity.AccountStatus(*r.UserID, r.MustChangePassword, r.LockedUntil, &r.Status))
		}
		web.OK(c, 200, "Employee fetched", gin.H{
			"id": r.ID, "name": r.Name, "email": r.Email, "nip": web.String(r.NIP), "joinDate": dateString(r.JoinDate, time.DateOnly), "status": r.Status, "employmentType": r.EmploymentType,
			"salaryBase": r.SalaryBase, "leaveQuota": r.LeaveQuota, "ptkpStatus": r.PTKPStatus, "bpjsKesehatan": r.BPJSKesehatan, "bpjsKetenagakerjaan": r.BPJSKetenagakerjaan,
			"departmentId": r.DepartmentID, "positionId": r.PositionID, "managerId": r.ManagerID, "avatar": r.Avatar, "phone": r.Phone, "address": r.Address, "gender": r.Gender,
			"birthDate": dateString(r.BirthDate, time.DateOnly), "placeOfBirth": r.PlaceOfBirth, "identityNumber": r.IdentityNumber, "bio": r.Bio, "bankName": r.BankName,
			"bankAccount": r.BankAccount, "bankHolderName": r.BankHolderName, "npwpNumber": r.NPWPNumber, "emergencyName": r.EmergencyName, "emergencyPhone": r.EmergencyPhone,
			"emergencyRelation": r.EmergencyRelation, "education": r.Education, "skills": r.Skills, "account": account, "roleId": web.String(r.RoleID),
			"division": web.Fallback(web.String(r.Division), "-"), "position": web.Fallback(web.String(r.Position), "-"), "managerName": r.ManagerName,
		})
	}
}

func historyHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tx := db.WithContext(c.Request.Context())
		id := c.Param("id")
		current := time.Now().In(web.Jakarta)
		start := time.Date(current.Year(), current.Month(), 1, 0, 0, 0, 0, time.UTC)
		end := start.AddDate(0, 1, 0)
		var attendance struct {
			Present, Late, EarlyLeave, LateMinutes int
			OvertimeHours                          float64
		}
		err := tx.Table(`"Attendance"`).Where(`"employeeId" = ? AND date >= ? AND date < ?`, id, start, end).
			Select(`count(*) FILTER (WHERE status IN ('PRESENT','LATE','EARLY_LEAVE')) AS present,count(*) FILTER (WHERE status='LATE') AS late,
		count(*) FILTER (WHERE status='EARLY_LEAVE') AS early_leave,COALESCE(sum("lateInMinutes"),0) AS late_minutes,COALESCE(sum("overtimeHours"),0) AS overtime_hours`).Scan(&attendance).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		var leaveDays int
		err = tx.Raw(`SELECT COALESCE(sum(duration),0) FROM "LeaveRequest" WHERE "employeeId"=? AND status='HR_APPROVED' AND "startDate">=? AND "startDate"<?`, id, start, end).Scan(&leaveDays).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		leaveRows, err := leaveHistory(tx, id, 5)
		if err != nil {
			web.Fail(c, err)
			return
		}
		salaryRows, err := salaryHistory(tx, id, 6)
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Riwayat karyawan", gin.H{"attendance": gin.H{"periodLabel": web.Period(current.Year(), current.Month()), "present": attendance.Present, "late": attendance.Late,
			"earlyLeave": attendance.EarlyLeave, "lateMinutes": attendance.LateMinutes, "overtimeHours": math.Round(attendance.OvertimeHours*10) / 10, "leaveDays": leaveDays}, "leaves": leaveRows, "salaries": salaryRows})
	}
}
