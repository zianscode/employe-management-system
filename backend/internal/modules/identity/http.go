package identity

import (
	"net/http"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
)

const authBodyLimit = 16 << 10
const actorKey = "identity.actor"

func Current(c *gin.Context) Actor { return c.MustGet(actorKey).(Actor) }
func cookie(c *gin.Context) string { token, _ := c.Cookie(CookieName); return token }

func (s *Service) Require(complete, admin bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor, err := s.Lookup(c.Request.Context(), cookie(c))
		if err != nil {
			web.Fail(c, err)
			return
		}
		if (complete && (actor.MustChangePassword || !actor.IsProfileComplete)) || (admin && !IsAdmin(actor.Role)) {
			web.Fail(c, web.Forbidden("Anda tidak memiliki akses untuk tindakan ini"))
			return
		}
		c.Set(actorKey, actor)
	}
}

func (s *Service) SameOrigin(c *gin.Context) {
	switch c.Request.Method {
	case http.MethodGet, http.MethodHead, http.MethodOptions:
	default:
		if c.GetHeader("Origin") != s.Origin || c.GetHeader("Sec-Fetch-Site") == "cross-site" {
			web.Fail(c, web.Forbidden("Origin permintaan tidak diizinkan"))
			return
		}
	}
}

func (s *Service) setCookie(c *gin.Context, token string, age int) {
	http.SetCookie(c.Writer, &http.Cookie{Name: CookieName, Value: token, Path: "/", HttpOnly: true, Secure: s.SecureCookie, SameSite: http.SameSiteLaxMode, MaxAge: age})
}

func (s *Service) rateIP(c *gin.Context, action string, limit int, window time.Duration) bool {
	allowed, err := s.Rate(c.Request.Context(), action+":"+c.ClientIP(), limit, window)
	if err != nil {
		web.Fail(c, err)
		return false
	}
	if !allowed {
		web.Fail(c, web.Failure{Status: 429, Code: "RATE_LIMITED", Detail: "Terlalu banyak percobaan. Silakan coba lagi nanti."})
	}
	return allowed
}

func (s *Service) Register(api *gin.RouterGroup) {
	auth := api.Group("/auth")
	auth.POST("/login", s.loginHTTP)
	auth.GET("/session", s.Require(false, false), func(c *gin.Context) {
		a := Current(c)
		web.OK(c, 200, "Sesi aktif", gin.H{"user": a, "expires": a.Expires})
	})
	auth.POST("/logout", s.logoutHTTP)
	auth.POST("/password/forgot", s.forgotHTTP)
	auth.POST("/password/reset/validate", s.validateResetHTTP)
	auth.POST("/password/reset", s.resetHTTP)
	auth.POST("/password/change", s.Require(false, false), s.changePasswordHTTP)
	admin := api.Group("", s.Require(true, true))
	admin.GET("/roles", s.rolesHTTP)
	admin.GET("/users", s.usersHTTP)
	admin.POST("/users/:id/reset-password", s.manageHTTP(true))
	admin.POST("/users/:id/unlock", s.manageHTTP(false))
}

func (s *Service) loginHTTP(c *gin.Context) {
	if !s.rateIP(c, "login-ip", 120, 15*time.Minute) {
		return
	}
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if !web.Bind(c, &input, authBodyLimit) {
		return
	}
	email, err := NormalizeEmail(input.Email)
	if err != nil || len(input.Password) < 6 {
		web.Fail(c, invalidCredentials())
		return
	}
	token, err := s.Login(c.Request.Context(), email, input.Password)
	if err != nil {
		web.Fail(c, err)
		return
	}
	s.setCookie(c, token, int(sessionTTL.Seconds()))
	web.OK(c, 200, "Login berhasil", nil)
}

func (s *Service) logoutHTTP(c *gin.Context) {
	if token := cookie(c); validSecret(token) {
		if err := s.DB.WithContext(c.Request.Context()).Delete(&Session{}, "digest = ?", digest(token)).Error; err != nil {
			web.Fail(c, err)
			return
		}
	}
	s.setCookie(c, "", -1)
	c.Status(http.StatusNoContent)
}

func (s *Service) forgotHTTP(c *gin.Context) {
	if !s.rateIP(c, "forgot-ip", 60, time.Hour) {
		return
	}
	var input struct {
		Email string `json:"email"`
	}
	if !web.Bind(c, &input, authBodyLimit) {
		return
	}
	email, err := NormalizeEmail(input.Email)
	if err == nil {
		if err := s.Forgot(c.Request.Context(), email); err != nil {
			web.Fail(c, err)
			return
		}
	}
	web.OK(c, 200, "Jika email terdaftar, instruksi reset password akan dikirim ke email Anda.", nil)
}

func (s *Service) validateResetHTTP(c *gin.Context) {
	if !s.rateIP(c, "reset-validation-ip", 90, time.Hour) {
		return
	}
	var input struct {
		Token string `json:"token"`
	}
	if !web.Bind(c, &input, authBodyLimit) {
		return
	}
	email, err := s.ValidateReset(c.Request.Context(), input.Token)
	if err != nil {
		web.Fail(c, err)
		return
	}
	web.OK(c, 200, "Token valid", gin.H{"email": email})
}

func (s *Service) resetHTTP(c *gin.Context) {
	if !s.rateIP(c, "reset-ip", 60, time.Hour) {
		return
	}
	var input struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}
	if !web.Bind(c, &input, authBodyLimit) {
		return
	}
	if err := s.Reset(c.Request.Context(), input.Token, input.NewPassword); err != nil {
		web.Fail(c, err)
		return
	}
	web.OK(c, 200, "Password Anda berhasil diperbarui. Silakan login kembali.", nil)
}

func (s *Service) changePasswordHTTP(c *gin.Context) {
	actor := Current(c)
	allowed, err := s.Rate(c.Request.Context(), "password-change:"+actor.ID, 15, 15*time.Minute)
	if err != nil {
		web.Fail(c, err)
		return
	}
	if !allowed {
		web.Fail(c, web.Failure{Status: 429, Code: "RATE_LIMITED", Detail: "Terlalu banyak percobaan. Silakan coba lagi nanti."})
		return
	}
	var input PasswordInput
	if !web.Bind(c, &input, authBodyLimit) {
		return
	}
	if err := s.ChangePassword(c.Request.Context(), actor, input, cookie(c)); err != nil {
		web.Fail(c, err)
		return
	}
	web.OK(c, 200, "Password berhasil diperbarui", nil)
}
