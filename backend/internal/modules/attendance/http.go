package attendance

import (
	"fmt"
	"strconv"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(active *gin.RouterGroup, db *gorm.DB) {
	active.POST("/attendance/check-in", punchHTTP(db, true))
	active.POST("/attendance/check-out", punchHTTP(db, false))
	active.GET("/attendance/me/today", todayHTTP(db))
	active.GET("/attendance/daily", dailyHTTP(db, false))
	active.GET("/attendance/stats", dailyHTTP(db, true))
	active.GET("/attendance/monthly", monthlyHTTP(db))
	active.GET("/attendance-corrections", listCorrectionsHTTP(db))
	active.POST("/attendance-corrections", submitCorrectionHTTP(db))
	active.POST("/attendance-corrections/:id/approve", decideCorrectionHTTP(db, "APPROVED"))
	active.POST("/attendance-corrections/:id/reject", decideCorrectionHTTP(db, "REJECTED"))
	active.POST("/attendance-corrections/:id/cancel", decideCorrectionHTTP(db, "CANCELLED"))
}

func punchHTTP(db *gorm.DB, in bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := employees.WorkID(identity.Current(c))
		if err != nil {
			web.Fail(c, err)
			return
		}
		row, err := punch(db.WithContext(c.Request.Context()), id, in)
		if err != nil {
			web.Fail(c, err)
			return
		}
		message := ""
		switch {
		case in && row.Status == "LATE":
			message = fmt.Sprintf("Check-in %s (terlambat %d menit)", workday.Clock(*row.CheckIn), row.LateInMinutes)
		case in:
			message = "Check-in berhasil pukul " + workday.Clock(*row.CheckIn)
		default:
			message = "Check-out berhasil pukul " + workday.Clock(*row.CheckOut)
		}
		web.OK(c, 200, message, nil)
	}
}

func todayHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := employees.WorkID(identity.Current(c))
		if err != nil {
			web.Fail(c, err)
			return
		}
		result, err := MyToday(db.WithContext(c.Request.Context()), id, time.Now())
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Absensi hari ini", result)
	}
}

func dailyHTTP(db *gorm.DB, stats bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		now := time.Now()
		date := workday.Date(now)
		if !stats {
			value, err := web.ParseDate(c.Query("date"))
			if err != nil || value == nil {
				web.Fail(c, web.Invalid("Tanggal tidak valid"))
				return
			}
			date = *value
		}
		result, err := daily(db.WithContext(c.Request.Context()), identity.Current(c), date, now)
		if err != nil {
			web.Fail(c, err)
			return
		}
		if !stats {
			web.OK(c, 200, "Rekap absensi", result)
			return
		}
		var counts Totals
		notYet := 0
		for _, row := range result {
			status := row["status"].(string)
			counts.add(status)
			if status == "NOT_YET" {
				notYet++
			}
		}
		onLeave := ""
		if count := counts.Permission + counts.Sick; count > 0 {
			onLeave = fmt.Sprintf("%d cuti", count)
		}
		web.OK(c, 200, "Statistik absensi", []web.Stat{
			web.CardStat("Total karyawan", len(result), "neutral", ""), web.CardStat("Hadir", counts.Present, "success", ""),
			web.CardStat("Terlambat", counts.Late, "warning", ""), web.CardStat("Tidak hadir", counts.Absent+notYet, "danger", onLeave),
		})
	}
}

func monthlyHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		month, monthErr := strconv.Atoi(c.Query("month"))
		year, yearErr := strconv.Atoi(c.Query("year"))
		if monthErr != nil || yearErr != nil || month < 1 || month > 12 || year < 1 || year > 9998 {
			web.Fail(c, web.Invalid("Periode laporan tidak valid"))
			return
		}
		start, end := workday.Month(month, year)
		result, err := Monthly(db.WithContext(c.Request.Context()), identity.Current(c), start, end, time.Now())
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Rekap absensi bulanan", result)
	}
}
