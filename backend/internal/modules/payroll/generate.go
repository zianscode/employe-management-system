package payroll

import (
	"encoding/json"
	"math"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type componentSnapshot struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Amount int32  `json:"amount"`
}

type payrollInputs struct {
	components    []componentSnapshot
	overtimeHours float64
	unpaidDays    int
	previous      priorTax
}

type generation struct {
	Processed   int `json:"processed"`
	SkippedPaid int `json:"skippedPaid"`
}

func lockYear(tx *gorm.DB, year int) error {
	// December depends on all earlier slips for the year.
	return tx.Exec("SELECT pg_advisory_xact_lock(430001, ?)", year).Error
}

func compute(person employees.Employee, cfg settings.CompanySetting, month, year int, input payrollInputs) (Salary, error) {
	if cfg.WorkingDaysPerMonth <= 0 || math.IsNaN(input.overtimeHours) || math.IsInf(input.overtimeHours, 0) {
		return Salary{}, web.Invalid("Dasar perhitungan gaji tidak valid")
	}
	base := int64(person.SalaryBase)
	var allowance, deduction int64
	for _, item := range input.components {
		switch item.Type {
		case "ALLOWANCE":
			allowance += int64(item.Amount)
		case "DEDUCTION":
			deduction += int64(item.Amount)
		}
	}
	rawOvertime := input.overtimeHours * float64(cfg.OvertimeRatePerHour)
	if math.Abs(rawOvertime) > float64(math.MaxInt32)+1 {
		return Salary{}, web.Invalid("Nominal gaji berada di luar batas penyimpanan")
	}
	overtime := round(rawOvertime)
	unpaid := round(float64(base) / float64(cfg.WorkingDaysPerMonth) * float64(input.unpaidDays))
	bpjs := calculateBPJS(base+allowance, cfg, person.BPJSKesehatan, person.BPJSKetenagakerjaan)
	gross := base + allowance + overtime
	taxable := gross - unpaid + bpjs.jkkEmployer + bpjs.jkmEmployer + bpjs.healthEmployer
	profile, exists := taxProfiles[person.PTKPStatus]
	if !exists {
		return Salary{}, web.Invalid("Status PTKP tidak valid")
	}
	tax, method := monthlyTax(profile, taxable)
	if month == 12 {
		prev := input.previous
		tax, method = annualTax(profile, prev.Income+taxable, prev.Pension+bpjs.jhtEmployee+bpjs.jpEmployee, prev.Months+1, prev.Withheld)
	}
	net := gross - unpaid - deduction - bpjs.healthEmployee - bpjs.jhtEmployee - bpjs.jpEmployee - tax
	for _, amount := range []int64{allowance, deduction, overtime, unpaid,
		bpjs.healthEmployee, bpjs.healthEmployer, bpjs.jhtEmployee, bpjs.jhtEmployer, bpjs.jpEmployee, bpjs.jpEmployer, bpjs.jkkEmployer, bpjs.jkmEmployer,
		gross, taxable, tax, net} {
		if amount < math.MinInt32 || amount > math.MaxInt32 {
			return Salary{}, web.Invalid("Nominal gaji berada di luar batas penyimpanan")
		}
	}
	components := input.components
	if components == nil {
		components = []componentSnapshot{}
	}
	snapshot, err := json.Marshal(components)
	if err != nil {
		return Salary{}, err
	}
	data := json.RawMessage(snapshot)
	return Salary{ID: uuid.NewString(), EmployeeID: person.ID, PeriodMonth: int32(month), PeriodYear: int32(year),
		BasicSalary: person.SalaryBase, Allowances: int32(allowance), Deductions: int32(deduction),
		OvertimePay: int32(overtime), UnpaidLeaveCut: int32(unpaid),
		BPJSKesEmployee: int32(bpjs.healthEmployee), BPJSKesEmployer: int32(bpjs.healthEmployer),
		JHTEmployee: int32(bpjs.jhtEmployee), JHTEmployer: int32(bpjs.jhtEmployer),
		JPEmployee: int32(bpjs.jpEmployee), JPEmployer: int32(bpjs.jpEmployer),
		JKKEmployer: int32(bpjs.jkkEmployer), JKMEmployer: int32(bpjs.jkmEmployer),
		PTKPStatus: &person.PTKPStatus, TaxableIncome: int32(taxable), PPh21: int32(tax), PPh21Method: &method,
		Components: &data, TotalGross: int32(gross), TotalNet: int32(net)}, nil
}

