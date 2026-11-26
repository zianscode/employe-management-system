package organization

import "time"

type Department struct {
	ID          string    `gorm:"column:id;primaryKey"`
	Name        string    `gorm:"column:name"`
	Description *string   `gorm:"column:description"`
	CreatedAt   time.Time `gorm:"column:createdAt;type:timestamp(3)"`
}

func (Department) TableName() string { return "Department" }

type Position struct {
	ID         string    `gorm:"column:id;primaryKey"`
	Name       string    `gorm:"column:name"`
	SalaryBase int32     `gorm:"column:salaryBase"`
	CreatedAt  time.Time `gorm:"column:createdAt;type:timestamp(3)"`
}

func (Position) TableName() string { return "Position" }
