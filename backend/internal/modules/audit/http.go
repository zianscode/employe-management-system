package audit

import (
	"fmt"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var actionLabels = map[string]string{
	"EMPLOYEE_CREATED":          "menambah karyawan",
	"EMPLOYEE_UPDATED":          "mengubah data karyawan",
	"EMPLOYEE_PROMOTED":         "mengubah status menjadi aktif untuk",
	"EMPLOYEE_DELETED":          "menghapus karyawan",
	"ACCOUNT_PASSWORD_RESET":    "mereset password",
	"ACCOUNT_UNLOCKED":          "membuka kunci akun",
	"LEAVE_APPROVED":            "menyetujui cuti",
	"LEAVE_REJECTED":            "menolak cuti",
	"CORRECTION_APPROVED":       "menyetujui koreksi absensi",
	"CORRECTION_REJECTED":       "menolak koreksi absensi",
	"PAYROLL_GENERATED":         "menghitung gaji",
	"SALARY_PAID":               "menandai slip dibayar",
	"PAYROLL_PERIOD_PAID":       "menandai semua slip dibayar",
	"PAYROLL_COMPONENT_ADDED":   "menambah komponen gaji",
	"PAYROLL_COMPONENT_DELETED": "menghapus komponen gaji",
	"COMPANY_SETTING_UPDATED":   "mengubah pengaturan perusahaan",
	"HOLIDAY_ADDED":             "menambah hari libur",
	"HOLIDAY_DELETED":           "menghapus hari libur",
	"DEPARTMENT_SAVED":          "menyimpan divisi",
	"DEPARTMENT_DELETED":        "menghapus divisi",
	"POSITION_SAVED":            "menyimpan jabatan",
	"POSITION_DELETED":          "menghapus jabatan",
}

var entityLabels = map[string]string{
	"EMPLOYEE": "Karyawan", "ACCOUNT": "Akun", "LEAVE": "Cuti", "ATTENDANCE_CORRECTION": "Absensi",
	"SALARY": "Gaji", "PAYROLL_PERIOD": "Gaji", "PAYROLL_COMPONENT": "Gaji",
	"COMPANY_SETTING": "Pengaturan", "HOLIDAY": "Pengaturan", "DEPARTMENT": "Organisasi", "POSITION": "Organisasi",
}

var shortMonths = [...]string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"}

func ListHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var logs []AuditLog
		err := db.WithContext(c.Request.Context()).Order(`"createdAt" DESC,id DESC`).Limit(100).Find(&logs).Error
		if err != nil {
			web.Fail(c, err)
			return
		}
		result := make([]gin.H, 0, len(logs))
		for _, log := range logs {
			local := log.CreatedAt.In(web.Jakarta)
			at := fmt.Sprintf("%02d %s %d, %02d.%02d", local.Day(), shortMonths[local.Month()-1], local.Year(), local.Hour(), local.Minute())
			result = append(result, gin.H{"id": log.ID, "at": at, "actorName": log.ActorName,
				"actionLabel": web.Fallback(actionLabels[log.Action], log.Action), "area": web.Fallback(entityLabels[log.Entity], log.Entity),
				"targetName": log.TargetName, "detail": log.Detail})
		}
		web.OK(c, 200, "Riwayat aktivitas", result)
	}
}
