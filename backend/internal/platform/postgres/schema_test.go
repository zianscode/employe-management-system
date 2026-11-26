package postgres_test

import (
	"context"
	"os"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/attendance"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/audit"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/leave"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/organization"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/payroll"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
	"gorm.io/gorm"
)

func TestPrismaModelMappings(t *testing.T) {
	url := os.Getenv("EMS_GOOSE_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("set EMS_GOOSE_TEST_DATABASE_URL to a migrated test database")
	}
	db, pool, err := postgres.Open(url)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	models := []any{
		&identity.User{}, &identity.Role{}, &identity.PasswordResetToken{}, &employees.Employee{},
		&organization.Department{}, &organization.Position{}, &settings.CompanySetting{}, &settings.Holiday{},
		&attendance.Attendance{}, &attendance.AttendanceCorrection{}, &leave.LeaveRequest{},
		&payroll.Salary{}, &payroll.PayrollComponent{}, &audit.AuditLog{},
	}
	for _, model := range models {
		statement := &gorm.Statement{DB: db}
		if err := statement.Parse(model); err != nil {
			t.Fatal(err)
		}
		t.Run(statement.Table, func(t *testing.T) {
			rows, err := pool.QueryContext(ctx, `SELECT column_name, data_type, udt_name, is_nullable
				FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`, statement.Table)
			if err != nil {
				t.Fatal(err)
			}
			defer rows.Close()
			count := 0
			for rows.Next() {
				count++
				var column, dataType, udt, nullable string
				if err := rows.Scan(&column, &dataType, &udt, &nullable); err != nil {
					t.Fatal(err)
				}
				field := statement.Schema.FieldsByDBName[column]
				if field == nil {
					t.Errorf("missing GORM field for %s", column)
					continue
				}
				if gotNullable := field.FieldType.Kind() == reflect.Pointer; gotNullable != (nullable == "YES") {
					t.Errorf("%s: GORM nullable = %t, database nullable = %s", column, gotNullable, nullable)
				}
				mappedType := db.Dialector.DataTypeOf(field)
				if dataType == "USER-DEFINED" {
					dataType = udt
				}
				if dataType == "timestamp without time zone" && strings.HasPrefix(mappedType, "timestamp(") {
					continue
				}
				if mappedType != dataType {
					t.Errorf("%s: GORM type = %s, database type = %s", column, mappedType, dataType)
				}
			}
			if err := rows.Err(); err != nil {
				t.Fatal(err)
			}
			if count != len(statement.Schema.DBNames) {
				t.Errorf("mapped %d fields, database has %d columns", len(statement.Schema.DBNames), count)
			}
		})
	}
}
