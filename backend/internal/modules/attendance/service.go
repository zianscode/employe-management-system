package attendance

import (
	"database/sql"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type approved struct {
	EmployeeID         string
	Type               string
	StartDate, EndDate time.Time
}

func approvedBetween(db *gorm.DB, ids []string, start, end time.Time) ([]approved, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	var rows []approved
	err := db.Table(`"LeaveRequest"`).Select(`"employeeId" AS employee_id,type,"startDate" AS start_date,"endDate" AS end_date`).
		Where(`"employeeId" IN ? AND status='HR_APPROVED' AND "startDate" <= ? AND "endDate" >= ?`, ids, end, start).
		Order(`"createdAt" ASC,id`).Find(&rows).Error
	return rows, err
}

func recordFor(db *gorm.DB, employeeID string, date time.Time) (Attendance, error) {
	var row Attendance
	err := db.Where(`"employeeId" = ? AND date = ?`, employeeID, date).Take(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = nil
	}
	return row, err
}

func recordFields(row Attendance) map[string]any {
	return map[string]any{"checkIn": row.CheckIn, "checkOut": row.CheckOut, "status": row.Status, "lateInMinutes": row.LateInMinutes,
		"workHours": row.WorkHours, "overtimeHours": row.OvertimeHours, "isOvertime": row.IsOvertime}
}

func MyToday(db *gorm.DB, id string, now time.Time) (gin.H, error) {
	var result gin.H
	date := workday.Date(now)
	err := db.Transaction(func(tx *gorm.DB) error {
		schedule, err := settings.AttendanceSchedule(tx)
		if err != nil {
			return err
		}
		row, err := recordFor(tx, id, date)
		if err != nil {
			return err
		}
		leaves, err := approvedBetween(tx, []string{id}, date, date)
		if err != nil {
			return err
		}
		status := web.Fallback(row.Status, "NOT_YET")
		if row.ID == "" && len(leaves) > 0 {
			status = leaveStatus(leaves[0].Type)
		}
		var in, out *string
		if row.CheckIn != nil {
			in = web.Ptr(workday.Clock(*row.CheckIn))
		}
		if row.CheckOut != nil {
			out = web.Ptr(workday.Clock(*row.CheckOut))
		}
		result = gin.H{"date": workday.Display(date), "checkIn": in, "checkOut": out, "status": status, "lateInMinutes": row.LateInMinutes,
			"workStartTime": schedule.WorkStartTime, "workEndTime": schedule.WorkEndTime, "lateToleranceMinutes": schedule.LateToleranceMinutes, "onLeave": len(leaves) > 0}
		return nil
	}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
	return result, err
}

func punch(db *gorm.DB, id string, in bool) (Attendance, error) {
	var row Attendance
	err := db.Transaction(func(tx *gorm.DB) error {
		employee, err := employees.LockWork(tx, id)
		if err != nil {
			return err
		}
		if !employees.WorkActive(employee.Status) {
			return web.Forbidden("Karyawan tidak aktif")
		}
		now := time.Now().UTC().Truncate(time.Millisecond)
		date := workday.Date(now)
		schedule, err := settings.AttendanceSchedule(tx)
		if err != nil {
			return err
		}
		if in {
			leave, err := approvedBetween(tx, []string{id}, date, date)
			if err != nil {
				return err
			}
			if len(leave) > 0 {
				return web.Conflict("Anda sedang cuti hari ini")
			}
			row = Attendance{ID: uuid.NewString(), EmployeeID: id, Date: date, CheckIn: &now}
			evaluate(&row, schedule)
			result := tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "employeeId"}, {Name: "date"}}, DoNothing: true}).Create(&row)
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return web.Conflict("Anda sudah check-in hari ini")
			}
			return nil
		}
		row, err = recordFor(tx, id, date)
		if err != nil {
			return err
		}
		if row.CheckIn == nil {
			return web.Conflict("Anda belum check-in hari ini")
		}
		if row.CheckOut != nil {
			return web.Conflict("Anda sudah check-out hari ini")
		}
		if !now.After(*row.CheckIn) {
			return web.Conflict("Jam pulang harus setelah jam masuk")
		}
		row.CheckOut = &now
		evaluate(&row, schedule)
		return tx.Model(&row).Updates(recordFields(row)).Error
	})
	return row, err
}

type staff struct {
	ID, Name string
	NIP      *string `gorm:"column:nip"`
	Division *string
	JoinDate *time.Time
}
type periodData struct {
	staff     []staff
	records   map[string]map[time.Time]Attendance
	leaves    map[string][]approved
	holidays  map[time.Time]bool
	today     time.Time
	todayOver bool
}

