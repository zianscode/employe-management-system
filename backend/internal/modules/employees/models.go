package employees

import "time"

type Employee struct {
	ID                  string     `gorm:"column:id;primaryKey"`
	UserID              *string    `gorm:"column:userId"`
	Name                string     `gorm:"column:name"`
	Email               string     `gorm:"column:email"`
	NIP                 *string    `gorm:"column:nip"`
	JoinDate            *time.Time `gorm:"column:joinDate;type:timestamp(3)"`
	Status              string     `gorm:"column:status;type:EmployeeStatus"`
	EmploymentType      string     `gorm:"column:employmentType;type:EmploymentType"`
	SalaryBase          int32      `gorm:"column:salaryBase"`
	LeaveQuota          int32      `gorm:"column:leaveQuota"`
	PTKPStatus          string     `gorm:"column:ptkpStatus;type:PtkpStatus"`
	BPJSKesehatan       bool       `gorm:"column:bpjsKesehatan"`
	BPJSKetenagakerjaan bool       `gorm:"column:bpjsKetenagakerjaan"`
	DepartmentID        *string    `gorm:"column:departmentId"`
	PositionID          *string    `gorm:"column:positionId"`
	ManagerID           *string    `gorm:"column:managerId"`
	Avatar              *string    `gorm:"column:avatar"`
	Phone               *string    `gorm:"column:phone"`
	Address             *string    `gorm:"column:address"`
	Gender              *string    `gorm:"column:gender"`
	BirthDate           *time.Time `gorm:"column:birthDate;type:timestamp(3)"`
	PlaceOfBirth        *string    `gorm:"column:placeOfBirth"`
	IdentityNumber      *string    `gorm:"column:identityNumber"`
	Bio                 *string    `gorm:"column:bio"`
	BankName            *string    `gorm:"column:bankName"`
	BankAccount         *string    `gorm:"column:bankAccount"`
	BankHolderName      *string    `gorm:"column:bankHolderName"`
	NPWPNumber          *string    `gorm:"column:npwpNumber"`
	EmergencyName       *string    `gorm:"column:emergencyName"`
	EmergencyPhone      *string    `gorm:"column:emergencyPhone"`
	EmergencyRelation   *string    `gorm:"column:emergencyRelation"`
	Education           *string    `gorm:"column:education"`
	Skills              *string    `gorm:"column:skills"`
	IsProfileComplete   bool       `gorm:"column:isProfileComplete"`
	OnboardedAt         *time.Time `gorm:"column:onboardedAt;type:timestamp(3)"`
	CreatedAt           time.Time  `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt           time.Time  `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (Employee) TableName() string { return "Employee" }
