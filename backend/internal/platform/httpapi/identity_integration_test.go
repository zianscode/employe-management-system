package httpapi

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/organization"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

const fixtureOrigin = "http://127.0.0.1:3000"

type phase2Fixture struct {
	router http.Handler
	t      *testing.T
	ip     string
}

func (f phase2Fixture) do(method, path, token, origin string, body any, status int) (map[string]any, *httptest.ResponseRecorder) {
	f.t.Helper()
	var raw []byte
	if body != nil {
		raw, _ = json.Marshal(body)
	}
	req := httptest.NewRequest(method, "/api/v1"+path, bytes.NewReader(raw))
	req.RemoteAddr = f.ip
	if origin != "" {
		req.Header.Set("Origin", origin)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.AddCookie(&http.Cookie{Name: identity.CookieName, Value: token})
	}
	w := httptest.NewRecorder()
	f.router.ServeHTTP(w, req)
	if w.Code != status {
		f.t.Fatalf("%s %s: expected %d, got %d: %s", method, path, status, w.Code, w.Body)
	}
	var value map[string]any
	if strings.Contains(w.Header().Get("Content-Type"), "json") {
		if err := json.Unmarshal(w.Body.Bytes(), &value); err != nil {
			f.t.Fatal(err)
		}
	}
	return value, w
}

func (f phase2Fixture) call(method, path, token string, body any, status int) any {
	f.t.Helper()
	value, _ := f.do(method, path, token, fixtureOrigin, body, status)
	return value["data"]
}
func (f phase2Fixture) login(email, password string) string {
	f.t.Helper()
	_, w := f.do("POST", "/auth/login", "", fixtureOrigin, map[string]string{"email": email, "password": password}, 200)
	cookies := w.Result().Cookies()
	if len(cookies) != 1 || cookies[0].Name != identity.CookieName || !cookies[0].HttpOnly || cookies[0].SameSite != http.SameSiteLaxMode {
		f.t.Fatal("unexpected session cookie attributes")
	}
	return cookies[0].Value
}

