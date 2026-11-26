package reports

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(active, approver, admin *gin.RouterGroup, db *gorm.DB) {
	active.GET("/reports/salary-trend", func(c *gin.Context) {
		result, err := salaryTrend(db.WithContext(c.Request.Context()), identity.Current(c))
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Salary trend fetched", result)
	})
	approver.GET("/reports/department-distribution", func(c *gin.Context) {
		result, err := departmentDistribution(db.WithContext(c.Request.Context()))
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Department distribution fetched", result)
	})
	registerReport(approver, db, "attendance", "Laporan absensi", "absensi", func(tx *gorm.DB, actor identity.Actor, start, _ time.Time) (attendanceData, error) {
		return attendanceReport(tx, actor, start)
	}, func(r attendanceData) ([]string, [][]string) { return attendanceCSV(r.Rows) })
	registerReport(admin, db, "salary", "Laporan gaji", "gaji", func(tx *gorm.DB, _ identity.Actor, start, _ time.Time) (salaryData, error) {
		return salaryReport(tx, start)
	}, salaryCSV)
	registerReport(approver, db, "employees", "Laporan karyawan", "karyawan", employeeReport, employeeCSV)
	registerReport(approver, db, "leave", "Laporan cuti", "cuti", leaveReport, leaveCSV)
}

func registerReport[T any](
	group *gin.RouterGroup, db *gorm.DB, path, message, file string,
	load func(*gorm.DB, identity.Actor, time.Time, time.Time) (T, error),
	encode func(T) ([]string, [][]string),
) {
	handler := func(asCSV bool) gin.HandlerFunc {
		return func(c *gin.Context) {
			month, monthErr := strconv.Atoi(c.Query("month"))
			year, yearErr := strconv.Atoi(c.Query("year"))
			if monthErr != nil || yearErr != nil || month < 1 || month > 12 || year < 1 || year > 9998 {
				web.Fail(c, web.Invalid("Periode laporan tidak valid"))
				return
			}
			start, end := workday.Month(month, year)
			actor := identity.Current(c)
			db := db.WithContext(c.Request.Context())
			// CSV attendance needs only the exported month, while the report includes a six-month chart.
			if asCSV && path == "attendance" {
				result, err := attendance.Monthly(db, actor, start, end, time.Now())
				if err != nil {
					web.Fail(c, err)
					return
				}
				header, rows := attendanceCSV(result.Rows)
				web.CSV(c, "laporan-"+file+"-"+start.Format("2006-01"), header, rows)
				return
			}
			var result T
			err := db.Transaction(func(tx *gorm.DB) error {
				var err error
				result, err = load(tx, actor, start, end)
				return err
			}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
			if err != nil {
				web.Fail(c, err)
				return
			}
			if asCSV {
				header, rows := encode(result)
				web.CSV(c, "laporan-"+file+"-"+start.Format("2006-01"), header, rows)
				return
			}
			web.OK(c, 200, message, result)
		}
	}
	group.GET("/reports/"+path, handler(false))
	group.GET("/reports/"+path+".csv", handler(true))
}

func attendanceCSV(data []attendance.MonthlyRow) ([]string, [][]string) {
	header := []string{"NIP", "Nama", "Divisi", "Hadir", "Terlambat", "Izin/Cuti", "Sakit", "Tidak Hadir", "Total Menit Terlambat", "Jam Lembur"}
	rows := make([][]string, 0, len(data))
	for _, r := range data {
		rows = append(rows, []string{web.CSVText(r.NIP), web.CSVText(r.Name), web.CSVText(r.Division), strconv.Itoa(r.Present), strconv.Itoa(r.Late),
			strconv.Itoa(r.Permission), strconv.Itoa(r.Sick), strconv.Itoa(r.Absent), strconv.FormatInt(r.LateMinutes, 10), strconv.FormatFloat(r.Overtime, 'f', -1, 64)})
	}
	return header, rows
}
func salaryCSV(data salaryData) ([]string, [][]string) {
	header := []string{"Divisi", "Jumlah Karyawan", "Total Gross", "Total Net"}
	rows := make([][]string, 0, len(data.Departments))
	for _, r := range data.Departments {
		rows = append(rows, []string{web.CSVText(r.Division), strconv.Itoa(r.Employees), strconv.FormatInt(r.Gross, 10), strconv.FormatInt(r.Net, 10)})
	}
	return header, rows
}
func employeeCSV(data employeeData) ([]string, [][]string) {
	header := []string{"NIP", "Nama", "Divisi", "Jabatan", "Status", "Tanggal Masuk", "Keterangan"}
	rows := make([][]string, 0, len(data.Rows))
	for _, r := range data.Rows {
		rows = append(rows, []string{web.CSVText(r.NIP), web.CSVText(r.Name), web.CSVText(r.Division), web.CSVText(r.Position), r.Status, r.Joined, r.Notes})
	}
	return header, rows
}
func leaveCSV(data leaveData) ([]string, [][]string) {
	header := []string{"NIP", "Nama", "Cuti Tahunan", "Sakit", "Izin Penting", "Diluar Tanggungan", "Total Hari"}
	rows := make([][]string, 0, len(data.Rows))
	for _, r := range data.Rows {
		rows = append(rows, []string{web.CSVText(r.NIP), web.CSVText(r.Name), strconv.Itoa(r.Annual), strconv.Itoa(r.Sick), strconv.Itoa(r.Emergency), strconv.Itoa(r.Unpaid), strconv.Itoa(r.Total)})
	}
	return header, rows
}
