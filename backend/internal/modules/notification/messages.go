package notification

import (
	"bytes"
	"errors"
	"fmt"
	"html/template"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"gorm.io/gorm"
)

type recipient struct{ Name, Email string }

func receiver(db *gorm.DB, id string) (recipient, error) {
	var r recipient
	err := db.Table(`"Employee"`).Select("name,email").Where("id = ?", id).Take(&r).Error
	return r, err
}

func adminRecipients(db *gorm.DB, exclude string) ([]recipient, error) {
	var rows []recipient
	err := db.Table(`"User" AS u`).Select("u.email,e.name").
		Joins(`JOIN "Role" AS r ON r.id=u."roleId" JOIN "Employee" AS e ON e."userId"=u.id`).
		Where(`r.name IN ('HR','SUPER_ADMIN') AND e.status IN ('ACTIVE','PROBATION') AND e.id<>?`, exclude).Find(&rows).Error
	return rows, err
}

type LeaveEvent struct {
	ID, EmployeeID, Name, Kind, Reason string
	Start, End                         time.Time
	Duration                           int32
}

var leaveLabels = map[string]string{"ANNUAL": "Cuti tahunan", "SICK": "Sakit", "EMERGENCY": "Izin penting", "UNPAID": "Di luar tanggungan"}

func leaveDetails(e LeaveEvent) [][2]string {
	return [][2]string{{"Jenis", web.Fallback(leaveLabels[e.Kind], e.Kind)}, {"Tanggal", workday.Display(e.Start) + " – " + workday.Display(e.End)}}
}

func LeaveSubmitted(tx *gorm.DB, e LeaveEvent, manager *string) error {
	var recipients []recipient
	if manager != nil {
		row, err := receiver(tx, *manager)
		if err == nil {
			recipients = []recipient{row}
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}
	if len(recipients) == 0 {
		var err error
		recipients, err = adminRecipients(tx, e.EmployeeID)
		if err != nil {
			return err
		}
	}
	details := append(leaveDetails(e), [2]string{"Durasi", fmt.Sprintf("%d hari kerja", e.Duration)}, [2]string{"Alasan", e.Reason})
	messages := make([]Message, 0, len(recipients))
	for _, r := range recipients {
		messages = append(messages, Message{r.Email, r.Name, "Pengajuan cuti baru dari " + e.Name, e.Name + " mengajukan cuti dan menunggu persetujuan Anda.", details, "Buka halaman cuti", "/dashboard/leave"})
	}
	return enqueue(tx, "leave:"+e.ID+":submitted", messages)
}

func LeaveDecided(tx *gorm.DB, e LeaveEvent, status, reason string) error {
	text := "disetujui"
	if status == "REJECTED" {
		text = "ditolak"
	}
	if status == "MANAGER_APPROVED" {
		text = "disetujui atasan dan sekarang menunggu persetujuan HR"
	}
	details := leaveDetails(e)
	if reason != "" {
		details = append(details, [2]string{"Alasan penolakan", reason})
	}
	employee, err := receiver(tx, e.EmployeeID)
	if err != nil {
		return err
	}
	subject := "Pengajuan cuti Anda " + text
	messages := []Message{{employee.Email, employee.Name, subject, subject + ".", details, "Lihat pengajuan", "/dashboard/leave"}}
	if err := enqueue(tx, "leave:"+e.ID+":"+status+":employee", messages); err != nil {
		return err
	}
	if status != "MANAGER_APPROVED" {
		return nil
	}
	recipients, err := adminRecipients(tx, e.EmployeeID)
	if err != nil {
		return err
	}
	messages = make([]Message, 0, len(recipients))
	for _, r := range recipients {
		messages = append(messages, Message{r.Email, r.Name, "Cuti " + e.Name + " menunggu persetujuan HR",
			"Atasan sudah menyetujui cuti " + e.Name + ". Pengajuan ini menunggu persetujuan akhir HR.", details, "Buka halaman cuti", "/dashboard/leave"})
	}
	return enqueue(tx, "leave:"+e.ID+":"+status+":hr", messages)
}

func CorrectionDecided(tx *gorm.DB, id, employeeID, status, reason string, date time.Time) error {
	r, err := receiver(tx, employeeID)
	if err != nil {
		return err
	}
	text := "disetujui"
	if status == "REJECTED" {
		text = "ditolak"
	}
	details := [][2]string{{"Tanggal", workday.Display(date)}}
	if reason != "" {
		details = append(details, [2]string{"Alasan penolakan", reason})
	}
	return enqueue(tx, "correction:"+id+":"+status, []Message{{r.Email, r.Name, "Koreksi absensi Anda " + text,
		"Pengajuan koreksi absensi Anda " + text + ".", details, "Lihat absensi", "/dashboard/attendance"}})
}

func salaryPaid(db *gorm.DB, id string) (*Message, error) {
	var row struct {
		Name, Email             string
		PeriodMonth, PeriodYear int
		TotalNet                int64
	}
	err := db.Table(`"Salary" AS s`).Select(`e.email,e.name,s."periodMonth" AS period_month,s."periodYear" AS period_year,s."totalNet" AS total_net`).
		Joins(`JOIN "Employee" AS e ON e.id=s."employeeId"`).Where(`s.id = ? AND s."isPaid"`, id).Take(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	period := web.Period(row.PeriodYear, time.Month(row.PeriodMonth))
	total := strconv.FormatInt(row.TotalNet, 10)
	negative := strings.HasPrefix(total, "-")
	total = strings.TrimPrefix(total, "-")
	for i := len(total) - 3; i > 0; i -= 3 {
		total = total[:i] + "." + total[i:]
	}
	if negative {
		total = "-Rp " + total
	} else {
		total = "Rp " + total
	}
	return &Message{row.Email, row.Name, "Gaji " + period + " sudah dibayar", "Gaji Anda untuk periode " + period + " sudah dibayar.",
		[][2]string{{"Gaji bersih", total}}, "Buka slip gaji", "/dashboard/salary/" + url.PathEscape(id) + "/slip"}, nil
}

var emailTemplate = template.Must(template.New("notification").Parse(`
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; line-height: 1.5;">
  <p style="color: #111827; margin: 0 0 12px;">Halo {{.Name}},</p>
  <p style="color: #374151; margin: 0 0 16px;">{{.Text}}</p>
  {{if .Details}}<table style="border-collapse: collapse; margin: 0 0 20px;">{{range .Details}}
    <tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">{{index . 0}}</td><td style="padding: 4px 0; color: #111827;">{{index . 1}}</td></tr>
  {{end}}</table>{{end}}
  <a href="{{.URL}}" style="background-color: #023074; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">{{.ActionLabel}}</a>
  <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">Email ini dikirim otomatis oleh Employee Management System.</p>
</div>`))

func render(origin string, message Message) (string, error) {
	if !strings.HasPrefix(message.Path, "/dashboard/") {
		return "", errors.New("invalid notification link")
	}
	var body bytes.Buffer
	err := emailTemplate.Execute(&body, struct {
		Message
		URL string
	}{message, origin + message.Path})
	return body.String(), err
}
