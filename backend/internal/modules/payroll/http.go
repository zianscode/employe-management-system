package payroll

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Register(active, admin *gin.RouterGroup, db *gorm.DB) {
	active.GET("/salaries", func(c *gin.Context) {
		month, year, err := period(c.Query("month"), c.Query("year"))
		if err != nil {
			web.Fail(c, err)
			return
		}
		result, err := salaryList(db.WithContext(c.Request.Context()), identity.Current(c), month, year)
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Data gaji", result)
	})
	active.GET("/salaries/:id/slip", func(c *gin.Context) {
		result, err := salarySlip(db.WithContext(c.Request.Context()), identity.Current(c), c.Param("id"))
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = web.NotFound("Slip gaji tidak ditemukan")
		}
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Slip gaji", result)
	})
	admin.POST("/payroll-periods/:year/:month/generate", periodHTTP(db, true))
	admin.POST("/payroll-periods/:year/:month/mark-paid", periodHTTP(db, false))
	admin.POST("/salaries/:id/mark-paid", func(c *gin.Context) {
		_, err := markPaid(db.WithContext(c.Request.Context()), identity.Current(c), c.Param("id"), 0, 0)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = web.NotFound("Slip gaji tidak ditemukan")
		}
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Slip gaji ditandai sudah dibayar", nil)
	})
	admin.GET("/employees/:id/payroll-components", componentsHTTP(db, false))
	admin.POST("/employees/:id/payroll-components", componentsHTTP(db, true))
	admin.DELETE("/payroll-components/:id", func(c *gin.Context) {
		id := c.Param("id")
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			var row PayrollComponent
			if err := tx.Take(&row, "id=?", id).Error; err != nil {
				return err
			}
			person, err := employees.LockWork(tx, row.EmployeeID)
			if err != nil {
				return err
			}
			deleted := tx.Delete(&row)
			if deleted.Error != nil {
				return deleted.Error
			}
			if deleted.RowsAffected != 1 {
				return web.NotFound("Komponen gaji tidak ditemukan")
			}
			return identity.Audit(tx, identity.Current(c), "PAYROLL_COMPONENT_DELETED", "PAYROLL_COMPONENT", id, row.Name+" ("+person.Name+")", "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Komponen gaji dihapus", nil)
	})
}

func period(monthText, yearText string) (int, int, error) {
	month, monthErr := strconv.Atoi(monthText)
	year, yearErr := strconv.Atoi(yearText)
	if monthErr != nil || month < 1 || month > 12 {
		return 0, 0, web.Invalid("Bulan tidak valid")
	}
	if yearErr != nil || year < 2000 || year > 2100 {
		return 0, 0, web.Invalid("Tahun tidak valid")
	}
	return month, year, nil
}

func periodHTTP(db *gorm.DB, calculate bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		month, year, err := period(c.Param("month"), c.Param("year"))
		if err != nil {
			web.Fail(c, err)
			return
		}
		tx := db.WithContext(c.Request.Context())
		actor := identity.Current(c)
		if calculate {
			result, err := generate(tx, actor, month, year)
			if err != nil {
				web.Fail(c, err)
				return
			}
			message := fmt.Sprintf("Gaji %d karyawan berhasil dihitung", result.Processed)
			if result.SkippedPaid > 0 {
				message += fmt.Sprintf(" (%d slip sudah dibayar, dilewati)", result.SkippedPaid)
			}
			web.OK(c, 200, message, result)
			return
		}
		count, err := markPaid(tx, actor, "", month, year)
		if err != nil {
			web.Fail(c, err)
			return
		}
		message := "Tidak ada slip yang belum dibayar"
		if count > 0 {
			message = fmt.Sprintf("%d slip gaji ditandai sudah dibayar", count)
		}
		web.OK(c, 200, message, gin.H{"count": count})
	}
}

func componentsHTTP(db *gorm.DB, create bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		db := db.WithContext(c.Request.Context())
		if !create {
			var rows []PayrollComponent
			if err := db.Where(`"employeeId"=?`, id).Order(`type,"createdAt",id`).Find(&rows).Error; err != nil {
				web.Fail(c, err)
				return
			}
			result := make([]gin.H, 0, len(rows))
			for _, row := range rows {
				result = append(result, gin.H{"id": row.ID, "name": row.Name, "type": row.Type, "amount": row.Amount})
			}
			web.OK(c, 200, "Komponen gaji", result)
			return
		}
		var input componentSnapshot
		if !web.Bind(c, &input, 16<<10) {
			return
		}
		input.Name = strings.TrimSpace(input.Name)
		if !web.Text(input.Name, 2, 1000) {
			web.Fail(c, web.Invalid("Nama komponen minimal 2 dan maksimal 1000 karakter"))
			return
		}
		if input.Type != "ALLOWANCE" && input.Type != "DEDUCTION" {
			web.Fail(c, web.Invalid("Jenis komponen tidak valid"))
			return
		}
		if input.Amount <= 0 {
			web.Fail(c, web.Invalid("Nominal harus lebih dari 0"))
			return
		}
		err := db.Transaction(func(tx *gorm.DB) error {
			person, err := employees.LockWork(tx, id)
			if err != nil {
				return err
			}
			row := PayrollComponent{ID: uuid.NewString(), EmployeeID: id, Name: input.Name, Type: input.Type, Amount: input.Amount}
			if err := tx.Create(&row).Error; err != nil {
				return err
			}
			return identity.Audit(tx, identity.Current(c), "PAYROLL_COMPONENT_ADDED", "EMPLOYEE", id, person.Name, input.Name+": Rp"+rupiah(int64(input.Amount)))
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 201, "Komponen gaji ditambahkan", nil)
	}
}
