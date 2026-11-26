package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/audit"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/notification"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/payroll"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

type workRequest struct {
	path, token string
	body        any
}

func raceWorkRequests(t *testing.T, f phase2Fixture, success int, requests ...workRequest) {
	t.Helper()
	start := make(chan struct{})
	results := make(chan *httptest.ResponseRecorder, len(requests))
	for _, input := range requests {
		go func(input workRequest) {
			var raw []byte
			if input.body != nil {
				raw, _ = json.Marshal(input.body)
			}
			r := httptest.NewRequest("POST", "/api/v1"+input.path, bytes.NewReader(raw))
			r.Header.Set("Origin", fixtureOrigin)
			r.Header.Set("Content-Type", "application/json")
			r.AddCookie(&http.Cookie{Name: identity.CookieName, Value: input.token})
			w := httptest.NewRecorder()
			<-start
			f.router.ServeHTTP(w, r)
			results <- w
		}(input)
	}
	close(start)
	wins := 0
	for range requests {
		result := <-results
		switch result.Code {
		case success:
			wins++
		case http.StatusConflict:
		default:
			t.Errorf("unexpected concurrent response %d: %s", result.Code, result.Body)
		}
	}
	if wins != 1 {
		t.Fatalf("expected exactly one successful mutation, got %d", wins)
	}
}

