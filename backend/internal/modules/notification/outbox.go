package notification

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/mailer"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Job struct {
	ID          string          `gorm:"column:id;primaryKey"`
	Kind        string          `gorm:"column:kind"`
	Payload     json.RawMessage `gorm:"column:payload;type:jsonb;serializer:json"`
	Attempts    int             `gorm:"column:attempts"`
	AvailableAt time.Time       `gorm:"column:availableAt"`
	LeaseUntil  *time.Time      `gorm:"column:leaseUntil"`
	LeaseToken  *string         `gorm:"column:leaseToken"`
	DeliveredAt *time.Time      `gorm:"column:deliveredAt"`
	FailedAt    *time.Time      `gorm:"column:failedAt"`
}

func (Job) TableName() string { return "EMSNotificationOutbox" }

func SalariesPaid(tx *gorm.DB, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	payload, err := json.Marshal(ids)
	if err != nil {
		return err
	}
	return tx.Exec(`INSERT INTO "EMSNotificationOutbox" (id,kind,payload)
		SELECT 'salary-paid:' || id, 'SALARY_PAID', jsonb_build_object('salaryId',id)
		FROM jsonb_array_elements_text(CAST(? AS jsonb)) AS paid(id)
		ON CONFLICT (id) DO NOTHING`, string(payload)).Error
}

type Message struct {
	Email       string      `json:"email"`
	Name        string      `json:"name"`
	Subject     string      `json:"subject"`
	Text        string      `json:"text"`
	Details     [][2]string `json:"details"`
	ActionLabel string      `json:"actionLabel"`
	Path        string      `json:"path"`
}

func enqueue(tx *gorm.DB, event string, messages []Message) error {
	if len(messages) == 0 {
		return nil
	}
	now := time.Now().UTC()
	jobs := make([]Job, 0, len(messages))
	seen := make(map[string]bool, len(messages))
	for _, message := range messages {
		email := strings.ToLower(strings.TrimSpace(message.Email))
		if email == "" || seen[email] {
			continue
		}
		seen[email] = true
		payload, err := json.Marshal(message)
		if err != nil {
			return err
		}
		key := fmt.Sprintf("%s:%x", event, sha256.Sum256([]byte(email)))
		jobs = append(jobs, Job{ID: key, Kind: "MESSAGE", Payload: payload, AvailableAt: now})
	}
	if len(jobs) == 0 {
		return nil
	}
	return tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "id"}}, DoNothing: true}).Create(&jobs).Error
}

type Worker struct {
	DB     *gorm.DB
	Origin string
	Send   mailer.Sender
}

func (w Worker) Run(ctx context.Context) {
	if w.Send == nil {
		return
	}
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	for ctx.Err() == nil {
		took, err := w.DeliverOne(ctx)
		if err != nil && ctx.Err() == nil {
			slog.Warn("notification worker could not process the outbox")
		}
		if took && err == nil {
			continue
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (w Worker) DeliverOne(ctx context.Context) (bool, error) {
	var job Job
	lease := uuid.NewString()
	now := time.Now().UTC()
	db := w.DB.WithContext(ctx)
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
			Where(`"deliveredAt" IS NULL AND "failedAt" IS NULL AND "availableAt" <= ? AND ("leaseUntil" IS NULL OR "leaseUntil" <= ?)`, now, now).
			Order(`"availableAt",id`).Take(&job).Error; err != nil {
			return err
		}
		return tx.Model(&job).Updates(map[string]any{"leaseUntil": now.Add(time.Minute), "leaseToken": lease}).Error
	})
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	message, deliveryErr := w.message(db, job)
	if deliveryErr == nil && message != nil {
		var body string
		body, deliveryErr = render(w.Origin, *message)
		if deliveryErr == nil {
			deliveryErr = w.Send(message.Email, message.Subject, body, job.ID)
		}
	}
	now = time.Now().UTC()
	updates := map[string]any{"leaseToken": nil, "leaseUntil": nil}
	if deliveryErr == nil {
		updates["deliveredAt"] = now
		updates["payload"] = gorm.Expr("'{}'::jsonb")
	} else {
		updates["attempts"] = job.Attempts + 1
		if job.Attempts+1 >= 5 {
			updates["failedAt"] = now
			slog.Warn("notification exhausted retries", "kind", job.Kind)
		} else {
			updates["availableAt"] = now.Add(30 * time.Second << job.Attempts)
		}
	}
	return true, db.Model(&Job{}).Where(`id = ? AND "leaseToken" = ?`, job.ID, lease).Updates(updates).Error
}

func (w Worker) message(db *gorm.DB, job Job) (*Message, error) {
	switch job.Kind {
	case "MESSAGE":
		var message Message
		if err := json.Unmarshal(job.Payload, &message); err != nil {
			return nil, err
		}
		return &message, nil
	case "SALARY_PAID":
		var input struct {
			SalaryID string `json:"salaryId"`
		}
		if err := json.Unmarshal(job.Payload, &input); err != nil {
			return nil, err
		}
		return salaryPaid(db, input.SalaryID)
	default:
		return nil, errors.New("unknown notification kind")
	}
}
