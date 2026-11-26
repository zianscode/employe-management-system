package reports

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/payroll"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const trendMonths = 6

func previousMonths(start time.Time) []time.Time {
	periods := make([]time.Time, trendMonths)
	for i := range periods {
		periods[i] = start.AddDate(0, i-trendMonths+1, 0)
	}
	return periods
}

type groupedSalary struct {
	PeriodMonth, PeriodYear int
	Total                   int64
}

func salaryGroups(db *gorm.DB) *gorm.DB {
	return db.Model(&payroll.Salary{}).Select(`"periodMonth" AS period_month,"periodYear" AS period_year, SUM("totalNet") AS total`).
		Group(`"periodYear","periodMonth"`)
}

func salaryTrend(db *gorm.DB, actor identity.Actor) ([]gin.H, error) {
	q := salaryGroups(db).Order(`"periodYear" DESC,"periodMonth" DESC`).Limit(trendMonths)
	if !identity.IsAdmin(actor.Role) {
		if actor.EmployeeID == nil {
			return []gin.H{}, nil
		}
		q = q.Where(`"employeeId"=?`, *actor.EmployeeID)
	}
	var rows []groupedSalary
	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	result := make([]gin.H, 0, len(rows))
	for i := len(rows) - 1; i >= 0; i-- {
		row := rows[i]
		result = append(result, gin.H{"month": fmt.Sprintf("%d/%d", row.PeriodMonth, row.PeriodYear), "total": row.Total})
	}
	return result, nil
}

type departmentCount struct {
	Name  string `json:"name"`
	Count int64  `json:"count"`
}

func departmentDistribution(db *gorm.DB) ([]departmentCount, error) {
	rows := make([]departmentCount, 0)
	err := db.Table(`"Department" AS d`).Select("d.name,count(*) AS count").
		Joins(`JOIN "Employee" AS e ON e."departmentId"=d.id AND e.status IN ('ACTIVE','PROBATION')`).
		Group("d.id,d.name").Order(`d."createdAt",d.id`).Scan(&rows).Error
	return rows, err
}

type attendanceTrend struct {
	Label string `json:"label"`
	attendance.Totals
}
type attendanceData struct {
	attendance.MonthlySummary
	Trend []attendanceTrend `json:"trend"`
}

func attendanceReport(db *gorm.DB, actor identity.Actor, start time.Time) (attendanceData, error) {
	var result attendanceData
	now := time.Now()
	result.Trend = make([]attendanceTrend, 0, trendMonths)
	for _, period := range previousMonths(start) {
		monthly, err := attendance.Monthly(db, actor, period, period.AddDate(0, 1, -1), now)
		if err != nil {
			return result, err
		}
		result.MonthlySummary = monthly
		result.Trend = append(result.Trend, attendanceTrend{period.Format("01/2006"), monthly.Totals})
	}
	return result, nil
}

type salaryDepartment struct {
	Division  string `json:"divisi"`
	Employees int    `json:"jumlahKaryawan"`
	Gross     int64  `json:"totalGross"`
	Net       int64  `json:"totalNet"`
}
type salaryData struct {
	Totals      map[string]int64    `json:"totals"`
	Departments []*salaryDepartment `json:"byDepartment"`
	Trend       []gin.H             `json:"trend"`
}

