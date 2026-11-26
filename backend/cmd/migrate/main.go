package main

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/migrate"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		slog.Error("migration command failed", "error", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	if len(args) != 1 || (args[0] != "status" && args[0] != "up" && args[0] != "baseline") {
		return errors.New("usage: migrate status | up | baseline")
	}
	_, pool, err := postgres.Open(os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer pool.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	return migrate.Run(ctx, pool, args[0], os.Stdout)
}
