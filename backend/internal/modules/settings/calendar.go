package settings

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// AttendanceSchedule reads the same fallback as the company row without
// initializing it from inside a report's read-only snapshot.
func AttendanceSchedule(db *gorm.DB) (CompanySetting, error) {
	var schedule CompanySetting
	err := db.Select("workStartTime", "workEndTime", "lateToleranceMinutes").Take(&schedule, "id = ?", "default").Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return CompanySetting{WorkStartTime: "08:00", WorkEndTime: "17:00", LateToleranceMinutes: 15}, nil
	}
	return schedule, err
}

func HolidayDates(db *gorm.DB, start, end time.Time) (map[time.Time]bool, error) {
	var dates []time.Time
	if err := db.Model(&Holiday{}).Where("date >= ? AND date <= ?", start, end).Pluck("date", &dates).Error; err != nil {
		return nil, err
	}
	result := make(map[time.Time]bool, len(dates))
	for _, date := range dates {
		result[date.UTC()] = true
	}
	return result, nil
}
