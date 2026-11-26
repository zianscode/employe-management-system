package payroll

import (
	"fmt"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/notification"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func auditPeriod(tx *gorm.DB, actor identity.Actor, action string, month, year int) error {
	return identity.Audit(tx, actor, action, "PAYROLL_PERIOD", fmt.Sprintf("%d-%d", year, month), web.Period(year, time.Month(month)), "")
}

func markPaid(db *gorm.DB, actor identity.Actor, id string, month, year int) (int, error) {
	var count int
	err := db.Transaction(func(tx *gorm.DB) error {
		var target salaryRow
		if id != "" {
			if err := salaryQuery(tx).Where("s.id = ?", id).Take(&target).Error; err != nil {
				return err
			}
			month, year = int(target.PeriodMonth), int(target.PeriodYear)
		}
		if err := lockYear(tx, year); err != nil {
			return err
		}
		var changed []Salary
		q := tx.Model(&changed).Where(`NOT "isPaid"`).Clauses(clause.Returning{Columns: []clause.Column{{Name: "id"}}})
		if id != "" {
			q = q.Where("id = ?", id)
		} else {
			q = q.Where(`"periodMonth" = ? AND "periodYear" = ?`, month, year)
		}
		now := time.Now().UTC()
		result := q.Updates(map[string]any{"isPaid": true, "paidAt": now, "updatedAt": now})
		if result.Error != nil {
			return result.Error
		}
		count = len(changed)
		if id != "" && count == 0 {
			return web.Conflict("Slip gaji sudah dibayar")
		}
		ids := make([]string, 0, count)
		for _, row := range changed {
			ids = append(ids, row.ID)
		}
		if err := notification.SalariesPaid(tx, ids); err != nil {
			return err
		}
		if id != "" {
			name := target.Name + ", " + web.Period(year, time.Month(month))
			return identity.Audit(tx, actor, "SALARY_PAID", "SALARY", id, name, "")
		}
		return auditPeriod(tx, actor, "PAYROLL_PERIOD_PAID", month, year)
	})
	return count, err
}
