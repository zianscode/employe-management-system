package identity

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log/slog"
	"math/big"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const CookieName = "ems_session"
const sessionTTL = 30 * 24 * time.Hour
const accountJoin = `JOIN "Role" AS r ON r.id=u."roleId" LEFT JOIN "Employee" AS e ON e."userId"=u.id`
const actorFields = `u.id,u.email,r.name AS role,e.id AS employee_id,e.name,e.avatar AS image,e.status AS employee_status,
    COALESCE(e."isProfileComplete",false) AS is_profile_complete,u."mustChangePassword" AS must_change_password`

type Actor struct {
	ID                 string    `json:"id"`
	Email              string    `json:"email"`
	Name               *string   `json:"name"`
	Role               string    `json:"role"`
	EmployeeID         *string   `json:"employeeId"`
	EmployeeStatus     *string   `json:"-"`
	Image              *string   `json:"image"`
	IsProfileComplete  bool      `json:"isProfileComplete"`
	MustChangePassword bool      `json:"mustChangePassword"`
	Expires            time.Time `json:"-"`
}

func IsAdmin(role string) bool   { return role == "HR" || role == "SUPER_ADMIN" }
func KnownRole(role string) bool { return IsAdmin(role) || role == "MANAGER" || role == "EMPLOYEE" }
func inactive(status *string) bool {
	return status != nil && (*status == "RESIGNED" || *status == "TERMINATED")
}
func CanManage(role, target string) bool {
	return IsAdmin(role) && (target != "SUPER_ADMIN" || role == "SUPER_ADMIN")
}
func Manage(role, target string) error {
	if !CanManage(role, target) {
		return web.Forbidden("Hanya Super Admin yang bisa mengelola akun Super Admin")
	}
	return nil
}

type AccountInfo struct {
	UserID      string  `json:"userId"`
	State       string  `json:"state"`
	LockedUntil *string `json:"lockedUntil"`
}

func AccountStatus(id string, mustChange bool, locked *time.Time, status *string) AccountInfo {
	a := AccountInfo{UserID: id, State: "ACTIVE"}
	if inactive(status) {
		a.State = "INACTIVE"
	} else if locked != nil && locked.After(time.Now()) {
		a.State = "LOCKED"
		a.LockedUntil = web.Ptr(locked.In(web.Jakarta).Format("15.04"))
	} else if mustChange {
		a.State = "MUST_CHANGE_PASSWORD"
	}
	return a
}

type Session struct {
	Digest    string    `gorm:"column:digest;primaryKey"`
	UserID    string    `gorm:"column:userId"`
	ExpiresAt time.Time `gorm:"column:expiresAt"`
}

func (Session) TableName() string { return "EMSSession" }

type PasswordInput struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
	ConfirmPassword string `json:"confirmPassword"`
}

type Service struct {
	DB           *gorm.DB
	Origin       string
	SecureCookie bool
	SendReset    func(email, link string) error
	dummy        []byte
	resetSlots   chan struct{}
}

func New(db *gorm.DB, origin string, secure bool, send func(string, string) error) (*Service, error) {
	dummy, err := bcrypt.GenerateFromPassword([]byte(rand.Text()), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return &Service{DB: db, Origin: origin, SecureCookie: secure, SendReset: send, dummy: dummy, resetSlots: make(chan struct{}, 8)}, nil
}

func NormalizeEmail(value string) (string, error) {
	email := strings.ToLower(strings.TrimSpace(value))
	address, err := mail.ParseAddress(email)
	if err != nil || len(email) > 254 || address.Address != email {
		return "", web.Invalid("Format email tidak valid")
	}
	return email, nil
}

var letter = regexp.MustCompile(`[a-zA-Z]`)
var digit = regexp.MustCompile(`[0-9]`)

func HashPassword(password string) (string, error) {
	if strings.TrimSpace(password) != password || len(password) > 72 || strings.ContainsRune(password, 0) {
		return "", web.Invalid("Password tidak boleh diawali atau diakhiri spasi dan maksimal 72 byte")
	}
	if !web.Text(password, 8, 72) || !letter.MatchString(password) || !digit.MatchString(password) {
		return "", web.Invalid("Password minimal 8 karakter, berisi huruf dan angka")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}
func matches(hash, password string) bool {
	if strings.ContainsRune(password, 0) {
		return false
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), legacyPasswordBytes(password)) == nil {
		return true
	}
	trimmed := strings.TrimSpace(password)
	return trimmed != password && bcrypt.CompareHashAndPassword([]byte(hash), legacyPasswordBytes(trimmed)) == nil
}

// bcryptjs accepted long input and used its first 72 UTF-8 bytes.
func legacyPasswordBytes(password string) []byte { return []byte(password[:min(len(password), 72)]) }
func TemporaryPassword() (string, string, error) {
	const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
	var password [12]byte
	for {
		for i := range password {
			n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
			if err != nil {
				return "", "", err
			}
			password[i] = alphabet[n.Int64()]
		}
		if value := string(password[:]); letter.MatchString(value) && digit.MatchString(value) {
			hash, err := HashPassword(value)
			return value, hash, err
		}
	}
}

func digest(raw string) string { sum := sha256.Sum256([]byte(raw)); return hex.EncodeToString(sum[:]) }
func secret() string           { var buf [32]byte; _, _ = rand.Read(buf[:]); return hex.EncodeToString(buf[:]) }
func validSecret(raw string) bool {
	if len(raw) != 64 {
		return false
	}
	_, err := hex.DecodeString(raw)
	return err == nil
}

func (s *Service) Lookup(ctx context.Context, token string) (Actor, error) {
	if !validSecret(token) {
		return Actor{}, unauthorized()
	}
	var actor Actor
	q := s.DB.WithContext(ctx).Table(`"User" AS u`).Select(actorFields+`, s."expiresAt" AS expires`).Joins(accountJoin).
		Joins(`JOIN "EMSSession" AS s ON s."userId"=u.id`).Where(`s.digest=? AND s."expiresAt">?`, digest(token), time.Now().UTC())
	if err := q.Take(&actor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Actor{}, unauthorized()
		}
		return Actor{}, err
	}
	if !KnownRole(actor.Role) || inactive(actor.EmployeeStatus) {
		return Actor{}, unauthorized()
	}
	if actor.Image != nil && len(*actor.Image) > 2000 && strings.HasPrefix(*actor.Image, "data:image") {
		actor.Image = nil
	}
	return actor, nil
}

