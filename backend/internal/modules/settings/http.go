package settings

import (
	"errors"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type companyInput struct {
	CompanyName          string  `json:"companyName"`
	CompanyCode          *string `json:"companyCode"`
	NPWP                 *string `json:"npwp"`
	Phone                *string `json:"phone"`
	WorkStartTime        string  `json:"workStartTime"`
	WorkEndTime          string  `json:"workEndTime"`
	LateToleranceMinutes *int32  `json:"lateToleranceMinutes"`
	OvertimeRatePerHour  *int32  `json:"overtimeRatePerHour"`
	WorkingDaysPerMonth  *int32  `json:"workingDaysPerMonth"`
	AnnualLeaveQuota     *int32  `json:"annualLeaveQuota"`
	BPJSKesehatanWageCap *int32  `json:"bpjsKesehatanWageCap"`
	JPWageCap            *int32  `json:"jpWageCap"`
	JKKRateBps           *int32  `json:"jkkRateBps"`
	BPJSMinimumWage      *int32  `json:"bpjsMinimumWage"`
}

func Register(admin, active *gin.RouterGroup, db *gorm.DB) {
	admin.GET("/company-settings", getCompany(db))
	admin.PATCH("/company-settings", updateCompany(db))
	admin.GET("/holidays", listHolidays(db, false))
	admin.POST("/holidays", createHoliday(db))
	admin.DELETE("/holidays/:id", deleteHoliday(db))
	active.GET("/holidays/upcoming", listHolidays(db, true))
}

func Company(db *gorm.DB) (CompanySetting, error) {
	var setting CompanySetting
	err := db.Take(&setting, "id = ?", "default").Error
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return setting, err
	}
	err = db.Exec(`INSERT INTO "CompanySetting" (id,"updatedAt") VALUES ('default',?) ON CONFLICT (id) DO NOTHING`, time.Now().UTC()).Error
	if err != nil {
		return setting, err
	}
	err = db.Take(&setting, "id = ?", "default").Error
	return setting, err
}

func getCompany(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		s, err := Company(db.WithContext(c.Request.Context()))
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Pengaturan perusahaan", gin.H{"id": s.ID, "companyName": s.CompanyName, "companyCode": s.CompanyCode, "npwp": s.NPWP, "phone": s.Phone,
			"workStartTime": s.WorkStartTime, "workEndTime": s.WorkEndTime, "lateToleranceMinutes": s.LateToleranceMinutes, "overtimeRatePerHour": s.OvertimeRatePerHour,
			"workingDaysPerMonth": s.WorkingDaysPerMonth, "annualLeaveQuota": s.AnnualLeaveQuota, "bpjsKesehatanWageCap": s.BPJSKesehatanWageCap,
			"jpWageCap": s.JPWageCap, "jkkRateBps": s.JKKRateBps, "bpjsMinimumWage": s.BPJSMinimumWage})
	}
}

func updateCompany(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input companyInput
		if !web.Bind(c, &input, 32<<10) {
			return
		}
		updates, err := input.updates()
		if err != nil {
			web.Fail(c, err)
			return
		}
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			if _, err := Company(tx); err != nil {
				return err
			}
			if err := tx.Model(&CompanySetting{}).Where("id = ?", "default").Updates(updates).Error; err != nil {
				return err
			}
			return identity.Audit(tx, identity.Current(c), "COMPANY_SETTING_UPDATED", "COMPANY_SETTING", "", "", "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Pengaturan perusahaan disimpan", nil)
	}
}

