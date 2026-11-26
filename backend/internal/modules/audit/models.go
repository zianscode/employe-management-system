package audit

import "time"

type AuditLog struct {
	ID          string    `gorm:"column:id;primaryKey"`
	ActorUserID *string   `gorm:"column:actorUserId"`
	ActorName   string    `gorm:"column:actorName"`
	Action      string    `gorm:"column:action"`
	Entity      string    `gorm:"column:entity"`
	EntityID    *string   `gorm:"column:entityId"`
	TargetName  *string   `gorm:"column:targetName"`
	Detail      *string   `gorm:"column:detail"`
	CreatedAt   time.Time `gorm:"column:createdAt;type:timestamp(3)"`
}

func (AuditLog) TableName() string { return "AuditLog" }