func loadInputs(tx *gorm.DB, peopleIDs []string, start, end time.Time) (map[string]payrollInputs, error) {
	inputs := make(map[string]payrollInputs, len(peopleIDs))
	var components []PayrollComponent
	if err := tx.Where(`"employeeId" IN ?`, peopleIDs).Order(`"createdAt",id`).Find(&components).Error; err != nil {
		return nil, err
	}
	for _, row := range components {
		current := inputs[row.EmployeeID]
		current.components = append(current.components, componentSnapshot{row.Name, row.Type, row.Amount})
		inputs[row.EmployeeID] = current
	}
	var hours []struct {
		EmployeeID string
		Hours      float64
	}
	err := tx.Table(`"Attendance"`).Select(`"employeeId" AS employee_id, COALESCE(sum("overtimeHours"),0) AS hours`).
		Where(`"employeeId" IN ? AND date BETWEEN ? AND ? AND "isOvertime"`, peopleIDs, start, end).Group(`"employeeId"`).Scan(&hours).Error
	if err != nil {
		return nil, err
	}
	for _, row := range hours {
		current := inputs[row.EmployeeID]
		current.overtimeHours = row.Hours
		inputs[row.EmployeeID] = current
	}
	holidays, err := settings.HolidayDates(tx, start, end)
	if err != nil {
		return nil, err
	}
	var leaves []struct {
		EmployeeID         string
		StartDate, EndDate time.Time
	}
	err = tx.Table(`"LeaveRequest"`).Select(`"employeeId" AS employee_id,"startDate" AS start_date,"endDate" AS end_date`).
		Where(`"employeeId" IN ? AND type='UNPAID' AND status='HR_APPROVED' AND "startDate"<=? AND "endDate">=?`, peopleIDs, end, start).Find(&leaves).Error
	if err != nil {
		return nil, err
	}
	for _, row := range leaves {
		from, to := row.StartDate.UTC(), row.EndDate.UTC()
		if from.Before(start) {
			from = start
		}
		if to.After(end) {
			to = end
		}
		current := inputs[row.EmployeeID]
		current.unpaidDays += workday.Count(from, to, holidays)
		inputs[row.EmployeeID] = current
	}
	if start.Month() != time.December {
		return inputs, nil
	}
	var prior []struct {
		EmployeeID string
		PriorTax   priorTax `gorm:"embedded"`
	}
	err = tx.Model(&Salary{}).Select(`"employeeId" AS employee_id, sum("taxableIncome") AS income, sum("jhtEmployee"::bigint+"jpEmployee") AS pension, sum(pph21) AS withheld, count(*) AS months`).
		Where(`"employeeId" IN ? AND "periodYear"=? AND "periodMonth"<12`, peopleIDs, start.Year()).Group(`"employeeId"`).Scan(&prior).Error
	if err != nil {
		return nil, err
	}
	for _, row := range prior {
		current := inputs[row.EmployeeID]
		current.previous = row.PriorTax
		inputs[row.EmployeeID] = current
	}
	return inputs, nil
}

func generate(db *gorm.DB, actor identity.Actor, month, year int) (generation, error) {
	start, end := workday.Month(month, year)
	var result generation
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := lockYear(tx, year); err != nil {
			return err
		}
		cfg, err := settings.Company(tx.Clauses(clause.Locking{Strength: "SHARE"}))
		if err != nil {
			return err
		}
		var people []employees.Employee
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("status IN ('ACTIVE','PROBATION')").Order("id").Find(&people).Error; err != nil {
			return err
		}
		var paidIDs []string
		if err := tx.Model(&Salary{}).Where(`"periodMonth"=? AND "periodYear"=? AND "isPaid"`, month, year).Pluck(`"employeeId"`, &paidIDs).Error; err != nil {
			return err
		}
		paid := make(map[string]bool, len(paidIDs))
		for _, id := range paidIDs {
			paid[id] = true
		}
		ids := make([]string, 0, len(people))
		for _, person := range people {
			if paid[person.ID] {
				result.SkippedPaid++
				continue
			}
			ids = append(ids, person.ID)
		}
		if len(ids) > 0 {
			inputs, err := loadInputs(tx, ids, start, end)
			if err != nil {
				return err
			}
			rows := make([]Salary, 0, len(ids))
			for _, person := range people {
				if paid[person.ID] {
					continue
				}
				row, err := compute(person, cfg, month, year, inputs[person.ID])
				if err != nil {
					return err
				}
				rows = append(rows, row)
			}
			write := tx.Clauses(clause.OnConflict{
				Columns: []clause.Column{{Name: "employeeId"}, {Name: "periodMonth"}, {Name: "periodYear"}},
				DoUpdates: clause.AssignmentColumns([]string{"basicSalary", "allowances", "deductions", "overtimePay", "unpaidLeaveCut",
					"bpjsKesEmployee", "bpjsKesEmployer", "jhtEmployee", "jhtEmployer", "jpEmployee", "jpEmployer", "jkkEmployer", "jkmEmployer",
					"ptkpStatus", "taxableIncome", "pph21", "pph21Method", "components", "totalGross", "totalNet", "updatedAt"}),
				Where: clause.Where{Exprs: []clause.Expression{clause.Expr{SQL: `NOT "Salary"."isPaid"`}}},
			}).CreateInBatches(&rows, 250)
			if write.Error != nil {
				return write.Error
			}
			result.Processed = int(write.RowsAffected)
			result.SkippedPaid += len(rows) - result.Processed
		}
		return auditPeriod(tx, actor, "PAYROLL_GENERATED", month, year)
	})
	return result, err
}