func TestPhase2REST(t *testing.T) {
	databaseURL := os.Getenv("EMS_PHASE2_TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("set EMS_PHASE2_TEST_DATABASE_URL to the disposable migrated phase2_test database")
	}
	target, err := url.Parse(databaseURL)
	if err != nil || target.Hostname() != "127.0.0.1" || target.Path != "/phase2_test" {
		t.Fatal("invalid disposable test database")
	}
	db, pool, err := postgres.Open(databaseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	roles := map[string]string{}
	for _, name := range []string{"SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"} {
		role := identity.Role{ID: uuid.NewString(), Name: name}
		if err := db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "name"}}, DoNothing: true}).Create(&role).Error; err != nil {
			t.Fatal(err)
		}
		role = identity.Role{}
		if err := db.Take(&role, "name = ?", name).Error; err != nil {
			t.Fatal(err)
		}
		roles[name] = role.ID
	}
	const adminPassword = "FixturePassword4"
	hash, err := identity.HashPassword(adminPassword)
	if err != nil {
		t.Fatal(err)
	}
	seed := func(role string) (string, string) {
		user := identity.User{ID: uuid.NewString(), Email: uuid.NewString() + "@phase2.test", RoleID: roles[role], Password: hash}
		if err := db.Create(&user).Error; err != nil {
			t.Fatal(err)
		}
		now := time.Now().UTC()
		row := employees.Employee{ID: uuid.NewString(), UserID: &user.ID, Name: "Fixture " + role, Email: user.Email, JoinDate: &now, Status: "ACTIVE", EmploymentType: "FULL_TIME", PTKPStatus: "TK0", IsProfileComplete: true}
		if err := db.Create(&row).Error; err != nil {
			t.Fatal(err)
		}
		return user.Email, row.ID
	}
	hrEmail, _ := seed("HR")
	superEmail, superID := seed("SUPER_ADMIN")
	managerEmail, _ := seed("MANAGER")
	lockedEmail, _ := seed("EMPLOYEE")
	mail := make(chan string, 8)
	service, err := identity.New(db, fixtureOrigin, false, func(_ string, link string) error { mail <- link; return nil })
	if err != nil {
		t.Fatal(err)
	}
	router := New(pool.PingContext)
	RegisterBusiness(router, db, service, employees.AvatarStore{Directory: t.TempDir()})
	f := phase2Fixture{router, t, fmt.Sprintf("192.0.2.%d:1234", time.Now().UnixNano()%253+1)}
	f.do("POST", "/auth/login", "", "https://unexpected.test", map[string]string{"email": hrEmail, "password": adminPassword}, 403)
	f.call("GET", "/auth/session", "", nil, 401)
	hr := f.login(hrEmail, " "+adminPassword+" ")
	super := f.login(superEmail, adminPassword)
	manager := f.login(managerEmail, adminPassword)
	if session := f.call("GET", "/auth/session", hr, nil, 200).(map[string]any); session["user"].(map[string]any)["role"] != "HR" {
		t.Fatal("role was not projected into the session")
	}
	var rawTokens int64
	if err := db.Model(&identity.Session{}).Where("digest = ?", hr).Count(&rawTokens).Error; err != nil || rawTokens != 0 {
		t.Fatal("session token was stored raw")
	}
	f.call("GET", "/users", manager, nil, 403)
	users := f.call("GET", "/users", hr, nil, 200).([]any)
	if len(users) < 4 {
		t.Fatal("admin users response is incomplete")
	}
	rolesVisible := f.call("GET", "/roles", hr, nil, 200).([]any)
	for _, row := range rolesVisible {
		if row.(map[string]any)["name"] == "SUPER_ADMIN" {
			t.Fatal("HR received Super Admin as a role option")
		}
	}
	f.call("PATCH", "/employees/"+superID, hr, map[string]string{"name": "Forbidden change"}, 403)
	for i := 0; i < 5; i++ {
		f.call("POST", "/auth/login", "", map[string]string{"email": lockedEmail, "password": "WrongPassword7"}, 401)
	}
	f.call("POST", "/auth/login", "", map[string]string{"email": lockedEmail, "password": adminPassword}, 423)

	label := uuid.NewString()
	f.call("POST", "/departments", hr, map[string]string{"name": "Divisi " + label}, 201)
	f.call("POST", "/positions", hr, map[string]any{"name": "Jabatan " + label, "salaryBase": 6500000}, 201)
	var department organization.Department
	var position organization.Position
	if err := db.Take(&department, "name = ?", "Divisi "+label).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Take(&position, "name = ?", "Jabatan "+label).Error; err != nil {
		t.Fatal(err)
	}
	f.call("GET", "/organization/form-options", hr, nil, 200)
	f.call("GET", "/organization", hr, nil, 200)
	f.call("PATCH", "/departments/"+department.ID, hr, map[string]string{"name": "Divisi " + label, "description": "Phase 2"}, 200)
	f.call("PATCH", "/positions/"+position.ID, hr, map[string]any{"name": "Jabatan " + label, "salaryBase": 6500000}, 200)

	company := f.call("GET", "/company-settings", super, nil, 200).(map[string]any)
	delete(company, "id")
	company["lateToleranceMinutes"] = 0
	f.call("PATCH", "/company-settings", super, company, 200)
	if updated := f.call("GET", "/company-settings", hr, nil, 200).(map[string]any); updated["lateToleranceMinutes"] != float64(0) {
		t.Fatal("zero-valued company field was lost")
	}
	future := time.Now().In(web.Jakarta).AddDate(15, 0, 0)
	date := future.Format(time.DateOnly)
	f.call("POST", "/holidays", hr, map[string]string{"name": "Hari Uji", "date": date}, 201)
	f.call("POST", "/holidays", hr, map[string]string{"name": "Hari Uji", "date": date}, 409)
	items := f.call("GET", "/holidays?year="+future.Format("2006"), hr, nil, 200).([]any)
	var holidayID string
	for _, item := range items {
		row := item.(map[string]any)
		if row["dateKey"] == date {
			holidayID = row["id"].(string)
		}
	}
	if holidayID == "" {
		t.Fatal("holiday not found in yearly view")
	}
	f.call("GET", "/holidays/upcoming", manager, nil, 200)
	f.call("DELETE", "/holidays/"+holidayID, hr, nil, 200)

	employeeEmail := label + "@phase2.test"
	form := map[string]any{"name": "Migrated Employee", "email": employeeEmail, "nip": "NIP-" + label + "001", "roleId": roles["SUPER_ADMIN"], "status": "PROBATION",
		"employmentType": "FULL_TIME", "departmentId": department.ID, "positionId": position.ID, "birthDate": "", "joinDate": "2026-01-01", "bpjsKesehatan": false}
	f.call("POST", "/employees", hr, form, 403)
	form["roleId"] = roles["EMPLOYEE"]
	created := f.call("POST", "/employees", hr, form, 201).(map[string]any)
	employeeID := created["id"].(string)
	temporary := created["temporaryPassword"].(string)
	row := f.call("GET", "/employees/"+employeeID, hr, nil, 200).(map[string]any)
	if row["salaryBase"] != float64(6500000) || row["bpjsKesehatan"] != false || row["roleId"] != roles["EMPLOYEE"] {
		t.Fatal("employee defaults and selected values do not match")
	}
	userID := row["account"].(map[string]any)["userId"].(string)
	f.call("GET", "/employees?status=PROBATION", hr, nil, 200)
	f.call("GET", "/employees/"+employeeID+"/history", hr, nil, 200)
	f.call("PATCH", "/employees/"+employeeID+"/role", hr, map[string]string{"roleId": roles["SUPER_ADMIN"]}, 403)
	f.call("PATCH", "/employees/"+employeeID, hr, map[string]any{"name": "Updated Employee", "managerId": superID, "positionId": "OTHER", "customPosition": position.Name}, 200)
	f.call("PATCH", "/employees/"+employeeID, hr, map[string]any{"managerId": nil}, 200)
	f.call("DELETE", "/departments/"+department.ID, hr, nil, 409)
	f.call("DELETE", "/positions/"+position.ID, hr, nil, 409)
	f.call("POST", "/employees/"+employeeID+"/activate", hr, nil, 200)

	staff := f.login(employeeEmail, temporary)
	f.call("GET", "/me", staff, nil, 403)
	f.call("POST", "/me/onboarding", staff, map[string]any{}, 403)
	const changedPassword = "Phase2Password7"
	f.call("POST", "/auth/password/change", staff, map[string]string{"currentPassword": temporary, "newPassword": changedPassword, "confirmPassword": changedPassword}, 200)
	var avatar bytes.Buffer
	if err := png.Encode(&avatar, image.NewRGBA(image.Rect(0, 0, 2, 2))); err != nil {
		t.Fatal(err)
	}
	onboarding := map[string]string{"phone": "+628123456789", "address": "Jalan Uji", "gender": "FEMALE", "placeOfBirth": "Jakarta", "birthDate": "1990-03-15",
		"identityNumber": "1234567890123456", "bankName": "Bank Uji", "bankAccount": "12345678", "bankHolderName": "Pemilik Uji", "emergencyName": "Kontak Uji", "emergencyPhone": "08123456789", "emergencyRelation": "Saudara",
		"avatar": "data:image/png;base64," + base64.StdEncoding.EncodeToString(avatar.Bytes())}
	result := f.call("POST", "/me/onboarding", staff, onboarding, 200).(map[string]any)
	avatarPath := "/avatars/" + strings.TrimPrefix(result["avatar"].(string), "/uploads/avatars/")
	f.call("GET", avatarPath, staff, nil, 200)
	f.call("GET", avatarPath, "", nil, 401)
	f.call("GET", "/me", staff, nil, 200)
	f.call("POST", "/me/onboarding", staff, onboarding, 409)
	newEmail := "updated-" + employeeEmail
	f.call("PATCH", "/me", staff, map[string]string{"namaLengkap": "Profile Update", "email": newEmail, "bio": "New bio"}, 200)
	profile := f.call("GET", "/me", staff, nil, 200).(map[string]any)
	if profile["email"] != newEmail || profile["namaLengkap"] != "Profile Update" {
		t.Fatal("profile mutation not persisted")
	}
	staff2 := f.login(newEmail, changedPassword)
	f.call("POST", "/auth/password/forgot", "", map[string]string{"email": newEmail}, 200)
	var resetLink string
	select {
	case resetLink = <-mail:
	case <-time.After(time.Second):
		t.Fatal("reset delivery not scheduled")
	}
	link, _ := url.Parse(resetLink)
	token := link.Query().Get("token")
	var stored identity.PasswordResetToken
	if err := db.Take(&stored, `"userId"=?`, userID).Error; err != nil || stored.Token == token || !strings.HasPrefix(stored.Token, "sha256:") {
		t.Fatal("reset token was not stored as a digest")
	}
	f.call("POST", "/auth/password/reset/validate", "", map[string]string{"token": token}, 200)
	f.call("POST", "/auth/password/reset", "", map[string]string{"token": token, "newPassword": "RestoredPassword8"}, 200)
	f.call("POST", "/auth/password/reset/validate", "", map[string]string{"token": token}, 422)
	f.call("GET", "/auth/session", staff, nil, 401)
	f.call("GET", "/auth/session", staff2, nil, 401)
	staff = f.login(newEmail, "RestoredPassword8")
	f.call("POST", "/users/"+userID+"/unlock", hr, nil, 200)
	f.call("POST", "/users/"+userID+"/reset-password", hr, nil, 200)
	f.call("GET", "/auth/session", staff, nil, 401)
	f.call("POST", "/auth/logout", manager, nil, 204)
	f.call("GET", "/auth/session", manager, nil, 401)
	f.call("DELETE", "/employees/"+employeeID, hr, nil, 200)
	f.call("DELETE", "/departments/"+department.ID, hr, nil, 200)
	f.call("DELETE", "/positions/"+position.ID, hr, nil, 200)
}
