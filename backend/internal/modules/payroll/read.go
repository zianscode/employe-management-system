package payroll

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type salaryRow struct {
	Salary
	Name, EmployeePTKP   string
	Position, Department *string
	NIP                  *string `gorm:"column:nip"`
	NPWP                 *string `gorm:"column:npwp"`
}

func salaryQuery(db *gorm.DB) *gorm.DB {
	return db.Table(`"Salary" AS s`).Select(`s.*,e.name,e.nip,e."ptkpStatus" AS employee_ptkp,e."npwpNumber" AS npwp,p.name AS position,d.name AS department`).
		Joins(`JOIN "Employee" AS e ON e.id=s."employeeId"
			LEFT JOIN "Position" AS p ON p.id=e."positionId" LEFT JOIN "Department" AS d ON d.id=e."departmentId"`)
}

func salaryScope(db *gorm.DB, actor identity.Actor) *gorm.DB {
	if identity.IsAdmin(actor.Role) {
		return db
	}
	if actor.EmployeeID == nil {
		return db.Where("FALSE")
	}
	return db.Where(`s."employeeId" = ?`, *actor.EmployeeID)
}

func salaryStatus(paid bool) string {
	if paid {
		return "Dibayar"
	}
	return "Pending"
}

func salaryList(db *gorm.DB, actor identity.Actor, month, year int) ([]gin.H, error) {
	var rows []salaryRow
	err := salaryScope(salaryQuery(db), actor).Where(`s."periodMonth"=? AND s."periodYear"=?`, month, year).Order("e.name,e.id").Find(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		result = append(result, gin.H{"id": row.ID, "nip": web.Fallback(web.String(row.NIP), "-"), "name": row.Name,
			"position": web.Fallback(web.String(row.Position), "-"), "basicSalary": row.BasicSalary,
			"allowance": row.Allowances, "overtimePay": row.OvertimePay, "bpjsEmployee": int64(row.BPJSKesEmployee) + int64(row.JHTEmployee) + int64(row.JPEmployee),
			"pph21": row.PPh21, "deduction": int64(row.Deductions) + int64(row.UnpaidLeaveCut), "totalSalary": row.TotalNet,
			"status": salaryStatus(row.IsPaid), "period": fmt.Sprintf("%02d/%d", row.PeriodMonth, row.PeriodYear)})
	}
	return result, nil
}

type slipLine struct {
	Label  string `json:"label"`
	Amount int32  `json:"amount"`
}

func validLines(lines []slipLine) ([]slipLine, int64) {
	result := make([]slipLine, 0, len(lines))
	var total int64
	for _, line := range lines {
		if line.Amount != 0 {
			result = append(result, line)
			total += int64(line.Amount)
		}
	}
	return result, total
}

func salarySlip(db *gorm.DB, actor identity.Actor, id string) (gin.H, error) {
	var row salaryRow
	if err := salaryScope(salaryQuery(db), actor).Where("s.id=?", id).Take(&row).Error; err != nil {
		return nil, err
	}
	cfg, err := settings.Company(db)
	if err != nil {
		return nil, err
	}
	var components []componentSnapshot
	if row.Components != nil {
		if err := json.Unmarshal(*row.Components, &components); err != nil {
			return nil, err
		}
	}
	earnings := []slipLine{{"Gaji Pokok", row.BasicSalary}}
	deductions := []slipLine{{"BPJS Kesehatan (1%)", row.BPJSKesEmployee}, {"BPJS JHT (2%)", row.JHTEmployee}, {"BPJS JP (1%)", row.JPEmployee}, {"PPh 21", row.PPh21}, {"Potongan Cuti Diluar Tanggungan", row.UnpaidLeaveCut}}
	for _, component := range components {
		switch component.Type {
		case "ALLOWANCE":
			earnings = append(earnings, slipLine{component.Name, component.Amount})
		case "DEDUCTION":
			deductions = append(deductions, slipLine{component.Name, component.Amount})
		}
	}
	earnings = append(earnings, slipLine{"Lembur", row.OvertimePay})
	earnings, totalEarnings := validLines(earnings)
	deductions, totalDeductions := validLines(deductions)
	employer, _ := validLines([]slipLine{{"BPJS Kesehatan (4%)", row.BPJSKesEmployer}, {"BPJS JHT (3,7%)", row.JHTEmployer},
		{"BPJS JP (2%)", row.JPEmployer}, {"BPJS JKK", row.JKKEmployer}, {"BPJS JKM (0,3%)", row.JKMEmployer}})
	var paidAt *string
	if row.PaidAt != nil {
		paidAt = web.Ptr(row.PaidAt.In(web.Jakarta).Format("2/1/2006"))
	}
	ptkp := web.Fallback(web.String(row.PTKPStatus), row.EmployeePTKP)
	employee := gin.H{"name": row.Name, "nip": web.Fallback(web.String(row.NIP), "-"), "position": web.Fallback(web.String(row.Position), "-"),
		"department": web.Fallback(web.String(row.Department), "-"), "ptkp": taxProfiles[ptkp].label, "npwp": row.NPWP}
	return gin.H{"id": row.ID, "companyName": cfg.CompanyName, "companyNpwp": cfg.NPWP, "periodLabel": web.Period(int(row.PeriodYear), time.Month(row.PeriodMonth)),
		"employee": employee, "earnings": earnings, "deductions": deductions, "employerContributions": employer,
		"totalEarnings": totalEarnings, "totalDeductions": totalDeductions, "netPay": row.TotalNet, "taxableIncome": row.TaxableIncome,
		"pph21Method": row.PPh21Method, "status": salaryStatus(row.IsPaid), "paidAt": paidAt}, nil
}
