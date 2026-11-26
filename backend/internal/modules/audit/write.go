package audit

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Record(tx *gorm.DB, row AuditLog) error {
	row.ID = uuid.NewString()
	return tx.Create(&row).Error
}
