package identity

import (
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/audit"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (s *Service) rolesHTTP(c *gin.Context) {
	type option struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	rows := []option{}
	q := s.DB.WithContext(c.Request.Context()).Model(&Role{}).Select("id", "name").Order("name")
	if Current(c).Role != "SUPER_ADMIN" {
		q = q.Where("name <> ?", "SUPER_ADMIN")
	}
	if err := q.Find(&rows).Error; err != nil {
		web.Fail(c, err)
		return
	}
	web.OK(c, 200, "Roles fetched", rows)
}

func (s *Service) usersHTTP(c *gin.Context) {
	type userRow struct {
		Actor
		LockedUntil *time.Time
	}
	type output struct {
		AccountInfo
		Name       string  `json:"name"`
		Email      string  `json:"email"`
		Role       string  `json:"role"`
		EmployeeID *string `json:"employeeId"`
		IsSelf     bool    `json:"isSelf"`
	}
	rows := []userRow{}
	err := s.DB.WithContext(c.Request.Context()).Table(`"User" AS u`).Select(actorFields + `,u."lockedUntil" AS locked_until`).Joins(accountJoin).Order(`u."createdAt" DESC`).Find(&rows).Error
	if err != nil {
		web.Fail(c, err)
		return
	}
	result := make([]output, 0, len(rows))
	for _, r := range rows {
		result = append(result, output{AccountStatus(r.ID, r.MustChangePassword, r.LockedUntil, r.EmployeeStatus), web.Fallback(web.String(r.Name), "System Admin"), r.Email, r.Role, r.EmployeeID, r.ID == Current(c).ID})
	}
	web.OK(c, 200, "Users fetched successfully", result)
}

func LockUser(tx *gorm.DB, id string) (User, error) {
	var user User
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Take(&user, "id = ?", id).Error
	return user, err
}

func GetRole(tx *gorm.DB, id string) (Role, error) {
	var role Role
	err := tx.Take(&role, "id = ?", id).Error
	return role, err
}

func Audit(tx *gorm.DB, actor Actor, action, entity, id, name, detail string) error {
	nullable := func(v string) *string {
		if v == "" {
			return nil
		}
		return web.Ptr(v)
	}
	return audit.Record(tx, audit.AuditLog{ActorUserID: web.Ptr(actor.ID), ActorName: web.Fallback(web.String(actor.Name), actor.Email), Action: action, Entity: entity, EntityID: nullable(id), TargetName: nullable(name), Detail: nullable(detail)})
}

func (s *Service) manageHTTP(reset bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := Current(c)
		id := c.Param("id")
		if id == actor.ID {
			web.Fail(c, web.Forbidden("Untuk akun sendiri, gunakan menu Profil"))
			return
		}
		var temporary string
		err := s.DB.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			user, err := LockUser(tx, id)
			if err != nil {
				return err
			}
			role, err := GetRole(tx, user.RoleID)
			if err != nil {
				return err
			}
			if err := Manage(actor.Role, role.Name); err != nil {
				return err
			}
			updates := map[string]any{"failedLoginAttempts": 0, "lockedUntil": nil}
			action := "ACCOUNT_UNLOCKED"
			if reset {
				var hash string
				temporary, hash, err = TemporaryPassword()
				if err != nil {
					return err
				}
				updates["password"] = hash
				updates["mustChangePassword"] = true
				action = "ACCOUNT_PASSWORD_RESET"
				if err := Revoke(tx, user.ID, ""); err != nil {
					return err
				}
			}
			if err := tx.Model(&user).Updates(updates).Error; err != nil {
				return err
			}
			var employee struct{ Name string }
			if err := tx.Table(`"Employee"`).Select("name").Where(`"userId" = ?`, id).Find(&employee).Error; err != nil {
				return err
			}
			return Audit(tx, actor, action, "ACCOUNT", id, web.Fallback(employee.Name, user.Email), "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		if reset {
			web.OK(c, 200, "Password direset. Karyawan wajib menggantinya saat login.", gin.H{"temporaryPassword": temporary})
			return
		}
		web.OK(c, 200, "Akun dibuka kembali", nil)
	}
}
