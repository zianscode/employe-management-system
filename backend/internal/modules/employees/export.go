package employees

import (
	"strings"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func StatusLabel(status string) string {
	switch status {
	case "ACTIVE":
		return "Aktif"
	case "PROBATION":
		return "Masa Percobaan"
	case "RESIGNED":
		return "Resign"
	case "TERMINATED":
		return "Diberhentikan"
	default:
		return status
	}
}

func ExportHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		status, division, search := c.Query("status"), c.Query("division"), strings.ToLower(c.Query("q"))
		q := listQuery(db.WithContext(c.Request.Context()))
		if status != "" && status != "all" {
			if !validStatus(status) {
				web.Fail(c, web.Invalid("Status karyawan tidak valid"))
				return
			}
			q = q.Where("e.status=?", status)
		}
		var people []employeeRow
		if err := q.Find(&people).Error; err != nil {
			web.Fail(c, err)
			return
		}
		rows := make([][]string, 0, len(people))
		for _, person := range people {
			org := web.Fallback(web.String(person.Division), "-")
			nip := web.Fallback(web.String(person.NIP), "-")
			if division != "" && division != "all" && division != org {
				continue
			}
			if !strings.Contains(strings.ToLower(person.Name), search) && !strings.Contains(strings.ToLower(nip), search) &&
				!strings.Contains(strings.ToLower(person.Email), search) {
				continue
			}
			rows = append(rows, []string{web.CSVText(nip), web.CSVText(person.Name), web.CSVText(person.Email),
				web.CSVText(web.Fallback(web.String(person.Position), "-")), web.CSVText(org), StatusLabel(person.Status),
				web.Fallback(dateString(person.JoinDate, "2/1/2006"), "-")})
		}
		web.CSV(c, "data-karyawan", []string{"NIP", "Nama", "Email", "Jabatan", "Divisi", "Status", "Bergabung"}, rows)
	}
}