func salaryReport(db *gorm.DB, start time.Time) (salaryData, error) {
	var rows []struct {
		payroll.Salary
		Department *string
	}
	err := db.Table(`"Salary" AS s`).Select(`s."isPaid",s."totalGross",s."totalNet",s."overtimePay",s.deductions,s."unpaidLeaveCut",s.pph21,
		s."bpjsKesEmployee",s."bpjsKesEmployer",s."jhtEmployee",s."jhtEmployer",s."jpEmployee",s."jpEmployer",s."jkkEmployer",s."jkmEmployer",d.name AS department`).
		Joins(`JOIN "Employee" AS e ON e.id=s."employeeId" LEFT JOIN "Department" AS d ON d.id=e."departmentId"`).
		Where(`s."periodMonth"=? AND s."periodYear"=?`, int(start.Month()), start.Year()).Order("s.id").Find(&rows).Error
	if err != nil {
		return salaryData{}, err
	}
	totals := map[string]int64{"slip": int64(len(rows)), "dibayar": 0, "pending": 0, "totalGross": 0, "totalNet": 0, "totalLembur": 0, "totalPotongan": 0,
		"totalPph21": 0, "totalBpjsKaryawan": 0, "totalBpjsPerusahaan": 0}
	deptMap := map[string]*salaryDepartment{}
	for _, row := range rows {
		division := web.Fallback(web.String(row.Department), "Tanpa Divisi")
		group := deptMap[division]
		if group == nil {
			group = &salaryDepartment{Division: division}
			deptMap[division] = group
		}
		group.Employees++
		group.Gross += int64(row.TotalGross)
		group.Net += int64(row.TotalNet)
		if row.IsPaid {
			totals["dibayar"]++
		} else {
			totals["pending"]++
		}
		totals["totalGross"] += int64(row.TotalGross)
		totals["totalNet"] += int64(row.TotalNet)
		totals["totalLembur"] += int64(row.OvertimePay)
		totals["totalPotongan"] += int64(row.Deductions) + int64(row.UnpaidLeaveCut)
		totals["totalPph21"] += int64(row.PPh21)
		totals["totalBpjsKaryawan"] += int64(row.BPJSKesEmployee) + int64(row.JHTEmployee) + int64(row.JPEmployee)
		totals["totalBpjsPerusahaan"] += int64(row.BPJSKesEmployer) + int64(row.JHTEmployer) + int64(row.JPEmployer) + int64(row.JKKEmployer) + int64(row.JKMEmployer)
	}
	departments := make([]*salaryDepartment, 0, len(deptMap))
	for _, row := range deptMap {
		departments = append(departments, row)
	}
	sort.Slice(departments, func(i, j int) bool {
		if departments[i].Net == departments[j].Net {
			return departments[i].Division < departments[j].Division
		}
		return departments[i].Net > departments[j].Net
	})
	periods := previousMonths(start)
	first := periods[0]
	var groups []groupedSalary
	err = salaryGroups(db).Where(`("periodYear","periodMonth") BETWEEN (?,?) AND (?,?)`,
		first.Year(), int(first.Month()), start.Year(), int(start.Month())).Scan(&groups).Error
	if err != nil {
		return salaryData{}, err
	}
	amounts := make(map[[2]int]int64, len(groups))
	for _, row := range groups {
		amounts[[2]int{row.PeriodYear, row.PeriodMonth}] = row.Total
	}
	trend := make([]gin.H, 0, len(periods))
	for _, period := range periods {
		trend = append(trend, gin.H{"label": period.Format("01/2006"), "total": amounts[[2]int{period.Year(), int(period.Month())}]})
	}
	return salaryData{totals, departments, trend}, nil
}

type count struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}

type counts struct {
	list    []count
	indexes map[string]int
}

func newCounts() counts { return counts{list: []count{}, indexes: map[string]int{}} }
func (c *counts) add(label string) {
	if i, ok := c.indexes[label]; ok {
		c.list[i].Value++
		return
	}
	c.indexes[label] = len(c.list)
	c.list = append(c.list, count{label, 1})
}
func (c counts) sorted() []count {
	sort.SliceStable(c.list, func(i, j int) bool { return c.list[i].Value > c.list[j].Value })
	return c.list
}

type employeeReportRow struct {
	NIP      string `json:"nip"`
	Name     string `json:"nama"`
	Division string `json:"divisi"`
	Position string `json:"jabatan"`
	Status   string `json:"status"`
	Joined   string `json:"tanggalMasuk"`
	Notes    string `json:"keterangan"`
}
type employeeData struct {
	Totals       map[string]int      `json:"totals"`
	ByStatus     []count             `json:"byStatus"`
	ByDepartment []count             `json:"byDepartment"`
	ByEmployment []count             `json:"byEmploymentType"`
	Rows         []employeeReportRow `json:"rows"`
}

