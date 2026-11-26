package postgres

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	postgresdriver "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Open(databaseURL string) (*gorm.DB, *sql.DB, error) {
	databaseURL = strings.TrimSpace(databaseURL)
	if !strings.HasPrefix(databaseURL, "postgres://") && !strings.HasPrefix(databaseURL, "postgresql://") {
		return nil, nil, errors.New("DATABASE_URL must be a PostgreSQL URL")
	}

	config, err := pgx.ParseConfig(databaseURL)
	if err != nil {
		return nil, nil, errors.New("invalid DATABASE_URL")
	}
	config.RuntimeParams["search_path"] = "public"
	config.RuntimeParams["timezone"] = "UTC"
	if config.ConnectTimeout == 0 {
		config.ConnectTimeout = 5 * time.Second
	}

	pool := stdlib.OpenDB(*config)
	pool.SetMaxOpenConns(10)
	pool.SetMaxIdleConns(5)
	pool.SetConnMaxIdleTime(5 * time.Minute)
	db, err := gorm.Open(postgresdriver.New(postgresdriver.Config{Conn: pool}), &gorm.Config{
		DisableAutomaticPing: true,
		Logger:               logger.Default.LogMode(logger.Silent),
		NowFunc:              func() time.Time { return time.Now().UTC() },
	})
	if err != nil {
		pool.Close()
		return nil, nil, errors.New("unable to initialize PostgreSQL driver")
	}
	return db, pool, nil
}
