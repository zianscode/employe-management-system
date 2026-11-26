package employees

import (
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"gorm.io/gorm"
)

// WorkScope expects the Employee table to be aliased as e.
func WorkScope(db *gorm.DB, actor identity.Actor) *gorm.DB {
	if identity.IsAdmin(actor.Role) {
		return db
	}
	if actor.EmployeeID == nil {
		return db.Where("FALSE")
	}
	if actor.Role == "MANAGER" {
		return db.Where(`(e.id = ? OR e."managerId" = ?)`, *actor.EmployeeID, *actor.EmployeeID)
	}
	return db.Where("e.id = ?", *actor.EmployeeID)
}

func CanAccessWork(actor identity.Actor, id string, manager *string) bool {
	return identity.IsAdmin(actor.Role) || (actor.EmployeeID != nil &&
		(*actor.EmployeeID == id || (actor.Role == "MANAGER" && manager != nil && *manager == *actor.EmployeeID)))
}

func CanReviewWork(actor identity.Actor, id string, manager *string) bool {
	if actor.EmployeeID == nil || (*actor.EmployeeID == id && actor.Role != "SUPER_ADMIN") {
		return false
	}
	return identity.IsAdmin(actor.Role) || (actor.Role == "MANAGER" && manager != nil && *manager == *actor.EmployeeID)
}

func WorkID(actor identity.Actor) (string, error) {
	if actor.EmployeeID == nil {
		return "", web.NotFound("Profil karyawan tidak ditemukan")
	}
	return *actor.EmployeeID, nil
}

// LockWork serializes attendance, correction and leave mutations for one employee.
func LockWork(tx *gorm.DB, id string) (Employee, error) { return lockEmployee(tx, id) }

func WorkActive(status string) bool { return status == "ACTIVE" || status == "PROBATION" }
