package httpapi

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/notification"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/payroll"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

// This suite remains independent of the legacy frontend and its test fixtures.
func TestPayrollAndReportingREST(t *testing.T) {
	databaseURL := os.Getenv("EMS_PAYROLL_TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("set EMS_PAYROLL_TEST_DATABASE_URL to the disposable migrated phase5_rest database")
	}
	target, err := url.Parse(databaseURL)
	if err != nil || target.Hostname() != "127.0.0.1" || target.Path != "/phase5_rest" {
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
	const password = "PayrollFixturePass8"
	hash, err := identity.HashPassword(password)
	must(err)
	service, err := identity.New(db, fixtureOrigin, false, nil)
	must(err)
	router := New(pool.PingContext)
	RegisterBusiness(router, db, service, employees.AvatarStore{Directory: t.TempDir()})
	f := phase2Fixture{router, t, "192.0.2.219:1234"}
	seed := func(roleName string, base int32, manager *string) (string, string) {
		t.Helper()
		role := identity.Role{ID: uuid.NewString(), Name: roleName}
		must(db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "name"}}, DoNothing: true}).Create(&role).Error)
		role = identity.Role{}
		must(db.Take(&role, "name = ?", roleName).Error)
		user := identity.User{ID: uuid.NewString(), Email: uuid.NewString() + "@payroll.test", RoleID: role.ID, Password: hash}
		must(db.Create(&user).Error)
		person := employees.Employee{
			ID: uuid.NewString(), UserID: &user.ID, Email: user.Email, Name: "Fixture " + roleName,
			SalaryBase: base, ManagerID: manager, IsProfileComplete: true, Status: "ACTIVE", PTKPStatus: "TK0", EmploymentType: "FULL_TIME",
		}
		must(db.Create(&person).Error)
		return f.login(user.Email, password), person.ID
	}
	hr, _ := seed("HR", 0, nil)
	manager, managerID := seed("MANAGER", 0, nil)
	member, employeeID := seed("EMPLOYEE", 6000000, &managerID)
	cfg, err := settings.Company(db)
	must(err)
	must(db.Model(&cfg).Update("overtimeRatePerHour", 25001).Error)
	must(db.Create(&attendance.Attendance{
		ID: uuid.NewString(), EmployeeID: employeeID, Date: time.Date(2094, 4, 5, 0, 0, 0, 0, time.UTC),
		Status: "PRESENT", IsOvertime: true, OvertimeHours: 1.25,
	}).Error)

	components := "/employees/" + employeeID + "/payroll-components"
	f.call("GET", components, member, nil, 403)
	f.call("POST", components, hr, map[string]any{"type": "ALLOWANCE", "name": "Fixture Allowance", "amount": 1000000}, 201)
	f.call("POST", components, hr, map[string]any{"type": "DEDUCTION", "name": "Fixture Deduction", "amount": 100000}, 201)
	const period = "/payroll-periods/2094/4"
	f.call("POST", period+"/generate", member, nil, 403)
	f.call("POST", period+"/generate", hr, nil, 200)
	items := f.call("GET", "/salaries?month=4&year=2094", member, nil, 200).([]any)
	if len(items) != 1 {
		t.Fatalf("employee received %d slips, want one", len(items))
	}
	slip := items[0].(map[string]any)
	if slip["totalSalary"] != float64(6843361) || slip["pph21"] != float64(87890) || slip["overtimePay"] != float64(31251) {
		t.Fatalf("monthly legacy payroll vector differs: %v", slip)
	}
	id := slip["id"].(string)
	f.call("GET", "/salaries/"+id+"/slip", manager, nil, 404)
	f.call("GET", "/salaries/"+id+"/slip", member, nil, 200)
	f.call("POST", "/salaries/"+id+"/mark-paid", hr, nil, 200)
	f.call("POST", "/salaries/"+id+"/mark-paid", hr, nil, 409)
	var frozen payroll.Salary
	must(db.Take(&frozen, "id = ?", id).Error)
	if !frozen.IsPaid || frozen.PaidAt == nil {
		t.Fatal("payment was not committed")
	}
	allowance := f.call("GET", components, hr, nil, 200).([]any)[0].(map[string]any)["id"].(string)
	f.call("DELETE", "/payroll-components/"+allowance, hr, nil, 200)
	f.call("POST", period+"/generate", hr, nil, 200)
	var after payroll.Salary
	must(db.Take(&after, "id = ?", id).Error)
	if !reflect.DeepEqual(frozen, after) {
		t.Fatal("generating after payment changed a paid slip")
	}
	var events int64
	must(db.Model(&notification.Job{}).Where("id = ?", "salary-paid:"+id).Count(&events).Error)
	if events != 1 {
		t.Fatalf("outbox event count = %d", events)
	}
	f.call("GET", "/reports/salary?month=4&year=2094", hr, nil, 200)
	f.call("GET", "/reports/salary?month=4&year=2094", manager, nil, 403)
	f.call("GET", "/dashboard/stats", member, nil, 200)
	f.call("GET", "/dashboard/me", member, nil, 200)
	f.call("GET", "/audit-logs", hr, nil, 200)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/reports/salary.csv?month=4&year=2094", nil)
	request.AddCookie(&http.Cookie{Name: identity.CookieName, Value: hr})
	csv := httptest.NewRecorder()
	router.ServeHTTP(csv, request)
	if csv.Code != 200 || !strings.Contains(csv.Header().Get("Content-Disposition"), "laporan-gaji-2094-04.csv") ||
		!bytes.HasPrefix(csv.Body.Bytes(), []byte("\ufeffDivisi;Jumlah Karyawan;Total Gross;Total Net")) {
		t.Fatalf("invalid CSV response: %d, %s", csv.Code, csv.Body)
	}
}