func loadPeriod(db *gorm.DB, actor identity.Actor, start, end, now time.Time) (periodData, error) {
	data := periodData{today: workday.Date(now), records: map[string]map[time.Time]Attendance{}, leaves: map[string][]approved{}}
	err := db.Transaction(func(tx *gorm.DB) error {
		staffQuery := tx.Table(`"Employee" AS e`).Select(`e.id,e.name,e.nip,e."joinDate" AS join_date,d.name AS division`).
			Joins(`LEFT JOIN "Department" AS d ON d.id=e."departmentId"`).
			Where(`(e.status IN ('ACTIVE','PROBATION') OR EXISTS (SELECT 1 FROM "Attendance" a WHERE a."employeeId"=e.id AND a.date BETWEEN ? AND ?))`, start, end).
			Order("e.name ASC,e.id ASC")
		if err := employees.WorkScope(staffQuery, actor).Find(&data.staff).Error; err != nil {
			return err
		}
		if len(data.staff) == 0 {
			return nil
		}
		ids := make([]string, 0, len(data.staff))
		for _, person := range data.staff {
			ids = append(ids, person.ID)
		}
		var rows []Attendance
		if err := tx.Where(`"employeeId" IN ? AND date BETWEEN ? AND ?`, ids, start, end).Find(&rows).Error; err != nil {
			return err
		}
		for _, row := range rows {
			if data.records[row.EmployeeID] == nil {
				data.records[row.EmployeeID] = map[time.Time]Attendance{}
			}
			data.records[row.EmployeeID][row.Date.UTC()] = row
		}
		leaves, err := approvedBetween(tx, ids, start, end)
		if err != nil {
			return err
		}
		for _, row := range leaves {
			data.leaves[row.EmployeeID] = append(data.leaves[row.EmployeeID], row)
		}
		data.holidays, err = settings.HolidayDates(tx, start, end)
		if err != nil {
			return err
		}
		if !data.today.Before(start) && !data.today.After(end) {
			schedule, err := settings.AttendanceSchedule(tx)
			if err != nil {
				return err
			}
			data.todayOver = workday.Minutes(now) > minutes(schedule.WorkEndTime)
		}
		return nil
	}, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
	return data, err
}

func (data periodData) onDate(person staff, date time.Time) (Attendance, string, bool) {
	row, exists := data.records[person.ID][date]
	if exists {
		return row, row.Status, false
	}
	var kind string
	for _, leave := range data.leaves[person.ID] {
		if !date.Before(leave.StartDate) && !date.After(leave.EndDate) {
			kind = leave.Type
			break
		}
	}
	return row, classify(date, person.JoinDate, kind, date.Before(data.today) || (date.Equal(data.today) && data.todayOver), data.holidays), kind != ""
}

func daily(db *gorm.DB, actor identity.Actor, date, now time.Time) ([]gin.H, error) {
	data, err := loadPeriod(db, actor, date, date, now)
	if err != nil {
		return nil, err
	}
	result := make([]gin.H, 0, len(data.staff))
	for _, person := range data.staff {
		row, status, leave := data.onDate(person, date)
		if status == "" {
			continue
		}
		notes := []string{}
		if row.LateInMinutes > 0 {
			notes = append(notes, fmt.Sprintf("Terlambat %d menit", row.LateInMinutes))
		}
		if row.IsOvertime {
			notes = append(notes, "Lembur "+strconv.FormatFloat(row.OvertimeHours, 'f', -1, 64)+" jam")
		}
		if leave {
			notes = append(notes, "Cuti disetujui")
		}
		result = append(result, gin.H{"employeeId": person.ID, "nip": web.Fallback(web.String(person.NIP), "-"), "nama": person.Name, "tanggal": workday.Display(date),
			"jamMasuk": workday.ClockOr(row.CheckIn, "-"), "jamKeluar": workday.ClockOr(row.CheckOut, "-"), "jamKerja": workHours(row.WorkHours), "status": status, "keterangan": strings.Join(notes, ", ")})
	}
	return result, nil
}

type Totals struct {
	Present    int `json:"hadir"`
	Late       int `json:"terlambat"`
	Permission int `json:"izin"`
	Sick       int `json:"sakit"`
	Absent     int `json:"alpha"`
}

func (t *Totals) add(status string) {
	switch status {
	case "PRESENT", "EARLY_LEAVE":
		t.Present++
	case "LATE":
		t.Present++
		t.Late++
	case "PERMISSION":
		t.Permission++
	case "SICK":
		t.Sick++
	case "ABSENT":
		t.Absent++
	}
}

type MonthlyRow struct {
	Totals
	EmployeeID  string  `json:"employeeId"`
	NIP         string  `json:"nip"`
	Name        string  `json:"nama"`
	Division    string  `json:"divisi"`
	LateMinutes int64   `json:"menitTerlambat"`
	Overtime    float64 `json:"jamLembur"`
}

type MonthlySummary struct {
	Rows           []MonthlyRow `json:"rows"`
	Totals         Totals       `json:"totals"`
	AttendanceRate int          `json:"attendanceRate"`
}

func Monthly(db *gorm.DB, actor identity.Actor, start, end, now time.Time) (MonthlySummary, error) {
	data, err := loadPeriod(db, actor, start, end, now)
	if err != nil {
		return MonthlySummary{}, err
	}
	rows := make([]MonthlyRow, 0, len(data.staff))
	var total Totals
	last := end
	if data.today.Before(end) {
		last = data.today
	}
	for _, person := range data.staff {
		current := MonthlyRow{EmployeeID: person.ID, NIP: web.Fallback(web.String(person.NIP), "-"), Name: person.Name, Division: web.Fallback(web.String(person.Division), "-")}
		for day := start; !day.After(last); day = day.AddDate(0, 0, 1) {
			row, status, _ := data.onDate(person, day)
			current.LateMinutes += int64(row.LateInMinutes)
			current.Overtime = round2(current.Overtime + row.OvertimeHours)
			current.add(status)
			total.add(status)
		}
		rows = append(rows, current)
	}
	rate := 0
	if count := total.Present + total.Permission + total.Sick + total.Absent; count > 0 {
		rate = int(math.Round(float64(total.Present) * 100 / float64(count)))
	}
	return MonthlySummary{Rows: rows, Totals: total, AttendanceRate: rate}, nil
}