func TestPhase3REST(t *testing.T) {
	databaseURL := os.Getenv("EMS_PHASE3_TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("set EMS_PHASE3_TEST_DATABASE_URL to the disposable migrated phase3_test database")
	}
	target, err := url.Parse(databaseURL)
	if err != nil || target.Hostname() != "127.0.0.1" || target.Path != "/phase3_test" {
		t.Fatal("invalid disposable test database")
	}
	db, pool, err := postgres.Open(databaseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	must := func(err error) {
		t.Helper()
		if err != nil {
			t.Fatal(err)
		}
	}
	service, err := identity.New(db, fixtureOrigin, false, nil)
	must(err)
	router := New(pool.PingContext)
	RegisterBusiness(router, db, service, employees.AvatarStore{Directory: t.TempDir()})
	f := phase2Fixture{router, t, fmt.Sprintf("192.0.2.%d:1234", time.Now().UnixNano()%253+1)}
	const password = "WorkFixturePassword7"
	hash, err := identity.HashPassword(password)
	must(err)
	today := workday.Date(time.Now())
	join := today.AddDate(-1, 0, 0)
	seed := func(roleName string, manager *string, quota int32) (string, string) {
		t.Helper()
		role := identity.Role{ID: uuid.NewString(), Name: roleName}
		must(db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "name"}}, DoNothing: true}).Create(&role).Error)
		role = identity.Role{}
		must(db.Take(&role, "name = ?", roleName).Error)
		user := identity.User{ID: uuid.NewString(), Email: uuid.NewString() + "@phase3.test", RoleID: role.ID, Password: hash}
		must(db.Create(&user).Error)
		employee := employees.Employee{ID: uuid.NewString(), UserID: &user.ID, ManagerID: manager,
			Name: "Fixture <" + roleName + ">", Email: user.Email, JoinDate: &join, LeaveQuota: quota,
			Status: "ACTIVE", EmploymentType: "FULL_TIME", PTKPStatus: "TK0", IsProfileComplete: true}
		must(db.Create(&employee).Error)
		return f.login(user.Email, password), employee.ID
	}
	hr, _ := seed("HR", nil, 12)
	manager, managerID := seed("MANAGER", nil, 12)
	otherManager, _ := seed("MANAGER", nil, 12)
	member, employeeID := seed("EMPLOYEE", &managerID, 2)
	outsider, outsiderID := seed("EMPLOYEE", nil, 12)
	schedule, err := settings.Company(db)
	must(err)
	must(db.Model(&schedule).Updates(map[string]any{"workStartTime": "08:00", "workEndTime": "17:00", "lateToleranceMinutes": 15}).Error)

	const attendancePath = "/attendance"
	const correctionPath = "/attendance-corrections"
	const leavePath = "/leave-requests"
	f.call("GET", attendancePath+"/stats", "", nil, 401)
	f.do("POST", attendancePath+"/check-in", member, "https://other.test", nil, 403)
	f.call("GET", "/audit-logs", manager, nil, 403)
	f.call("GET", leavePath+"/employee-options", member, nil, 403)
	f.call("GET", leavePath+"/employee-options", hr, nil, 200)
	f.call("POST", attendancePath+"/check-out", member, nil, 409)
	raceWorkRequests(t, f, 200, workRequest{attendancePath + "/check-in", member, nil}, workRequest{attendancePath + "/check-in", member, nil})
	time.Sleep(2 * time.Millisecond)
	raceWorkRequests(t, f, 200, workRequest{attendancePath + "/check-out", member, nil}, workRequest{attendancePath + "/check-out", member, nil})
	my := f.call("GET", attendancePath+"/me/today", member, nil, 200).(map[string]any)
	if my["date"] != workday.Display(today) || my["checkIn"] == nil || my["checkOut"] == nil {
		t.Fatalf("missing Jakarta attendance: %v", my)
	}
	old := today.AddDate(0, 0, -3)
	correction := map[string]string{"date": old.Format(time.DateOnly), "checkIn": "08:30", "checkOut": "18:30", "reason": "Fixture <script>"}
	f.call("POST", correctionPath, member, map[string]string{"date": today.AddDate(0, 0, -31).Format(time.DateOnly), "checkIn": "08:00", "reason": "Fixture"}, 422)
	raceWorkRequests(t, f, 201, workRequest{correctionPath, member, correction}, workRequest{correctionPath, member, correction})
	corrections := f.call("GET", correctionPath, manager, nil, 200).([]any)
	if len(corrections) != 1 || corrections[0].(map[string]any)["canReview"] != true {
		t.Fatalf("manager scope: %v", corrections)
	}
	correctionID := corrections[0].(map[string]any)["id"].(string)
	f.call("POST", correctionPath+"/"+correctionID+"/approve", otherManager, nil, 404)
	f.call("POST", correctionPath+"/"+correctionID+"/approve", member, nil, 403)
	f.call("POST", correctionPath+"/"+correctionID+"/approve", manager, nil, 200)
	f.call("POST", correctionPath+"/"+correctionID+"/reject", hr, map[string]string{"reason": "Already approved"}, 409)
	var corrected attendance.Attendance
	must(db.Where(`"employeeId" = ? AND date = ?`, employeeID, old).Take(&corrected).Error)
	if corrected.WorkHours != 10 || corrected.OvertimeHours != 1.5 || corrected.LateInMinutes != 30 || corrected.Status != "LATE" {
		t.Fatalf("incorrect storage after correction: %+v", corrected)
	}
	if age := time.Since(corrected.CreatedAt); age < -time.Second || age > time.Minute {
		t.Fatalf("attendance creation time was not stored in UTC: %v", corrected.CreatedAt)
	}
	daily := f.call("GET", attendancePath+"/daily?date="+old.Format(time.DateOnly), member, nil, 200).([]any)
	if len(daily) != 1 || daily[0].(map[string]any)["jamMasuk"] != "08:30" {
		t.Fatalf("incorrect daily register: %v", daily)
	}
	monthly := f.call("GET", fmt.Sprintf("%s/monthly?month=%d&year=%d", attendancePath, old.Month(), old.Year()), member, nil, 200).(map[string]any)
	if rows := monthly["rows"].([]any); len(rows) != 1 || rows[0].(map[string]any)["jamLembur"].(float64) < 1.5 {
		t.Fatalf("incorrect monthly payroll inputs: %v", monthly)
	}
	f.call("GET", attendancePath+"/daily?date=2026-02-30", member, nil, 422)

	start := time.Date(today.Year()+1, time.January, 4, 0, 0, 0, 0, time.UTC)
	for start.Weekday() != time.Monday {
		start = start.AddDate(0, 0, 1)
	}
	holiday := start.AddDate(0, 0, 1)
	must(db.Clauses(clause.OnConflict{DoNothing: true}).Create(&settings.Holiday{ID: uuid.NewString(), Date: holiday, Name: "Fixture holiday"}).Error)
	annual := func(s, e time.Time) map[string]string {
		return map[string]string{"type": "ANNUAL", "startDate": s.Format(time.DateOnly), "endDate": e.Format(time.DateOnly), "reason": "Family leave"}
	}
	first := annual(start, start.AddDate(0, 0, 2))
	forged := annual(start, start)
	forged["employeeId"] = outsiderID
	f.call("POST", leavePath, member, forged, 403)
	preview := f.call("POST", leavePath+"/preview", member, map[string]string{"startDate": first["startDate"], "endDate": first["endDate"]}, 200).(map[string]any)
	if preview["workingDays"] != float64(2) || preview["year"] != float64(start.Year()) || preview["available"] != float64(2) {
		t.Fatalf("wrong leave preview: %v", preview)
	}
	second := annual(start.AddDate(0, 0, 3), start.AddDate(0, 0, 4))
	raceWorkRequests(t, f, 201, workRequest{leavePath, member, first}, workRequest{leavePath, member, first}, workRequest{leavePath, member, second})
	leaves := f.call("GET", leavePath, manager, nil, 200).([]any)
	if len(leaves) != 1 || leaves[0].(map[string]any)["durasi"] != float64(2) || leaves[0].(map[string]any)["canApprove"] != true {
		t.Fatalf("manager leave list/duration: %v", leaves)
	}
	firstLeave := leaves[0].(map[string]any)
	if label := firstLeave["nextStep"]; label != "Menunggu persetujuan atasan (Fixture <MANAGER>)" {
		t.Fatalf("unexpected pending leave label: %v", label)
	}
	leaveID := firstLeave["id"].(string)
	if data := f.call("GET", "/dashboard/pending-approvals", manager, nil, 200).(map[string]any); data["leave"] != float64(1) || data["attendanceCorrection"] != float64(0) {
		t.Fatalf("unexpected badges: %v", data)
	}
	f.call("POST", leavePath+"/"+leaveID+"/approve", outsider, nil, 404)
	f.call("POST", leavePath+"/"+leaveID+"/approve", manager, nil, 200)
	managerApproved := f.call("GET", leavePath, member, nil, 200).([]any)[0].(map[string]any)
	if managerApproved["nextStep"] != "Menunggu persetujuan akhir HR" {
		t.Fatalf("unexpected manager-approved label: %v", managerApproved)
	}
	f.call("POST", leavePath+"/"+leaveID+"/approve", manager, nil, 403)
	raceWorkRequests(t, f, 200, workRequest{leavePath + "/" + leaveID + "/approve", hr, nil}, workRequest{leavePath + "/" + leaveID + "/approve", hr, nil})
	approved := f.call("GET", leavePath, member, nil, 200).([]any)[0].(map[string]any)
	if approved["nextStep"] != nil {
		t.Fatalf("a final decision has another approval step: %v", approved)
	}
	f.call("POST", leavePath+"/"+leaveID+"/cancel", member, nil, 409)
	current := f.call("GET", leavePath+"/me/balance", member, nil, 200).(map[string]any)
	if current["used"] != float64(0) || current["remaining"] != float64(2) {
		t.Fatalf("future leave consumed current Jakarta year: %v", current)
	}
	list := f.call("GET", "/audit-logs", hr, nil, 200).([]any)
	if len(list) < 3 {
		t.Fatalf("expected audit from two leave stages and a correction, got %d", len(list))
	}
	var auditCount int64
	must(db.Model(&audit.AuditLog{}).Where(`"entityId" IN ?`, []string{leaveID, correctionID}).Count(&auditCount).Error)
	if auditCount != 3 {
		t.Fatalf("outcome was audited %d times", auditCount)
	}

	pendingPath := func(path, token string) string {
		t.Helper()
		for _, value := range f.call("GET", path, token, nil, 200).([]any) {
			row := value.(map[string]any)
			if row["status"] == "PENDING" {
				return path + "/" + row["id"].(string)
			}
		}
		t.Fatalf("no pending request for %s", path)
		return ""
	}
	f.call("POST", correctionPath, outsider, correction, 201)
	rejectedCorrection := pendingPath(correctionPath, outsider)
	f.call("POST", rejectedCorrection+"/reject", hr, map[string]string{"reason": "Waktu tidak sesuai"}, 200)
	f.call("POST", rejectedCorrection+"/cancel", outsider, nil, 409)
	f.call("POST", correctionPath, outsider, correction, 201)
	pendingCorrection := pendingPath(correctionPath, outsider)
	f.call("POST", pendingCorrection+"/cancel", outsider, nil, 200)
	var outsiderRecords int64
	must(db.Model(&attendance.Attendance{}).Where(`"employeeId" = ?`, outsiderID).Count(&outsiderRecords).Error)
	if outsiderRecords != 0 {
		t.Fatal("rejecting or cancelling a correction wrote attendance")
	}

	f.call("POST", leavePath, outsider, first, 201)
	rejectedLeave := pendingPath(leavePath, outsider)
	f.call("POST", rejectedLeave+"/reject", hr, map[string]string{"reason": " "}, 422)
	f.call("POST", rejectedLeave+"/reject", hr, map[string]string{"reason": "Mohon ajukan ulang"}, 200)
	f.call("POST", leavePath, outsider, first, 201)
	pendingLeave := pendingPath(leavePath, outsider)
	f.call("POST", pendingLeave+"/cancel", outsider, nil, 200)
	sick := annual(today.AddDate(0, 0, -2), today.AddDate(0, 0, 2))
	sick["type"] = "SICK"
	f.call("POST", leavePath, outsider, sick, 201)
	sickLeave := pendingPath(leavePath, outsider)
	f.call("POST", sickLeave+"/approve", hr, nil, 200)
	f.call("POST", attendancePath+"/check-in", outsider, nil, 409)
	onLeave := f.call("GET", attendancePath+"/me/today", outsider, nil, 200).(map[string]any)
	if onLeave["onLeave"] != true || onLeave["status"] != "SICK" {
		t.Fatalf("approved leave was not reflected in attendance: %v", onLeave)
	}

	salaryID := uuid.NewString()
	must(db.Create(&payroll.Salary{ID: salaryID, EmployeeID: employeeID, PeriodMonth: 11, PeriodYear: 2026, TotalNet: 1234567, IsPaid: true}).Error)
	must(db.Exec(`INSERT INTO "EMSNotificationOutbox" (id,kind,payload) VALUES (?, 'SALARY_PAID', jsonb_build_object('salaryId', CAST(? AS text)))`, "salary-paid:"+salaryID, salaryID).Error)
	sent := map[string]string{}
	sends := make(chan [2]string, 2)
	worker := notification.Worker{DB: db, Origin: fixtureOrigin, Send: func(_, subject, html, id string) error {
		sends <- [2]string{id, subject + " " + html}
		return nil
	}}
	for {
		finished := make(chan error, 2)
		for range 2 {
			go func() {
				_, err := worker.DeliverOne(context.Background())
				finished <- err
			}()
		}
		must(<-finished)
		must(<-finished)
		if len(sends) == 0 {
			break
		}
		for len(sends) > 0 {
			delivery := <-sends
			if _, duplicate := sent[delivery[0]]; duplicate {
				t.Errorf("duplicate delivery of %s", delivery[0])
			}
			sent[delivery[0]] = delivery[1]
		}
	}
	if body := sent["salary-paid:"+salaryID]; !strings.Contains(body, "1.234.567") || !strings.Contains(body, "/dashboard/salary/"+salaryID+"/slip") {
		t.Fatalf("legacy payment did not reach Go email worker: %q", body)
	}
	hasCorrection := false
	for id, body := range sent {
		if strings.HasPrefix(id, "correction:"+correctionID+":") {
			hasCorrection = true
			if !strings.Contains(body, "&lt;EMPLOYEE&gt;") || strings.Contains(body, "<EMPLOYEE>") {
				t.Fatal("employee email HTML was not escaped")
			}
		}
	}
	if !hasCorrection {
		t.Fatal("correction notification missing")
	}
	var delivered notification.Job
	must(db.Take(&delivered, "id = ?", "salary-paid:"+salaryID).Error)
	if delivered.DeliveredAt == nil || string(delivered.Payload) != "{}" {
		t.Fatalf("delivered payload retained: %+v", delivered)
	}

	retryID := "retry:" + uuid.NewString()
	payload, err := json.Marshal(notification.Message{Email: "fixture@phase3.test", Subject: "Retry", Path: "/dashboard/attendance"})
	must(err)
	must(db.Create(&notification.Job{ID: retryID, Kind: "MESSAGE", Payload: payload, AvailableAt: time.Now().UTC()}).Error)
	worker.Send = func(_, _, _, _ string) error { return errors.New("temporary SMTP failure") }
	took, err := worker.DeliverOne(context.Background())
	must(err)
	var pending notification.Job
	must(db.Take(&pending, "id = ?", retryID).Error)
	if !took || pending.Attempts != 1 || pending.AvailableAt.Before(time.Now().Add(20*time.Second)) || pending.LeaseUntil != nil {
		t.Fatalf("incorrect retry: %+v", pending)
	}
}
