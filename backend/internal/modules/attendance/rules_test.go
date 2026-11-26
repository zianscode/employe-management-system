package attendance

import (
	"testing"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
)

func TestAttendanceRules(t *testing.T) {
	date := time.Date(2026, 11, 25, 0, 0, 0, 0, time.UTC)
	schedule := settings.CompanySetting{WorkStartTime: "08:00", WorkEndTime: "17:00", LateToleranceMinutes: 15}
	for _, tc := range []struct {
		in, out, status string
		late            int32
		hours, overtime float64
	}{
		{"08:15", "", "PRESENT", 0, 0, 0},
		{"08:16", "16:30", "LATE", 16, 8.23, 0},
		{"08:00", "16:59", "EARLY_LEAVE", 0, 8.98, 0},
		{"08:30", "18:30", "LATE", 30, 10, 1.5},
	} {
		t.Run(tc.in+"/"+tc.out, func(t *testing.T) {
			in, _ := workday.TimeOn(date, tc.in)
			out, _ := workday.TimeOn(date, tc.out)
			row := Attendance{CheckIn: in, CheckOut: out}
			evaluate(&row, schedule)
			if row.Status != tc.status || row.LateInMinutes != tc.late || row.WorkHours != tc.hours ||
				row.OvertimeHours != tc.overtime || row.IsOvertime != (tc.overtime > 0) {
				t.Fatalf("unexpected result: %+v", row)
			}
		})
	}
}