func (i companyInput) updates() (map[string]any, error) {
	i.CompanyName = strings.TrimSpace(i.CompanyName)
	if !web.Text(i.CompanyName, 1, 160) {
		return nil, web.Invalid("Nama perusahaan tidak valid")
	}
	if _, err := time.Parse("15:04", i.WorkStartTime); err != nil || len(i.WorkStartTime) != 5 {
		return nil, web.Invalid("Format jam masuk HH:mm")
	}
	if _, err := time.Parse("15:04", i.WorkEndTime); err != nil || len(i.WorkEndTime) != 5 {
		return nil, web.Invalid("Format jam pulang HH:mm")
	}
	if i.WorkEndTime <= i.WorkStartTime {
		return nil, web.Invalid("Jam pulang harus setelah jam masuk")
	}
	updates := map[string]any{"companyName": i.CompanyName, "workStartTime": i.WorkStartTime, "workEndTime": i.WorkEndTime}
	for key, value := range map[string]*string{"companyCode": i.CompanyCode, "npwp": i.NPWP, "phone": i.Phone} {
		if !web.Text(web.String(value), 0, 128) {
			return nil, web.Invalid("Identitas perusahaan tidak valid")
		}
		if value != nil {
			value = web.Ptr(strings.TrimSpace(*value))
		}
		updates[key] = value
	}
	for _, field := range []struct {
		key      string
		value    *int32
		min, max int32
	}{
		{"lateToleranceMinutes", i.LateToleranceMinutes, 0, 240}, {"overtimeRatePerHour", i.OvertimeRatePerHour, 0, 1<<31 - 1},
		{"workingDaysPerMonth", i.WorkingDaysPerMonth, 1, 31}, {"annualLeaveQuota", i.AnnualLeaveQuota, 0, 365},
		{"bpjsKesehatanWageCap", i.BPJSKesehatanWageCap, 0, 1<<31 - 1}, {"jpWageCap", i.JPWageCap, 0, 1<<31 - 1},
		{"bpjsMinimumWage", i.BPJSMinimumWage, 0, 1<<31 - 1},
	} {
		if field.value == nil || *field.value < field.min || *field.value > field.max {
			return nil, web.Invalid("Nilai pengaturan tidak valid: " + field.key)
		}
		updates[field.key] = *field.value
	}
	if i.JKKRateBps == nil || !slices.Contains([]int32{24, 54, 89, 127, 174}, *i.JKKRateBps) {
		return nil, web.Invalid("Tarif JKK tidak valid")
	}
	updates["jkkRateBps"] = *i.JKKRateBps
	return updates, nil
}

func listHolidays(db *gorm.DB, upcoming bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		q := db.WithContext(c.Request.Context()).Order("date")
		message := "Hari libur"
		if upcoming {
			limit, err := strconv.Atoi(c.DefaultQuery("limit", "5"))
			if err != nil {
				web.Fail(c, web.Invalid("Batas hari libur tidak valid"))
				return
			}
			q = q.Where("date >= ?", time.Now().In(web.Jakarta).Format(time.DateOnly)).Limit(min(max(limit, 1), 20))
			message = "Hari libur mendatang"
		} else {
			year, err := strconv.Atoi(c.Query("year"))
			if err != nil || year < 1 || year > 9998 {
				web.Fail(c, web.Invalid("Tahun tidak valid"))
				return
			}
			q = q.Where("date >= ? AND date < ?", time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC), time.Date(year+1, 1, 1, 0, 0, 0, 0, time.UTC))
		}
		var rows []Holiday
		if err := q.Find(&rows).Error; err != nil {
			web.Fail(c, err)
			return
		}
		result := make([]gin.H, 0, len(rows))
		for _, row := range rows {
			result = append(result, gin.H{"id": row.ID, "name": row.Name, "dateKey": row.Date.Format(time.DateOnly), "date": row.Date.Format("02/01/2006")})
		}
		web.OK(c, 200, message, result)
	}
}

func createHoliday(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Name string `json:"name"`
			Date string `json:"date"`
		}
		if !web.Bind(c, &input, 16<<10) {
			return
		}
		date, err := web.ParseDate(input.Date)
		input.Name = strings.TrimSpace(input.Name)
		if err != nil || date == nil || !web.Text(input.Name, 3, 160) {
			web.Fail(c, web.Invalid("Tanggal atau nama hari libur tidak valid"))
			return
		}
		row := Holiday{ID: uuid.NewString(), Date: *date, Name: input.Name}
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&row).Error; err != nil {
				return err
			}
			return identity.Audit(tx, identity.Current(c), "HOLIDAY_ADDED", "HOLIDAY", row.ID, row.Name+" ("+input.Date+")", "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 201, "Hari libur ditambahkan", nil)
	}
}

func deleteHoliday(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var row Holiday
		err := db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			result := tx.Raw(`DELETE FROM "Holiday" WHERE id=? RETURNING id,date,name`, c.Param("id")).Scan(&row)
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return web.NotFound("Hari libur tidak ditemukan")
			}
			return identity.Audit(tx, identity.Current(c), "HOLIDAY_DELETED", "HOLIDAY", row.ID, row.Name+" ("+row.Date.Format("02/01/2006")+")", "")
		})
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Hari libur dihapus", nil)
	}
}
