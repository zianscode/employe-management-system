package attendance

import (
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ExportDailyHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		date, err := web.ParseDate(c.Query("date"))
		if err != nil || date == nil {
			web.Fail(c, web.Invalid("Tanggal tidak valid"))
			return
		}
		result, err := daily(db.WithContext(c.Request.Context()), identity.Current(c), *date, time.Now())
		if err != nil {
			web.Fail(c, err)
			return
		}
		status, search := c.Query("status"), strings.ToLower(c.Query("q"))
		rows := make([][]string, 0, len(result))
		for _, row := range result {
			value := row["status"].(string)
			nip, name := row["nip"].(string), row["nama"].(string)
			if status != "" && status != "all" && status != value {
				continue
			}
			if !strings.Contains(strings.ToLower(nip), search) && !strings.Contains(strings.ToLower(name), search) {
				continue
			}
			rows = append(rows, []string{web.CSVText(nip), web.CSVText(name), row["tanggal"].(string), row["jamMasuk"].(string),
				row["jamKeluar"].(string), row["jamKerja"].(string), StatusLabel(value), row["keterangan"].(string)})
		}
		web.CSV(c, "absensi-"+date.Format(time.DateOnly), []string{"NIP", "Nama", "Tanggal", "Jam Masuk", "Jam Keluar", "Jam Kerja", "Status", "Keterangan"}, rows)
	}
}
