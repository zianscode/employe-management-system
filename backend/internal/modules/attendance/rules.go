package attendance

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
)

func minutes(value string) int {
	hour, minute, _ := strings.Cut(value, ":")
	h, _ := strconv.Atoi(hour)
	m, _ := strconv.Atoi(minute)
	return h*60 + m
}

func round2(value float64) float64 { return math.Round(value*100) / 100 }

func evaluate(record *Attendance, schedule settings.CompanySetting) {
	lateness := workday.Minutes(*record.CheckIn) - minutes(schedule.WorkStartTime)
	record.Status, record.LateInMinutes = "PRESENT", 0
	if lateness > int(schedule.LateToleranceMinutes) {
		record.Status, record.LateInMinutes = "LATE", int32(lateness)
	}
	record.WorkHours, record.OvertimeHours, record.IsOvertime = 0, 0, false
	if record.CheckOut == nil {
		return
	}
	out := workday.Minutes(*record.CheckOut)
	scheduledEnd := minutes(schedule.WorkEndTime)
	record.WorkHours = round2(record.CheckOut.Sub(*record.CheckIn).Hours())
	record.OvertimeHours = round2(float64(max(out-scheduledEnd, 0)) / 60)
	record.IsOvertime = record.OvertimeHours > 0
	if record.Status != "LATE" && out < scheduledEnd {
		record.Status = "EARLY_LEAVE"
	}
}

func workHours(hours float64) string {
	if hours == 0 {
		return "-"
	}
	h := int(math.Floor(hours))
	m := int(math.Round((hours - float64(h)) * 60))
	if m == 0 {
		return fmt.Sprintf("%d jam", h)
	}
	return fmt.Sprintf("%d jam %d mnt", h, m)
}

func leaveStatus(kind string) string {
	if kind == "SICK" {
		return "SICK"
	}
	return "PERMISSION"
}

var statusLabels = map[string]string{
	"PRESENT": "Hadir", "LATE": "Terlambat", "EARLY_LEAVE": "Pulang Cepat",
	"ABSENT": "Tidak Hadir", "PERMISSION": "Izin / Cuti", "SICK": "Sakit", "NOT_YET": "Belum Absen",
}

func StatusLabel(status string) string {
	if label, ok := statusLabels[status]; ok {
		return label
	}
	return status
}

func classify(date time.Time, joined *time.Time, kind string, dayOver bool, holidays map[time.Time]bool) string {
	if !workday.Working(date, holidays) || (joined != nil && workday.Date(*joined).After(date)) {
		return ""
	}
	if kind != "" {
		return leaveStatus(kind)
	}
	if dayOver {
		return "ABSENT"
	}
	return "NOT_YET"
}
