package employees

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/organization"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type employeeInput struct {
	Name                *string         `json:"name"`
	Email               *string         `json:"email"`
	NIP                 *string         `json:"nip"`
	Gender              *string         `json:"gender"`
	BirthDate           *string         `json:"birthDate"`
	JoinDate            *string         `json:"joinDate"`
	Status              *string         `json:"status"`
	EmploymentType      *string         `json:"employmentType"`
	DepartmentID        *string         `json:"departmentId"`
	PositionID          *string         `json:"positionId"`
	CustomPosition      *string         `json:"customPosition"`
	RoleID              *string         `json:"roleId"`
	ManagerID           json.RawMessage `json:"managerId"`
	SalaryBase          *float64        `json:"salaryBase"`
	PTKPStatus          *string         `json:"ptkpStatus"`
	BPJSKesehatan       *bool           `json:"bpjsKesehatan"`
	BPJSKetenagakerjaan *bool           `json:"bpjsKetenagakerjaan"`
	Avatar              *string         `json:"avatar"`
}

func validStatus(status string) bool {
	return slices.Contains([]string{"ACTIVE", "PROBATION", "RESIGNED", "TERMINATED"}, status)
}

func (i employeeInput) fields(create bool) (map[string]any, error) {
	if create && (i.Name == nil || i.Email == nil || i.NIP == nil || i.RoleID == nil || i.Status == nil || i.EmploymentType == nil) {
		return nil, web.Invalid("Data karyawan wajib dilengkapi")
	}
	updates := map[string]any{}
	if i.Name != nil {
		name := strings.TrimSpace(*i.Name)
		if !web.Text(name, 3, 160) {
			return nil, web.Invalid("Nama minimal 3 karakter")
		}
		updates["name"] = name
	}
	if i.Email != nil {
		email, err := identity.NormalizeEmail(*i.Email)
		if err != nil {
			return nil, err
		}
		updates["email"] = email
	}
	if i.NIP != nil {
		nip := strings.TrimSpace(*i.NIP)
		if !web.Text(nip, 5, 80) {
			return nil, web.Invalid("NIP minimal 5 karakter")
		}
		updates["nip"] = nip
	}
	if i.Gender != nil {
		if !slices.Contains([]string{"", "MALE", "FEMALE"}, *i.Gender) {
			return nil, web.Invalid("Jenis kelamin tidak valid")
		}
		updates["gender"] = *i.Gender
	}
	if i.Status != nil {
		if !validStatus(*i.Status) {
			return nil, web.Invalid("Status karyawan tidak valid")
		}
		updates["status"] = *i.Status
	}
	if i.EmploymentType != nil {
		if !slices.Contains([]string{"FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "FREELANCE"}, *i.EmploymentType) {
			return nil, web.Invalid("Tipe pekerjaan tidak valid")
		}
		updates["employmentType"] = *i.EmploymentType
	}
	if i.PTKPStatus != nil {
		if !slices.Contains([]string{"TK0", "TK1", "TK2", "TK3", "K0", "K1", "K2", "K3"}, *i.PTKPStatus) {
			return nil, web.Invalid("Status PTKP tidak valid")
		}
		updates["ptkpStatus"] = *i.PTKPStatus
	}
	if i.BPJSKesehatan != nil {
		updates["bpjsKesehatan"] = *i.BPJSKesehatan
	}
	if i.BPJSKetenagakerjaan != nil {
		updates["bpjsKetenagakerjaan"] = *i.BPJSKetenagakerjaan
	}
	if i.SalaryBase != nil {
		rounded := math.Round(*i.SalaryBase)
		if *i.SalaryBase < 0 || rounded > math.MaxInt32 {
			return nil, web.Invalid("Gaji pokok tidak valid")
		}
		updates["salaryBase"] = int32(rounded)
	}
	if d := web.String(i.DepartmentID); d != "" {
		updates["departmentId"] = d
	}
	for key, value := range map[string]*string{"birthDate": i.BirthDate, "joinDate": i.JoinDate} {
		if value == nil || (*value == "" && !create) {
			continue
		}
		date, err := web.ParseDate(*value)
		if err != nil {
			return nil, err
		}
		if date != nil {
			updates[key] = date
		}
	}
	if len(i.ManagerID) > 0 {
		var manager *string
		if err := json.Unmarshal(i.ManagerID, &manager); err != nil {
			return nil, web.Invalid("Atasan tidak valid")
		}
		if web.String(manager) == "" {
			manager = nil
		}
		updates["managerId"] = manager
	}
	return updates, nil
}

var nipSuffix = regexp.MustCompile(`^(.*?)([0-9]{3})$`)

func allocateNIP(tx *gorm.DB, nip, id string) (string, error) {
	if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", 1730667142).Error; err != nil {
		return "", err
	}
	base := nipSuffix.FindStringSubmatch(nip)
	q := tx.Model(&Employee{}).Where("id <> ?", id)
	if base == nil {
		q = q.Where("nip = ?", nip)
	} else {
		q = q.Where("left(nip, length(?)) = ?", base[1], base[1])
	}
	var found []string
	if err := q.Pluck("nip", &found).Error; err != nil {
		return "", err
	}
	if !slices.Contains(found, nip) {
		return nip, nil
	}
	if base == nil {
		return "", web.Conflict("NIP sudah terdaftar")
	}
	sequence, _ := strconv.Atoi(base[2])
	used := map[string]bool{}
	for _, value := range found {
		used[value] = true
	}
	for n := sequence + 1; n <= 999; n++ {
		value := fmt.Sprintf("%s%03d", base[1], n)
		if !used[value] {
			return value, nil
		}
	}
	return "", web.Conflict("Nomor urut NIP sudah habis")
}

