package organization

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type option struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
type DepartmentInput struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}
type PositionInput struct {
	Name       string `json:"name"`
	SalaryBase *int32 `json:"salaryBase"`
}

func Register(admin *gin.RouterGroup, db *gorm.DB) {
	admin.GET("/organization", list(db))
	admin.GET("/organization/form-options", options(db))
	admin.POST("/departments", saveDepartment(db))
	admin.PATCH("/departments/:id", saveDepartment(db))
	admin.DELETE("/departments/:id", remove(db, true))
	admin.POST("/positions", savePosition(db))
	admin.PATCH("/positions/:id", savePosition(db))
	admin.DELETE("/positions/:id", remove(db, false))
}

func options(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tx := db.WithContext(c.Request.Context())
		departments, positions, managers := []option{}, []option{}, []option{}
		if err := tx.Model(&Department{}).Select("id", "name").Order("name").Find(&departments).Error; err != nil {
			web.Fail(c, err)
			return
		}
		if err := tx.Model(&Position{}).Select("id", "name").Order("name").Find(&positions).Error; err != nil {
			web.Fail(c, err)
			return
		}
		err := tx.Table(`"Employee" AS e`).Select("e.id,e.name").Joins(`JOIN "User" AS u ON u.id=e."userId" JOIN "Role" AS r ON r.id=u."roleId"`).
			Where("e.status IN ? AND r.name IN ?", []string{"ACTIVE", "PROBATION"}, []string{"SUPER_ADMIN", "HR", "MANAGER"}).Order("e.name").Find(&managers).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Pilihan organisasi", gin.H{"departments": departments, "positions": positions, "managers": managers})
	}
}

func list(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		type departmentRow struct {
			option
			Description   *string `json:"description"`
			EmployeeCount int64   `json:"employeeCount"`
		}
		type positionRow struct {
			option
			SalaryBase    int32 `json:"salaryBase"`
			EmployeeCount int64 `json:"employeeCount"`
		}
		departments, positions := []departmentRow{}, []positionRow{}
		tx := db.WithContext(c.Request.Context())
		active := []string{"ACTIVE", "PROBATION"}
		err := tx.Table(`"Department" AS d`).Select("d.id,d.name,d.description,COUNT(e.id) AS employee_count").
			Joins(`LEFT JOIN "Employee" AS e ON e."departmentId"=d.id AND e.status IN ?`, active).Group("d.id").Order("d.name").Find(&departments).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		err = tx.Table(`"Position" AS p`).Select(`p.id,p.name,p."salaryBase" AS salary_base,COUNT(e.id) AS employee_count`).
			Joins(`LEFT JOIN "Employee" AS e ON e."positionId"=p.id AND e.status IN ?`, active).Group("p.id").Order("p.name").Find(&positions).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Data organisasi", gin.H{"departments": departments, "positions": positions})
	}
}

func saveDepartment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input DepartmentInput
		if !web.Bind(c, &input, 32<<10) {
			return
		}
		input.Name = strings.TrimSpace(input.Name)
		if !web.Text(input.Name, 2, 120) || !web.Text(web.String(input.Description), 0, 2000) {
			web.Fail(c, web.Invalid("Nama divisi atau deskripsi tidak valid"))
			return
		}
		if input.Description != nil {
			input.Description = web.Ptr(strings.TrimSpace(*input.Description))
		}
		id := c.Param("id")
		created := id == ""
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			if created {
				id = uuid.NewString()
				if err := tx.Create(&Department{ID: id, Name: input.Name, Description: input.Description}).Error; err != nil {
					return err
				}
			} else {
				result := tx.Model(&Department{}).Where("id = ?", id).Updates(map[string]any{"name": input.Name, "description": input.Description})
				if result.Error != nil {
					return result.Error
				}
				if result.RowsAffected == 0 {
					return web.NotFound("Divisi tidak ditemukan")
				}
			}
			return identity.Audit(tx, identity.Current(c), "DEPARTMENT_SAVED", "DEPARTMENT", id, input.Name, "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		if created {
			web.OK(c, 201, "Divisi ditambahkan", nil)
		} else {
			web.OK(c, 200, "Divisi diperbarui", nil)
		}
	}
}

func savePosition(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input PositionInput
		if !web.Bind(c, &input, 32<<10) {
			return
		}
		input.Name = strings.TrimSpace(input.Name)
		if !web.Text(input.Name, 2, 120) || input.SalaryBase == nil || *input.SalaryBase < 0 {
			web.Fail(c, web.Invalid("Nama jabatan atau gaji standar tidak valid"))
			return
		}
		id := c.Param("id")
		created := id == ""
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			if created {
				id = uuid.NewString()
				if err := tx.Create(&Position{ID: id, Name: input.Name, SalaryBase: *input.SalaryBase}).Error; err != nil {
					return err
				}
			} else {
				result := tx.Model(&Position{}).Where("id = ?", id).Updates(map[string]any{"name": input.Name, "salaryBase": *input.SalaryBase})
				if result.Error != nil {
					return result.Error
				}
				if result.RowsAffected == 0 {
					return web.NotFound("Jabatan tidak ditemukan")
				}
			}
			amount := strconv.FormatInt(int64(*input.SalaryBase), 10)
			for i := len(amount) - 3; i > 0; i -= 3 {
				amount = amount[:i] + "." + amount[i:]
			}
			return identity.Audit(tx, identity.Current(c), "POSITION_SAVED", "POSITION", id, input.Name, "Gaji standar Rp"+amount)
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		if created {
			web.OK(c, 201, "Jabatan ditambahkan", nil)
		} else {
			web.OK(c, 200, "Jabatan diperbarui", nil)
		}
	}
}

func remove(db *gorm.DB, isDepartment bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		label, entity, field, model := "Jabatan", "POSITION", `"positionId"`, any(&Position{})
		if isDepartment {
			label, entity, field, model = "Divisi", "DEPARTMENT", `"departmentId"`, &Department{}
		}
		id := c.Param("id")
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var row option
			if err := tx.Model(model).Clauses(clause.Locking{Strength: "UPDATE"}).Select("id", "name").Where("id = ?", id).Take(&row).Error; err != nil {
				return err
			}
			var count int64
			if err := tx.Table(`"Employee"`).Where(field+" = ?", id).Count(&count).Error; err != nil {
				return err
			}
			if count > 0 {
				return web.Conflict(fmt.Sprintf("%s masih dipakai oleh %d karyawan", label, count))
			}
			if err := tx.Delete(model, "id = ?", id).Error; err != nil {
				return err
			}
			return identity.Audit(tx, identity.Current(c), entity+"_DELETED", entity, id, row.Name, "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, label+" dihapus", nil)
	}
}

func ResolvePosition(tx *gorm.DB, id, custom string) (*Position, error) {
	var row Position
	switch id {
	case "":
		return nil, nil
	case "OTHER":
		custom = strings.TrimSpace(custom)
		if !web.Text(custom, 2, 120) {
			return nil, web.Invalid("Nama jabatan khusus tidak valid")
		}
		row = Position{ID: uuid.NewString(), Name: custom}
		if err := tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "name"}}, DoNothing: true}).Create(&row).Error; err != nil {
			return nil, err
		}
		row = Position{}
		if err := tx.Take(&row, "name = ?", custom).Error; err != nil {
			return nil, err
		}
	default:
		if err := tx.Take(&row, "id = ?", id).Error; err != nil {
			return nil, err
		}
	}
	return &row, nil
}
