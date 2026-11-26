package settings

import "time"

type CompanySetting struct {
	ID                   string    `gorm:"column:id;primaryKey"`
	CompanyName          string    `gorm:"column:companyName"`
	CompanyCode          *string   `gorm:"column:companyCode"`
	NPWP                 *string   `gorm:"column:npwp"`
	Phone                *string   `gorm:"column:phone"`
	WorkStartTime        string    `gorm:"column:workStartTime"`
	WorkEndTime          string    `gorm:"column:workEndTime"`
	LateToleranceMinutes int32     `gorm:"column:lateToleranceMinutes"`
	OvertimeRatePerHour  int32     `gorm:"column:overtimeRatePerHour"`
	WorkingDaysPerMonth  int32     `gorm:"column:workingDaysPerMonth"`
	AnnualLeaveQuota     int32     `gorm:"column:annualLeaveQuota"`
	BPJSKesehatanWageCap int32     `gorm:"column:bpjsKesehatanWageCap"`
	JPWageCap            int32     `gorm:"column:jpWageCap"`
	JKKRateBps           int32     `gorm:"column:jkkRateBps"`
	BPJSMinimumWage      int32     `gorm:"column:bpjsMinimumWage"`
	UpdatedAt            time.Time `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (CompanySetting) TableName() string { return "CompanySetting" }

type Holiday struct {
	ID        string    `gorm:"column:id;primaryKey"`
	Date      time.Time `gorm:"column:date;type:date"`
	Name      string    `gorm:"column:name"`
	CreatedAt time.Time `gorm:"column:createdAt;type:timestamp(3)"`
}

func (Holiday) TableName() string { return "Holiday" }