func ensureEmail(tx *gorm.DB, email, employeeID, userID string) error {
	var taken bool
	err := tx.Raw(`SELECT EXISTS(SELECT 1 FROM "Employee" WHERE email=? AND id<>?) OR EXISTS(SELECT 1 FROM "User" WHERE email=? AND id<>?)`, email, employeeID, email, userID).Scan(&taken).Error
	if err != nil {
		return err
	}
	if taken {
		return web.Conflict("Email sudah dipakai karyawan atau akun lain")
	}
	return nil
}

func lockEmployee(tx *gorm.DB, id string) (Employee, error) {
	var row Employee
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Take(&row, "id = ?", id).Error
	return row, err
}
func manageable(tx *gorm.DB, actor identity.Actor, row Employee) (identity.User, error) {
	if row.UserID == nil {
		return identity.User{}, nil
	}
	user, err := identity.LockUser(tx, *row.UserID)
	if err != nil {
		return user, err
	}
	role, err := identity.GetRole(tx, user.RoleID)
	if err != nil {
		return user, err
	}
	return user, identity.Manage(actor.Role, role.Name)
}

func saveHTTP(db *gorm.DB, create bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input employeeInput
		if !web.Bind(c, &input, 64<<10) {
			return
		}
		fields, err := input.fields(create)
		if err != nil {
			web.Fail(c, err)
			return
		}
		id := c.Param("id")
		var password string
		actor := identity.Current(c)
		if create {
			id = uuid.NewString()
		}
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var row Employee
			var user identity.User
			var err error
			if !create {
				row, err = lockEmployee(tx, id)
				if err != nil {
					return err
				}
				user, err = manageable(tx, actor, row)
				if err != nil {
					return err
				}
			}
			awaitRole := web.String(input.RoleID)
			if input.RoleID != nil {
				if awaitRole == "" {
					return web.Invalid("Role wajib dipilih")
				}
				role, err := identity.GetRole(tx, awaitRole)
				if err != nil {
					return err
				}
				if !identity.KnownRole(role.Name) {
					return web.Invalid("Role tidak valid")
				}
				if err := identity.Manage(actor.Role, role.Name); err != nil {
					return err
				}
			}
			if email, ok := fields["email"].(string); ok {
				if err := ensureEmail(tx, email, id, user.ID); err != nil {
					return err
				}
			}
			if nip, ok := fields["nip"].(string); ok && (create || nip != web.String(row.NIP)) {
				normalized, err := allocateNIP(tx, nip, id)
				if err != nil {
					return err
				}
				fields["nip"] = normalized
			}
			if manager, ok := fields["managerId"].(*string); ok && manager != nil && *manager == id {
				return web.Invalid("Karyawan tidak bisa menjadi atasan dirinya sendiri")
			}
			position, err := organization.ResolvePosition(tx, web.String(input.PositionID), web.String(input.CustomPosition))
			if err != nil {
				return err
			}
			if position != nil {
				fields["positionId"] = position.ID
			}
			if input.Avatar != nil && *input.Avatar != web.String(row.Avatar) {
				return web.Invalid("Gunakan pengaturan profil untuk mengubah foto")
			}
			if create {
				setting, err := settings.Company(tx)
				if err != nil {
					return err
				}
				var hash string
				password, hash, err = identity.TemporaryPassword()
				if err != nil {
					return err
				}
				user = identity.User{ID: uuid.NewString(), Email: fields["email"].(string), Password: hash, RoleID: awaitRole, MustChangePassword: true}
				if err := tx.Create(&user).Error; err != nil {
					return err
				}
				fields["id"], fields["userId"], fields["leaveQuota"] = id, user.ID, setting.AnnualLeaveQuota
				if input.SalaryBase == nil || *input.SalaryBase == 0 {
					if position != nil {
						fields["salaryBase"] = position.SalaryBase
					}
				}
				now := time.Now().UTC()
				fields["createdAt"], fields["updatedAt"] = now, now
				if err := tx.Table(`"Employee"`).Create(fields).Error; err != nil {
					return err
				}
				return identity.Audit(tx, actor, "EMPLOYEE_CREATED", "EMPLOYEE", id, fields["name"].(string), "")
			}
			if len(fields) > 0 {
				if err := tx.Model(&row).Updates(fields).Error; err != nil {
					return err
				}
			}
			if user.ID != "" {
				updates := map[string]any{}
				if value, ok := fields["email"]; ok {
					updates["email"] = value
				}
				if awaitRole != "" {
					updates["roleId"] = awaitRole
				}
				if len(updates) > 0 {
					if err := tx.Model(&user).Updates(updates).Error; err != nil {
						return err
					}
				}
				if (awaitRole != "" && awaitRole != user.RoleID) || web.String(input.Status) == "RESIGNED" || web.String(input.Status) == "TERMINATED" {
					if err := identity.Revoke(tx, user.ID, ""); err != nil {
						return err
					}
				}
			}
			return identity.Audit(tx, actor, "EMPLOYEE_UPDATED", "EMPLOYEE", id, row.Name, "")
		}, &sql.TxOptions{Isolation: sql.LevelSerializable})
		if err != nil {
			web.Fail(c, err)
			return
		}
		if create {
			web.OK(c, 201, "Karyawan berhasil ditambahkan", gin.H{"id": id, "temporaryPassword": password})
			return
		}
		web.OK(c, 200, "Data karyawan berhasil diperbarui", nil)
	}
}

func roleHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			RoleID string `json:"roleId"`
		}
		if !web.Bind(c, &input, 16<<10) {
			return
		}
		if input.RoleID == "" {
			web.Fail(c, web.Invalid("Role wajib dipilih"))
			return
		}
		id := c.Param("id")
		actor := identity.Current(c)
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			row, err := lockEmployee(tx, id)
			if err != nil {
				return err
			}
			user, err := manageable(tx, actor, row)
			if err != nil {
				return err
			}
			if user.ID == "" {
				return web.NotFound("Akun tidak ditemukan")
			}
			role, err := identity.GetRole(tx, input.RoleID)
			if err != nil {
				return err
			}
			if !identity.KnownRole(role.Name) {
				return web.Invalid("Role tidak valid")
			}
			if err := identity.Manage(actor.Role, role.Name); err != nil {
				return err
			}
			if role.ID != user.RoleID {
				if err := tx.Model(&user).Update("roleId", role.ID).Error; err != nil {
					return err
				}
				if err := identity.Revoke(tx, user.ID, ""); err != nil {
					return err
				}
			}
			return identity.Audit(tx, actor, "EMPLOYEE_UPDATED", "EMPLOYEE", id, row.Name, "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Role diperbarui", nil)
	}
}

func activateHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		actor := identity.Current(c)
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			row, err := lockEmployee(tx, id)
			if err != nil {
				return err
			}
			if _, err := manageable(tx, actor, row); err != nil {
				return err
			}
			if err := tx.Model(&row).Update("status", "ACTIVE").Error; err != nil {
				return err
			}
			return identity.Audit(tx, actor, "EMPLOYEE_PROMOTED", "EMPLOYEE", id, row.Name, "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Karyawan berhasil dipromosikan menjadi aktif", nil)
	}
}

func deleteHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		actor := identity.Current(c)
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			row, err := lockEmployee(tx, id)
			if err != nil {
				return err
			}
			user, err := manageable(tx, actor, row)
			if err != nil {
				return err
			}
			if user.ID == actor.ID {
				return web.Forbidden("Anda tidak dapat menghapus data Anda sendiri")
			}
			var history bool
			err = tx.Raw(`SELECT EXISTS (SELECT 1 FROM "Attendance" WHERE "employeeId"=? UNION ALL SELECT 1 FROM "AttendanceCorrection" WHERE "employeeId"=? UNION ALL SELECT 1 FROM "LeaveRequest" WHERE "employeeId"=? UNION ALL SELECT 1 FROM "Salary" WHERE "employeeId"=?)`, id, id, id, id).Scan(&history).Error
			if err != nil {
				return err
			}
			if history {
				return web.Conflict("Karyawan ini sudah memiliki riwayat absensi/cuti/gaji sehingga tidak bisa dihapus. Ubah statusnya menjadi Resign atau Diberhentikan.")
			}
			if err := tx.Model(&Employee{}).Where(`"managerId" = ?`, id).Update("managerId", nil).Error; err != nil {
				return err
			}
			if err := tx.Delete(&row).Error; err != nil {
				return err
			}
			if user.ID != "" {
				if err := tx.Delete(&user).Error; err != nil {
					return err
				}
			}
			return identity.Audit(tx, actor, "EMPLOYEE_DELETED", "EMPLOYEE", id, row.Name, "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Karyawan berhasil dihapus", nil)
	}
}
