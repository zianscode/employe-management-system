package migrate

import (
	"context"
	"database/sql"
	"errors"

	"github.com/fajarfauzian/employe_management_frontend/backend/migrations"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/pressly/goose/v3"
)

var ErrSchemaNotReady = errors.New("required Goose migrations have not been applied")

// Readiness checks the applied versions required by this binary without writing to the database.
func Readiness(pool *sql.DB) (func(context.Context) error, error) {
	provider, err := goose.NewProvider(goose.DialectPostgres, pool, migrations.Files, goose.WithTableName(versionTable))
	if err != nil {
		return nil, err
	}
	sources := provider.ListSources()
	versions := make([]int64, 0, len(sources))
	for _, migration := range sources {
		versions = append(versions, migration.Version)
	}
	return func(ctx context.Context) error {
		var applied int
		err := pool.QueryRowContext(ctx, `SELECT count(*) FROM (
			SELECT DISTINCT ON (version_id) version_id, is_applied
			FROM public.goose_db_version WHERE version_id = ANY($1::bigint[])
			ORDER BY version_id, id DESC
		) AS versions WHERE is_applied`, versions).Scan(&applied)
		if err != nil {
			var pg *pgconn.PgError
			if errors.As(err, &pg) && pg.Code == "42P01" {
				return ErrSchemaNotReady
			}
			return err
		}
		if applied != len(versions) {
			return ErrSchemaNotReady
		}
		return nil
	}, nil
}
