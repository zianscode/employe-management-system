package workday

import (
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
)

// Date converts an instant to the UTC representation of its business calendar date.
func Date(now time.Time) time.Time {
	year, month, day := now.In(web.Jakarta).Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func Clock(instant time.Time) string { return instant.In(web.Jakarta).Format("15:04") }
func ClockOr(instant *time.Time, fallback string) string {
	if instant == nil {
		return fallback
	}
	return Clock(*instant)
}
func Display(date time.Time) string { return date.UTC().Format("02/01/2006") }

func Month(month, year int) (time.Time, time.Time) {
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	return start, start.AddDate(0, 1, -1)
}

func Minutes(instant time.Time) int {
	local := instant.In(web.Jakarta)
	return local.Hour()*60 + local.Minute()
}

func TimeOn(date time.Time, value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}
	clock, err := time.Parse("15:04", value)
	if err != nil || len(value) != 5 {
		return nil, web.Invalid("Format jam harus HH:mm")
	}
	hour, minute, _ := clock.Clock()
	instant := time.Date(date.Year(), date.Month(), date.Day(), hour, minute, 0, 0, web.Jakarta).UTC()
	return &instant, nil
}

func weekend(date time.Time) bool {
	return date.Weekday() == time.Saturday || date.Weekday() == time.Sunday
}

func Working(date time.Time, holidays map[time.Time]bool) bool {
	return !weekend(date) && !holidays[date]
}

func Count(start, end time.Time, holidays map[time.Time]bool) int {
	if end.Before(start) {
		return 0
	}
	days := int((end.Unix()-start.Unix())/86400) + 1
	count := (days / 7) * 5
	for i := 0; i < days%7; i++ {
		if !weekend(start.AddDate(0, 0, i)) {
			count++
		}
	}
	first := start.UTC().Truncate(24 * time.Hour)
	last := first.AddDate(0, 0, days-1)
	for date := range holidays {
		if !date.Before(first) && !date.After(last) && !weekend(date) {
			count--
		}
	}
	return count
}
