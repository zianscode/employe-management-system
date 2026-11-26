package identity

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (s *Service) Forgot(ctx context.Context, email string) error {
	allowed, err := s.Rate(ctx, "reset-email:"+email, 3, time.Hour)
	if err != nil || !allowed {
		return err
	}
	if s.SendReset == nil {
		return nil
	}
	select {
	case s.resetSlots <- struct{}{}:
	default:
		return nil
	}
	go func() {
		defer func() { <-s.resetSlots }()
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := s.issueReset(ctx, email); err != nil {
			slog.Warn("password reset email delivery failed")
		}
	}()
	return nil
}

func (s *Service) issueReset(ctx context.Context, email string) error {
	db := s.DB.WithContext(ctx)
	token := secret()
	now := time.Now().UTC()
	var user User
	if err := db.Transaction(func(tx *gorm.DB) error {
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Take(&user, "email = ?", email).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		if err != nil {
			return err
		}
		if err := tx.Where(`"userId" = ? AND expires <= ?`, user.ID, now).Delete(&PasswordResetToken{}).Error; err != nil {
			return err
		}
		return tx.Create(&PasswordResetToken{ID: uuid.NewString(), Token: "sha256:" + digest(token), Expires: now.Add(time.Hour), UserID: user.ID, CreatedAt: now}).Error
	}); err != nil {
		return err
	}
	if user.ID == "" {
		return nil
	}
	return s.SendReset(email, s.Origin+"/auth/reset-password?token="+token)
}

func invalidReset() error { return web.Invalid("Token tidak valid atau sudah kadaluwarsa.") }
func (s *Service) ValidateReset(ctx context.Context, raw string) (string, error) {
	if !validSecret(raw) {
		return "", invalidReset()
	}
	var row struct{ Email string }
	err := s.DB.WithContext(ctx).Table(`"PasswordResetToken" AS t`).Select("u.email").Joins(`JOIN "User" AS u ON u.id=t."userId"`).
		Where("t.token=? AND t.expires>?", "sha256:"+digest(raw), time.Now().UTC()).Take(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", invalidReset()
	}
	return row.Email, err
}

func (s *Service) Reset(ctx context.Context, raw, password string) error {
	if !validSecret(raw) {
		return invalidReset()
	}
	key := "sha256:" + digest(raw)
	db := s.DB.WithContext(ctx)
	var located PasswordResetToken
	if err := db.Take(&located, "token = ? AND expires > ?", key, time.Now().UTC()).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return invalidReset()
		}
		return err
	}
	hash, err := HashPassword(password)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		var user User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Take(&user, "id = ?", located.UserID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return invalidReset()
			}
			return err
		}
		var token PasswordResetToken
		if err := tx.Take(&token, "token = ? AND expires > ?", key, time.Now().UTC()).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return invalidReset()
			}
			return err
		}
		if err := tx.Model(&user).Updates(map[string]any{"password": hash, "mustChangePassword": false, "failedLoginAttempts": 0, "lockedUntil": nil}).Error; err != nil {
			return err
		}
		return Revoke(tx, user.ID, "")
	})
}
