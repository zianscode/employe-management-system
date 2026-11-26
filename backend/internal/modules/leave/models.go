package leave

import "time"

type LeaveRequest struct {
	ID                string     `gorm:"column:id;primaryKey"`
	EmployeeID        string     `gorm:"column:employeeId"`
	Type              string     `gorm:"column:type;type:LeaveType"`
	StartDate         time.Time  `gorm:"column:startDate;type:timestamp(3)"`
	EndDate           time.Time  `gorm:"column:endDate;type:timestamp(3)"`
	Duration          int32      `gorm:"column:duration"`
	Reason            string     `gorm:"column:reason"`
	Status            string     `gorm:"column:status;type:LeaveStatus"`
	ManagerApproverID *string    `gorm:"column:managerApproverId"`
	ManagerApprovedAt *time.Time `gorm:"column:managerApprovedAt;type:timestamp(3)"`
	HRApproverID      *string    `gorm:"column:hrApproverId"`
	HRApprovedAt      *time.Time `gorm:"column:hrApprovedAt;type:timestamp(3)"`
	RejectedByID      *string    `gorm:"column:rejectedById"`
	RejectedAt        *time.Time `gorm:"column:rejectedAt;type:timestamp(3)"`
	RejectionReason   *string    `gorm:"column:rejectionReason"`
	CreatedAt         time.Time  `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt         time.Time  `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (LeaveRequest) TableName() string { return "LeaveRequest" }