func employeeReport(db *gorm.DB, actor identity.Actor, start, end time.Time) (employeeData, error) {
	var people []struct {
		employees.Employee
		Department, Position *string
	}
	q := db.Table(`"Employee" AS e`).Select("e.*,d.name AS department,p.name AS position").
		Joins(`LEFT JOIN "Department" AS d ON d.id=e."departmentId" LEFT JOIN "Position" AS p ON p.id=e."positionId"`).
		Order("e.name,e.id")
	if err := employees.WorkScope(q, actor).Find(&people).Error; err != nil {
		return employeeData{}, err
	}
	totals := map[string]int{"total": 0, "aktif": 0, "percobaan": 0, "baru": 0}
	statuses, departments, employment := newCounts(), newCounts(), newCounts()
	rows := make([]employeeReportRow, 0, len(people))
	today := workday.Date(time.Now())
	for _, person := range people {
		status := employees.StatusLabel(person.Status)
		statuses.add(status)
		if employees.WorkActive(person.Status) {
			totals["total"]++
			if person.Status == "ACTIVE" {
				totals["aktif"]++
			} else {
				totals["percobaan"]++
			}
			departments.add(web.Fallback(web.String(person.Department), "Tanpa Divisi"))
			employment.add(strings.Replace(person.EmploymentType, "_", " ", 1))
		}
		joined := "-"
		notes := []string{}
		if person.JoinDate != nil {
			joined = workday.Display(*person.JoinDate)
			if !person.JoinDate.Before(start) && !person.JoinDate.After(end) {
				totals["baru"]++
				notes = append(notes, "Karyawan baru bulan ini")
			}
			if person.Status == "PROBATION" {
				expires := workday.Date(*person.JoinDate).AddDate(0, 3, 0)
				days := int((expires.Unix() - today.Unix()) / 86400)
				note := "Masa percobaan selesai, perlu ditinjau"
				if days > 0 {
					note = fmt.Sprintf("Percobaan berakhir %d hari lagi", days)
				}
				notes = append(notes, note)
			}
		}
		rows = append(rows, employeeReportRow{web.Fallback(web.String(person.NIP), "-"), person.Name,
			web.Fallback(web.String(person.Department), "-"), web.Fallback(web.String(person.Position), "-"), status, joined, strings.Join(notes, "; ")})
	}
	return employeeData{totals, statuses.sorted(), departments.sorted(), employment.sorted(), rows}, nil
}

type leaveReportRow struct {
	NIP       string `json:"nip"`
	Name      string `json:"nama"`
	Annual    int    `json:"tahunan"`
	Sick      int    `json:"sakit"`
	Emergency int    `json:"penting"`
	Unpaid    int    `json:"diluarTanggungan"`
	Total     int    `json:"total"`
}
type leaveData struct {
	Totals map[string]int    `json:"totals"`
	ByType []count           `json:"byType"`
	Rows   []*leaveReportRow `json:"rows"`
}

func leaveReport(db *gorm.DB, actor identity.Actor, start, end time.Time) (leaveData, error) {
	var requests []struct {
		EmployeeID, Name, Type, Status string
		NIP                            *string `gorm:"column:nip"`
		StartDate, EndDate             time.Time
	}
	q := db.Table(`"LeaveRequest" AS l`).Select(`e.id AS employee_id,e.name,e.nip,l.type,l.status,l."startDate" AS start_date,l."endDate" AS end_date`).
		Joins(`JOIN "Employee" AS e ON e.id=l."employeeId"`).Where(`l."startDate"<=? AND l."endDate">=?`, end, start).Order("e.name,e.id,l.id")
	if err := employees.WorkScope(q, actor).Find(&requests).Error; err != nil {
		return leaveData{}, err
	}
	holidays, err := settings.HolidayDates(db, start, end)
	if err != nil {
		return leaveData{}, err
	}
	totals := map[string]int{"pengajuan": len(requests), "disetujui": 0, "menunggu": 0, "ditolak": 0, "hariCuti": 0}
	grouped := make(map[string]*leaveReportRow)
	rows := make([]*leaveReportRow, 0)
	byType := []count{{"Cuti Tahunan", 0}, {"Sakit", 0}, {"Izin Penting", 0}, {"Diluar Tanggungan", 0}}
	for _, request := range requests {
		switch request.Status {
		case "PENDING", "MANAGER_APPROVED":
			totals["menunggu"]++
		case "REJECTED":
			totals["ditolak"]++
		case "HR_APPROVED":
			totals["disetujui"]++
			from, to := request.StartDate.UTC(), request.EndDate.UTC()
			if from.Before(start) {
				from = start
			}
			if to.After(end) {
				to = end
			}
			days := workday.Count(from, to, holidays)
			row := grouped[request.EmployeeID]
			if row == nil {
				row = &leaveReportRow{NIP: web.Fallback(web.String(request.NIP), "-"), Name: request.Name}
				grouped[request.EmployeeID] = row
				rows = append(rows, row)
			}
			switch request.Type {
			case "ANNUAL":
				row.Annual += days
				byType[0].Value += days
			case "SICK":
				row.Sick += days
				byType[1].Value += days
			case "EMERGENCY":
				row.Emergency += days
				byType[2].Value += days
			case "UNPAID":
				row.Unpaid += days
				byType[3].Value += days
			}
			row.Total += days
			totals["hariCuti"] += days
		}
	}
	sort.SliceStable(rows, func(i, j int) bool { return rows[i].Total > rows[j].Total })
	return leaveData{totals, byType, rows}, nil
}
