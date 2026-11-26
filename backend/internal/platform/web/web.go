package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"mime"
	"net/http"
	"strconv"
	"strings"
	"time"
	_ "time/tzdata"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
)

type Problem struct {
	Type      string `json:"type"`
	Title     string `json:"title"`
	Status    int    `json:"status"`
	Code      string `json:"code"`
	Detail    string `json:"detail,omitempty"`
	RequestID string `json:"requestId"`
}

type Failure struct {
	Status       int
	Code, Detail string
}

func (e Failure) Error() string { return e.Detail }

func Invalid(detail string) error   { return Failure{422, "VALIDATION_ERROR", detail} }
func Forbidden(detail string) error { return Failure{403, "FORBIDDEN", detail} }
func NotFound(detail string) error  { return Failure{404, "NOT_FOUND", detail} }
func Conflict(detail string) error  { return Failure{409, "CONFLICT", detail} }

func Fail(c *gin.Context, err error) {
	var failure Failure
	var pg *pgconn.PgError
	switch {
	case errors.As(err, &failure):
	case errors.Is(err, gorm.ErrRecordNotFound):
		failure = Failure{404, "NOT_FOUND", "Data tidak ditemukan"}
	case errors.As(err, &pg) && (pg.Code == "23505" || pg.Code == "23503" || pg.Code == "40001" || pg.Code == "40P01"):
		failure = Failure{409, "CONFLICT", "Data sudah digunakan atau berubah. Silakan coba lagi."}
	default:
		slog.Error("API request failed", "request_id", c.Writer.Header().Get("X-Request-ID"), "error_type", fmt.Sprintf("%T", err))
		failure = Failure{500, "INTERNAL_ERROR", "Terjadi kesalahan sistem"}
	}
	c.Header("Content-Type", "application/problem+json")
	c.AbortWithStatusJSON(failure.Status, Problem{Type: "about:blank", Title: http.StatusText(failure.Status), Status: failure.Status, Code: failure.Code, Detail: failure.Detail, RequestID: c.Writer.Header().Get("X-Request-ID")})
}

func OK(c *gin.Context, status int, message string, data any) {
	c.JSON(status, gin.H{"success": true, "message": message, "data": data})
}

func Bind(c *gin.Context, dst any, limit int64) bool {
	media, _, _ := mime.ParseMediaType(c.GetHeader("Content-Type"))
	if media != "application/json" {
		Fail(c, Failure{415, "UNSUPPORTED_MEDIA_TYPE", "Gunakan application/json"})
		return false
	}
	decoder := json.NewDecoder(http.MaxBytesReader(c.Writer, c.Request.Body, limit))
	decoder.DisallowUnknownFields()
	err := decoder.Decode(dst)
	if err == nil {
		if tail := decoder.Decode(new(any)); tail == io.EOF {
			return true
		} else if tail != nil {
			err = tail
		} else {
			err = errors.New("multiple JSON values")
		}
	}
	var tooLarge *http.MaxBytesError
	if errors.As(err, &tooLarge) {
		Fail(c, Failure{413, "PAYLOAD_TOO_LARGE", "Data melebihi batas ukuran"})
	} else {
		Fail(c, Invalid("Data permintaan tidak valid"))
	}
	return false
}

var months = [...]string{"", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"}
var Jakarta = jakartaLocation()

func jakartaLocation() *time.Location {
	location, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		panic(err)
	}
	return location
}

func Period(year int, month time.Month) string {
	if month < 1 || month > 12 {
		return "-"
	}
	return months[month] + " " + time.Date(year, month, 1, 0, 0, 0, 0, time.UTC).Format("2006")
}
func ParseDate(value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}
	date, err := time.Parse(time.DateOnly, value)
	if err != nil || date.Year() < 1 {
		return nil, Invalid("Tanggal tidak valid")
	}
	return &date, nil
}
func Text(value string, min, max int) bool {
	n := utf8.RuneCountInString(value)
	return n >= min && n <= max && !strings.ContainsRune(value, 0)
}

func Ptr[T any](v T) *T { return &v }
func String(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}
func Fallback(v, fallback string) string {
	if v == "" {
		return fallback
	}
	return v
}

type Stat struct {
	Label  string `json:"label"`
	Value  string `json:"value"`
	Type   string `json:"type"`
	Change string `json:"change"`
}

func CardStat(label string, count int, kind, change string) Stat {
	return Stat{Label: label, Value: strconv.Itoa(count), Type: kind, Change: change}
}
