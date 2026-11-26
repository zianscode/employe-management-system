package mailer

import (
	"bytes"
	"crypto/sha256"
	"crypto/tls"
	"errors"
	"fmt"
	"mime"
	"mime/quotedprintable"
	"net"
	"net/mail"
	"net/smtp"
	"strings"
	"time"
	"unicode"
)

type Sender func(to, subject, html, key string) error

func address(input string) (string, error) {
	value := strings.TrimSpace(input)
	parsed, err := mail.ParseAddress(value)
	if err != nil || len(value) > 254 || parsed.Address != value || strings.ContainsAny(value, "\r\n") {
		return "", errors.New("invalid email address")
	}
	return value, nil
}

func SMTP(email, password string) (Sender, error) {
	if email == "" && password == "" {
		return nil, nil
	}
	from, err := address(email)
	if err != nil || password == "" {
		return nil, errors.New("configure both SMTP_EMAIL and SMTP_PASSWORD")
	}
	return func(to, subject, body, key string) error {
		recipient, err := address(to)
		if err != nil {
			return err
		}
		subject = mime.QEncoding.Encode("UTF-8", strings.Map(func(r rune) rune {
			if unicode.IsControl(r) {
				return ' '
			}
			return r
		}, subject))
		const host = "smtp.gmail.com"
		connection, err := tls.DialWithDialer(&net.Dialer{Timeout: 5 * time.Second}, "tcp", host+":465", &tls.Config{ServerName: host, MinVersion: tls.VersionTLS12})
		if err != nil {
			return err
		}
		defer connection.Close()
		if err := connection.SetDeadline(time.Now().Add(10 * time.Second)); err != nil {
			return err
		}
		client, err := smtp.NewClient(connection, host)
		if err != nil {
			return err
		}
		defer client.Close()
		if err := client.Auth(smtp.PlainAuth("", from, password, host)); err != nil {
			return err
		}
		if err := client.Mail(from); err != nil {
			return err
		}
		if err := client.Rcpt(recipient); err != nil {
			return err
		}

		var message bytes.Buffer
		fmt.Fprintf(&message, "From: EMS Pro Support <%s>\r\nTo: <%s>\r\nSubject: %s\r\n", from, recipient, subject)
		if key != "" {
			fmt.Fprintf(&message, "Message-ID: <%x@ems-notifications.local>\r\n", sha256.Sum256([]byte(key)))
		}
		fmt.Fprint(&message, "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n")
		encoder := quotedprintable.NewWriter(&message)
		if _, err := encoder.Write([]byte(body)); err != nil {
			return err
		}
		if err := encoder.Close(); err != nil {
			return err
		}
		writer, err := client.Data()
		if err != nil {
			return err
		}
		if _, err := writer.Write(message.Bytes()); err != nil {
			return err
		}
		if err := writer.Close(); err != nil {
			return err
		}
		// Closing DATA successfully means the SMTP server accepted the message.
		_ = client.Quit()
		return nil
	}, nil
}
