package identity

import (
	"bytes"
	_ "embed"
	"html/template"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/mailer"
)

//go:embed reset.html
var resetHTML string
var resetTemplate = template.Must(template.New("reset").Parse(resetHTML))

func ResetSender(send mailer.Sender) func(string, string) error {
	if send == nil {
		return nil
	}
	return func(recipient, link string) error {
		var body bytes.Buffer
		if err := resetTemplate.Execute(&body, link); err != nil {
			return err
		}
		return send(recipient, "Reset Password Akun EMS Pro Anda", body.String(), "")
	}
}
