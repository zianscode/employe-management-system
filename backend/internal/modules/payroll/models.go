package payroll

import (
	"encoding/json"
	"time"
)

type Salary struct {
	ID              string           `gorm:"column:id;primaryKey"`
	EmployeeID      string           `gorm:"column:employeeId"`
	PeriodMonth     int32            `gorm:"column:periodMonth"`
	PeriodYear      int32            `gorm:"column:periodYear"`
	BasicSalary     int32            `gorm:"column:basicSalary"`
	Allowances      int32            `gorm:"column:allowances"`
	Deductions      int32            `gorm:"column:deductions"`
	OvertimePay     int32            `gorm:"column:overtimePay"`
	UnpaidLeaveCut  int32            `gorm:"column:unpaidLeaveCut"`
	BPJSKesEmployee int32            `gorm:"column:bpjsKesEmployee"`
	BPJSKesEmployer int32            `gorm:"column:bpjsKesEmployer"`
	JHTEmployee     int32            `gorm:"column:jhtEmployee"`
	JHTEmployer     int32            `gorm:"column:jhtEmployer"`
	JPEmployee      int32            `gorm:"column:jpEmployee"`
	JPEmployer      int32            `gorm:"column:jpEmployer"`
	JKKEmployer     int32            `gorm:"column:jkkEmployer"`
	JKMEmployer     int32            `gorm:"column:jkmEmployer"`
	PTKPStatus      *string          `gorm:"column:ptkpStatus;type:PtkpStatus"`
	TaxableIncome   int32            `gorm:"column:taxableIncome"`
	PPh21           int32            `gorm:"column:pph21"`
	PPh21Method     *string          `gorm:"column:pph21Method"`
	Components      *json.RawMessage `gorm:"column:components;type:jsonb;serializer:json"`
	TotalGross      int32            `gorm:"column:totalGross"`
	TotalNet        int32            `gorm:"column:totalNet"`
	IsPaid          bool             `gorm:"column:isPaid"`
	PaidAt          *time.Time       `gorm:"column:paidAt;type:timestamp(3)"`
	CreatedAt       time.Time        `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt       time.Time        `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (Salary) TableName() string { return "Salary" }

type PayrollComponent struct {
	ID         string    `gorm:"column:id;primaryKey"`
	EmployeeID string    `gorm:"column:employeeId"`
	Name       string    `gorm:"column:name"`
	Type       string    `gorm:"column:type;type:PayrollComponentType"`
	Amount     int32     `gorm:"column:amount"`
	CreatedAt  time.Time `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt  time.Time `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (PayrollComponent) TableName() string { return "PayrollComponent" }
