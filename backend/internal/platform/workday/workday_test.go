package workday

import (
	"testing"
	"time"
)

func TestJakartaCalendar(t *testing.T) {
	before := time.Date(2026, 12, 31, 16, 59, 59, 0, time.UTC)
	after := before.Add(time.Second)
	if Display(Date(before)) != "31/12/2026" || Display(Date(after)) != "01/01/2027" || Clock(after) != "00:00" {
		t.Fatal("wrong business date or clock at Jakarta midnight")
	}
	stamp, err := TimeOn(Date(after), "00:00")
	if err != nil || !stamp.Equal(after) {
		t.Fatalf("Jakarta input did not round-trip: %v, %v", stamp, err)
	}
	if _, err := TimeOn(Date(after), "24:00"); err == nil {
		t.Fatal("24:00 should not be accepted")
	}
	end := Date(after).AddDate(0, 0, 3) // Monday
	holidays := map[time.Time]bool{Date(after): true, Date(after).AddDate(0, 0, 1): true}
	if got := Count(Date(before), end, holidays); got != 2 {
		t.Fatalf("cross-year workdays = %d; want Thursday and Monday", got)
	}
}

func TestCountWorkingDays(t *testing.T) {
	monday := time.Date(2026, 10, 19, 0, 0, 0, 0, time.UTC)
	sunday := monday.AddDate(0, 0, 6)
	if got := Count(monday, sunday, nil); got != 5 {
		t.Fatalf("workdays = %d, want 5", got)
	}
	holiday := monday.AddDate(0, 0, 2)
	if got := Count(monday, sunday, map[time.Time]bool{holiday: true}); got != 4 {
		t.Fatalf("workdays with holiday = %d, want 4", got)
	}
	if got := Count(monday.AddDate(0, 0, 5), sunday, nil); got != 0 {
		t.Fatalf("weekend has %d workdays, want 0", got)
	}
}
