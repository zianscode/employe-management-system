package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/fajarfauzian/employe_management_frontend/backend/api"
)

func TestOperationalRoutes(t *testing.T) {
	tests := []struct {
		method, path, contentType, code string
		status                          int
		pings                           int
	}{
		{http.MethodGet, "/healthz", "application/json", "", 200, 0},
		{http.MethodGet, "/readyz", "application/json", "", 200, 1},
		{http.MethodGet, "/openapi.yaml", "application/yaml", "", 200, 0},
		{http.MethodGet, "/api/v1/missing", "application/problem+json", "NOT_FOUND", 404, 0},
		{http.MethodPost, "/readyz", "application/problem+json", "METHOD_NOT_ALLOWED", 405, 0},
	}
	for _, test := range tests {
		t.Run(test.method+test.path, func(t *testing.T) {
			pings := 0
			router := New(func(context.Context) error { pings++; return nil })
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest(test.method, test.path, nil))
			if response.Code != test.status || pings != test.pings {
				t.Fatalf("status = %d, pings = %d", response.Code, pings)
			}
			if !strings.HasPrefix(response.Header().Get("Content-Type"), test.contentType) {
				t.Fatalf("Content-Type = %q", response.Header().Get("Content-Type"))
			}
			if response.Header().Get("Cache-Control") != "no-store" || response.Header().Get("X-Request-ID") == "" {
				t.Fatal("missing response headers")
			}
			switch {
			case test.path == "/openapi.yaml":
				if response.Body.String() != api.OpenAPI {
					t.Fatal("served OpenAPI contract differs from embedded spec")
				}
			case test.code != "":
				assertProblem(t, response, test.code)
			default:
				if response.Body.String() != `{"status":"ok"}` {
					t.Fatalf("unexpected health body: %s", response.Body)
				}
			}
		})
	}
}

func TestReadinessOmitsDatabaseErrors(t *testing.T) {
	router := New(func(ctx context.Context) error {
		if _, ok := ctx.Deadline(); !ok {
			t.Fatal("database probe has no timeout")
		}
		return errors.New("internal database error")
	})
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/readyz", nil))
	if response.Code != http.StatusServiceUnavailable || strings.Contains(response.Body.String(), "internal database error") {
		t.Fatalf("unexpected readiness response: %d %s", response.Code, response.Body)
	}
	assertProblem(t, response, "DATABASE_UNAVAILABLE")
}

func assertProblem(t *testing.T, response *httptest.ResponseRecorder, code string) {
	t.Helper()
	var body problem
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Status != response.Code || body.Code != code || body.RequestID != response.Header().Get("X-Request-ID") {
		t.Fatalf("unexpected problem response: %+v", body)
	}
}
