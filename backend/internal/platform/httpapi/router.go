package httpapi

import (
	"context"
	"crypto/rand"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/api"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/migrate"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
)

type problem = web.Problem

func writeProblem(c *gin.Context, status int, code string) {
	web.Fail(c, web.Failure{Status: status, Code: code})
}

func New(ping func(context.Context) error) *gin.Engine {
	router := gin.New()
	router.ForwardedByClientIP = false
	_ = router.SetTrustedProxies(nil)
	router.RedirectTrailingSlash = false
	router.HandleMethodNotAllowed = true
	router.Use(func(c *gin.Context) {
		c.Header("X-Request-ID", rand.Text())
		c.Header("Cache-Control", "no-store")
		c.Header("X-Content-Type-Options", "nosniff")
	})
	router.Use(gin.CustomRecoveryWithWriter(io.Discard, func(c *gin.Context, _ any) {
		slog.Error("HTTP handler panicked", "request_id", c.Writer.Header().Get("X-Request-ID"))
		writeProblem(c, http.StatusInternalServerError, "INTERNAL_ERROR")
	}))
	router.NoRoute(func(c *gin.Context) { writeProblem(c, http.StatusNotFound, "NOT_FOUND") })
	router.NoMethod(func(c *gin.Context) { writeProblem(c, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED") })

	router.GET("/healthz", healthy)
	router.GET("/readyz", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()
		if err := ping(ctx); err != nil {
			code := "DATABASE_UNAVAILABLE"
			if errors.Is(err, migrate.ErrSchemaNotReady) {
				code = "SCHEMA_NOT_READY"
			}
			writeProblem(c, http.StatusServiceUnavailable, code)
			return
		}
		healthy(c)
	})
	router.GET("/openapi.yaml", func(c *gin.Context) {
		c.Data(http.StatusOK, "application/yaml", []byte(api.OpenAPI))
	})
	return router
}

func healthy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
