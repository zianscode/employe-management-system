package employees

import (
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func leaveHistory(db *gorm.DB, id string, limit int) ([]gin.H, error) {
	var leaves []struct {
		ID, Type, Status   string
		StartDate, EndDate time.Time
		Duration           int
		ManagerName        *string
	}
	err := db.Table(`"LeaveRequest" AS l`).Select(`l.id,l.type,l.status,l."startDate" AS start_date,l."endDate" AS end_date,l.duration,m.name AS manager_name`).
		Joins(`JOIN "Employee" AS e ON e.id=l."employeeId" LEFT JOIN "Employee" AS m ON m.id=e."managerId"`).
		Where(`l."employeeId"=?`, id).Order(`l."createdAt" DESC,l.id DESC`).Limit(limit).Find(&leaves).Error
	if err != nil {
		return nil, err
	}
	rows := make([]gin.H, 0, len(leaves))
	for _, row := range leaves {
		var next *string
		switch row.Status {
		case "PENDING":
			next = web.Ptr("Menunggu persetujuan HR")
			if name := web.String(row.ManagerName); name != "" {
				next = web.Ptr("Menunggu persetujuan atasan (" + name + ")")
			}
		case "MANAGER_APPROVED":
			next = web.Ptr("Menunggu persetujuan akhir HR")
		}
		rows = append(rows, gin.H{"id": row.ID, "type": row.Type, "startDate": workday.Display(row.StartDate),
			"endDate": workday.Display(row.EndDate), "duration": row.Duration, "status": row.Status, "nextStep": next})
	}
	return rows, nil
}

func salaryHistory(db *gorm.DB, id string, limit int) ([]gin.H, error) {
	var salaries []struct {
		ID                                string
		PeriodMonth, PeriodYear, TotalNet int
		IsPaid                            bool
	}
	err := db.Table(`"Salary"`).Select(`id,"periodMonth" AS period_month,"periodYear" AS period_year,"totalNet" AS total_net,"isPaid" AS is_paid`).
		Where(`"employeeId"=?`, id).Order(`"periodYear" DESC,"periodMonth" DESC`).Limit(limit).Find(&salaries).Error
	if err != nil {
		return nil, err
	}
	rows := make([]gin.H, 0, len(salaries))
	for _, row := range salaries {
		rows = append(rows, gin.H{"id": row.ID, "periodLabel": web.Period(row.PeriodYear, time.Month(row.PeriodMonth)), "totalNet": row.TotalNet, "isPaid": row.IsPaid})
	}
	return rows, nil
}

// Overview returns the latest leave and slip for the employee already authorized by the caller.
func Overview(db *gorm.DB, id string) (gin.H, error) {
	leaves, err := leaveHistory(db, id, 1)
	if err != nil {
		return nil, err
	}
	salaries, err := salaryHistory(db, id, 1)
	if err != nil {
		return nil, err
	}
	var latestLeave, latestSalary gin.H
	if len(leaves) > 0 {
		latestLeave = leaves[0]
	}
	if len(salaries) > 0 {
		latestSalary = salaries[0]
	}
	return gin.H{"latestLeave": latestLeave, "latestSalary": latestSalary}, nil
}
