package migrate

import (
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/migrations"
	"github.com/pressly/goose/v3"
	"github.com/pressly/goose/v3/database"
)

const (
	versionTable    = "goose_db_version"
	baselineVersion = 1
	lockID          = 1730667141
	emptySchema     = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	legacySchema    = "20aedc72ed6b366082c71d6e3d6ec6a61954c7a8b57f0d8f677abca89c04198f"
)

//go:embed schema.sql
var schemaQuery string

var prismaHistory = []string{
	"20260626015939",
	"20261018000000_simplify_and_fix_workflow",
	"20261020000000_login_security",
	"20261021000000_holidays_and_attendance_corrections",
	"20261022000000_indonesian_payroll",
	"20261023000000_audit_log",
}

func Run(ctx context.Context, pool *sql.DB, command string, output io.Writer) error {
	provider, err := goose.NewProvider(goose.DialectPostgres, pool, migrations.Files, goose.WithTableName(versionTable))
	if err != nil {
		return err
	}
	conn, err := pool.Conn(ctx)
	if err != nil {
		return err
	}
	defer conn.Close()
	if command == "up" || command == "baseline" {
		var locked bool
		if err := conn.QueryRowContext(ctx, "SELECT pg_try_advisory_lock($1)", lockID).Scan(&locked); err != nil {
			return err
		}
		if !locked {
			return errors.New("another EMS migration is running")
		}
		defer func() {
			unlockCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			defer cancel()
			_, _ = conn.ExecContext(unlockCtx, "SELECT pg_advisory_unlock($1)", lockID)
		}()
	}

	var hasGoose, hasPrisma bool
	if err := conn.QueryRowContext(ctx, `SELECT to_regclass('public.goose_db_version') IS NOT NULL,
		to_regclass('public._prisma_migrations') IS NOT NULL`).Scan(&hasGoose, &hasPrisma); err != nil {
		return err
	}

	switch command {
	case "status":
		if !hasGoose {
			_, err := fmt.Fprintf(output, "Goose baseline pending (Prisma history present: %t)\n", hasPrisma)
			return err
		}
		status, err := provider.Status(ctx)
		if err != nil {
			return err
		}
		for _, migration := range status {
			fmt.Fprintf(output, "%d %s\n", migration.Source.Version, migration.State)
		}
		return nil
	case "up":
		var version int64
		if hasGoose {
			if version, err = provider.GetDBVersion(ctx); err != nil {
				return err
			}
		}
		var schema string
		if err := conn.QueryRowContext(ctx, schemaQuery).Scan(&schema); err != nil {
			return err
		}
		if version == 0 && (schema != emptySchema || hasPrisma) {
			return errors.New("public schema is not empty; use baseline only for a verified Prisma database")
		}
		if version == baselineVersion && schema != legacySchema {
			return errors.New("public schema differs from the EMS baseline")
		}
		applied, err := provider.Up(ctx)
		if err != nil {
			return err
		}
		_, err = fmt.Fprintf(output, "Applied %d Goose migration(s)\n", len(applied))
		return err
	case "baseline":
		if !hasPrisma {
			return errors.New("Prisma migration history is required to adopt an existing database")
		}
		if err := adopt(ctx, conn, hasGoose); err != nil {
			return err
		}
		_, err := fmt.Fprintln(output, "Goose baseline recorded for the verified Prisma schema")
		return err
	default:
		return errors.New("usage: migrate status | up | baseline")
	}
}

func adopt(ctx context.Context, conn *sql.Conn, hasGoose bool) error {
	tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead})
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var schema string
	if err := tx.QueryRowContext(ctx, schemaQuery).Scan(&schema); err != nil {
		return err
	}
	if schema != legacySchema {
		return errors.New("public schema differs from the EMS baseline")
	}
	var history string
	var finished bool
	if err := tx.QueryRowContext(ctx, `SELECT COALESCE(string_agg(migration_name, ',' ORDER BY migration_name), ''),
		COALESCE(bool_and(finished_at IS NOT NULL), false)
		FROM public._prisma_migrations WHERE rolled_back_at IS NULL`).Scan(&history, &finished); err != nil {
		return err
	}
	if !finished || history != strings.Join(prismaHistory, ",") {
		return errors.New("Prisma migration history does not match the six Phase 0 migrations")
	}

	store, err := database.NewStore(goose.DialectPostgres, versionTable)
	if err != nil {
		return err
	}
	if hasGoose {
		version, err := store.GetLatestVersion(ctx, tx)
		if err != nil {
			return err
		}
		if version != baselineVersion {
			return errors.New("existing Goose history does not match the baseline")
		}
		return tx.Commit()
	}
	if err := store.CreateVersionTable(ctx, tx); err != nil {
		return err
	}
	for _, version := range []int64{0, baselineVersion} {
		if err := store.Insert(ctx, tx, database.InsertRequest{Version: version}); err != nil {
			return err
		}
	}
	return tx.Commit()
}
