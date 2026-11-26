package attendance

import "time"

type Attendance struct {
	ID            string     `gorm:"column:id;primaryKey"`
	EmployeeID    string     `gorm:"column:employeeId"`
	Date          time.Time  `gorm:"column:date;type:date"`
	CheckIn       *time.Time `gorm:"column:checkIn;type:timestamp(3)"`
	CheckOut      *time.Time `gorm:"column:checkOut;type:timestamp(3)"`
	LateInMinutes int32      `gorm:"column:lateInMinutes"`
	WorkHours     float64    `gorm:"column:workHours;type:double precision"`
	IsOvertime    bool       `gorm:"column:isOvertime"`
	OvertimeHours float64    `gorm:"column:overtimeHours;type:double precision"`
	Status        string     `gorm:"column:status;type:AttendanceStatus"`
	Location      *string    `gorm:"column:location"`
	Notes         *string    `gorm:"column:notes"`
	CreatedAt     time.Time  `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt     time.Time  `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (Attendance) TableName() string { return "Attendance" }

type AttendanceCorrection struct {
	ID              string     `gorm:"column:id;primaryKey"`
	EmployeeID      string     `gorm:"column:employeeId"`
	Date            time.Time  `gorm:"column:date;type:date"`
	CheckIn         *time.Time `gorm:"column:checkIn;type:timestamp(3)"`
	CheckOut        *time.Time `gorm:"column:checkOut;type:timestamp(3)"`
	Reason          string     `gorm:"column:reason"`
	Status          string     `gorm:"column:status;type:CorrectionStatus"`
	ReviewedByID    *string    `gorm:"column:reviewedById"`
	ReviewedAt      *time.Time `gorm:"column:reviewedAt;type:timestamp(3)"`
	RejectionReason *string    `gorm:"column:rejectionReason"`
	CreatedAt       time.Time  `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt       time.Time  `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (AttendanceCorrection) TableName() string { return "AttendanceCorrection" }
