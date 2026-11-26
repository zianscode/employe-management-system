package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/notification"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/httpapi"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/mailer"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/migrate"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/postgres"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := run(); err != nil {
		slog.Error("API stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	db, pool, err := postgres.Open(os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer pool.Close()

	addr := os.Getenv("HTTP_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	gin.SetMode(gin.ReleaseMode)
	origin := os.Getenv("APP_ORIGIN")
	if origin == "" {
		origin = "http://localhost:3000"
	}
	public, err := url.Parse(strings.TrimSuffix(origin, "/"))
	if err != nil || public.Host == "" || public.User != nil || public.Path != "" || public.RawQuery != "" || public.Fragment != "" || (public.Scheme != "http" && public.Scheme != "https") {
		return errors.New("APP_ORIGIN must be an HTTP or HTTPS origin")
	}
	if public.Scheme == "http" && public.Hostname() != "localhost" && public.Hostname() != "127.0.0.1" && public.Hostname() != "::1" {
		return errors.New("APP_ORIGIN requires HTTPS outside localhost")
	}
	send, err := mailer.SMTP(os.Getenv("SMTP_EMAIL"), os.Getenv("SMTP_PASSWORD"))
	if err != nil {
		return err
	}
	service, err := identity.New(db, public.String(), public.Scheme == "https", identity.ResetSender(send))
	if err != nil {
		return err
	}
	avatarDirectory := os.Getenv("AVATAR_DIR")
	if avatarDirectory == "" {
		avatarDirectory = "uploads/avatars"
	}
	ready, err := migrate.Readiness(pool)
	if err != nil {
		return err
	}
	router := httpapi.New(ready)
	if ingress := strings.TrimSpace(os.Getenv("TRUSTED_PROXY_CIDRS")); ingress != "" {
		proxies := strings.Split(ingress, ",")
		for i := range proxies {
			proxies[i] = strings.TrimSpace(proxies[i])
		}
		if err := router.SetTrustedProxies(proxies); err != nil {
			return errors.New("TRUSTED_PROXY_CIDRS contains an invalid proxy")
		}
		router.ForwardedByClientIP = true
	}
	httpapi.RegisterBusiness(router, db, service, employees.AvatarStore{Directory: avatarDirectory})
	server := &http.Server{
		Addr: addr, Handler: router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go service.PruneExpired(ctx)
	go (notification.Worker{DB: db, Origin: public.String(), Send: send}).Run(ctx)
	serveErr := make(chan error, 1)
	go func() { serveErr <- server.ListenAndServe() }()

	select {
	case err := <-serveErr:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
		shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return server.Shutdown(shutdown)
	}
}