func unauthorized() error {
	return web.Failure{Status: 401, Code: "UNAUTHENTICATED", Detail: "Sesi berakhir, silakan login kembali"}
}
func invalidCredentials() error {
	return web.Failure{Status: 401, Code: "invalid_credentials", Detail: "Email atau password salah"}
}

func (s *Service) Login(ctx context.Context, email, password string) (string, error) {
	now := time.Now().UTC()
	var authErr error
	var token string
	err := s.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var user User
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("email = ?", email).Take(&user).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			_ = bcrypt.CompareHashAndPassword(s.dummy, legacyPasswordBytes(password))
			authErr = invalidCredentials()
			return nil
		}
		if err != nil {
			return err
		}
		if user.LockedUntil != nil && user.LockedUntil.After(now) {
			authErr = web.Failure{Status: 423, Code: "account_locked", Detail: "Akun terkunci sementara"}
			return nil
		}
		if !matches(user.Password, password) {
			authErr = invalidCredentials()
			attempts := user.FailedLoginAttempts + 1
			var locked *time.Time
			if attempts >= 5 {
				attempts = 0
				locked = web.Ptr(now.Add(15 * time.Minute))
			}
			return tx.Model(&user).Updates(map[string]any{"failedLoginAttempts": attempts, "lockedUntil": locked}).Error
		}
		var actor Actor
		if err := tx.Table(`"User" AS u`).Select(actorFields).Joins(accountJoin).Where("u.id = ?", user.ID).Take(&actor).Error; err != nil {
			return err
		}
		if inactive(actor.EmployeeStatus) || !KnownRole(actor.Role) {
			authErr = web.Failure{Status: 403, Code: "account_inactive", Detail: "Akun tidak aktif"}
			return nil
		}
		if user.FailedLoginAttempts != 0 || user.LockedUntil != nil {
			if err := tx.Model(&user).Updates(map[string]any{"failedLoginAttempts": 0, "lockedUntil": nil}).Error; err != nil {
				return err
			}
		}
		if err := tx.Where(`"userId" = ? AND "expiresAt" <= ?`, user.ID, now).Delete(&Session{}).Error; err != nil {
			return err
		}
		token = secret()
		return tx.Create(&Session{Digest: digest(token), UserID: user.ID, ExpiresAt: now.Add(sessionTTL)}).Error
	})
	if err != nil {
		return "", err
	}
	return token, authErr
}

func (s *Service) Rate(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	now := time.Now().UTC()
	var count int
	err := s.DB.WithContext(ctx).Raw(`INSERT INTO "EMSRateLimit" (key,attempts,"expiresAt") VALUES (?,1,?)
	ON CONFLICT (key) DO UPDATE SET attempts = CASE WHEN "EMSRateLimit"."expiresAt"<=? THEN 1 ELSE LEAST("EMSRateLimit".attempts+1,?) END,
	"expiresAt" = CASE WHEN "EMSRateLimit"."expiresAt"<=? THEN EXCLUDED."expiresAt" ELSE "EMSRateLimit"."expiresAt" END RETURNING attempts`,
		digest(key), now.Add(window), now, limit+1, now).Row().Scan(&count)
	return count <= limit, err
}

func Revoke(tx *gorm.DB, userID, keepToken string) error {
	q := tx.Where(`"userId" = ?`, userID)
	if keepToken != "" {
		q = q.Where("digest <> ?", digest(keepToken))
	}
	if err := q.Delete(&Session{}).Error; err != nil {
		return err
	}
	return tx.Where(`"userId" = ?`, userID).Delete(&PasswordResetToken{}).Error
}

func (s *Service) PruneExpired(ctx context.Context) {
	tick := time.NewTicker(time.Hour)
	defer tick.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case now := <-tick.C:
			db := s.DB.WithContext(ctx)
			for _, query := range []string{`DELETE FROM "EMSSession" WHERE "expiresAt" <= ?`, `DELETE FROM "EMSRateLimit" WHERE "expiresAt" <= ?`} {
				if err := db.Exec(query, now.UTC()).Error; err != nil {
					slog.Warn("identity expiration cleanup failed")
				}
			}
		}
	}
}

func (s *Service) ChangePassword(ctx context.Context, actor Actor, input PasswordInput, token string) error {
	if input.NewPassword != input.ConfirmPassword {
		return web.Invalid("Konfirmasi password tidak sama")
	}
	hash, err := HashPassword(input.NewPassword)
	if err != nil {
		return err
	}
	return s.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var user User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Take(&user, "id = ?", actor.ID).Error; err != nil {
			return err
		}
		if !matches(user.Password, input.CurrentPassword) {
			return web.Invalid("Password saat ini yang Anda masukkan salah")
		}
		if matches(user.Password, input.NewPassword) {
			return web.Invalid("Password baru harus berbeda dari password saat ini")
		}
		if err := tx.Model(&user).Updates(map[string]any{"password": hash, "mustChangePassword": false, "failedLoginAttempts": 0, "lockedUntil": nil}).Error; err != nil {
			return err
		}
		return Revoke(tx, user.ID, token)
	})
}
