package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/migrate"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/workday"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func main() {
	email := flag.String("email", "", "First administrator's email")
	name := flag.String("name", "", "First administrator's name")
	flag.Parse()
	if err := run(*email, *name); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Println("Administrator created. Change the initial password and complete onboarding on first login.")
}

func run(rawEmail, rawName string) error {
	email, err := identity.NormalizeEmail(rawEmail)
	if err != nil {
		return err
	}
	name := strings.TrimSpace(rawName)
	if !web.Text(name, 1, 150) {
		return errors.New("a name of 1–150 characters is required")
	}
	password := os.Getenv("BOOTSTRAP_ADMIN_PASSWORD")
	if password == "" {
		return errors.New("BOOTSTRAP_ADMIN_PASSWORD is required")
	}
	hash, err := identity.HashPassword(password)
	if err != nil {
		return err
	}
	db, pool, err := postgres.Open(os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer pool.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	ready, err := migrate.Readiness(pool)
	if err != nil {
		return errors.New("could not load Goose migration versions")
	}
	if err := ready(ctx); err != nil {
		return errors.New("database is unavailable or required migrations are pending")
	}
	if err := createAdmin(db.WithContext(ctx), email, name, hash); err != nil {
		if errors.Is(err, alreadyInitialized) {
			return err
		}
		return errors.New("could not create the first administrator")
	}
	return nil
}

var alreadyInitialized = errors.New("bootstrap requires an empty User and Employee table")

func createAdmin(db *gorm.DB, email, name, hash string) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT pg_advisory_xact_lock(430005, 1)").Error; err != nil {
			return err
		}
		var initialized bool
		if err := tx.Raw(`SELECT EXISTS(SELECT 1 FROM "User") OR EXISTS(SELECT 1 FROM "Employee")`).Scan(&initialized).Error; err != nil {
			return err
		}
		if initialized {
			return alreadyInitialized
		}
		for _, role := range []string{"SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"} {
			row := identity.Role{ID: uuid.NewString(), Name: role}
			if err := tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "name"}}, DoNothing: true}).Create(&row).Error; err != nil {
				return err
			}
		}
		var role identity.Role
		if err := tx.Take(&role, "name = ?", "SUPER_ADMIN").Error; err != nil {
			return err
		}
		company, err := settings.Company(tx)
		if err != nil {
			return err
		}
		user := identity.User{ID: uuid.NewString(), Email: email, RoleID: role.ID, Password: hash, MustChangePassword: true}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		employee := employees.Employee{
			ID: uuid.NewString(), UserID: &user.ID, Email: email, Name: name,
			Status: "ACTIVE", EmploymentType: "FULL_TIME", PTKPStatus: "TK0",
			JoinDate: web.Ptr(workday.Date(time.Now())), LeaveQuota: company.AnnualLeaveQuota,
		}
		return tx.Create(&employee).Error
	})
}
