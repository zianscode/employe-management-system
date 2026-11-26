package web

import (
	"bytes"
	"encoding/csv"
	"mime"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
)

// CSVText protects untrusted text columns from spreadsheet formula evaluation.
// Numeric columns are formatted by the caller and retain negative values.
func CSVText(value string) string {
	trimmed := strings.TrimLeftFunc(value, func(r rune) bool { return unicode.IsSpace(r) || r == '\ufeff' })
	first, _ := utf8.DecodeRuneInString(trimmed)
	if strings.HasPrefix(value, "\t") || strings.HasPrefix(value, "\r") || strings.HasPrefix(value, "\n") ||
		(strings.ContainsRune("=+-@＝＋－＠", first) && trimmed != "-") {
		return "'" + value
	}
	return value
}

func CSV(c *gin.Context, file string, header []string, rows [][]string) {
	var buffer bytes.Buffer
	buffer.WriteString("\ufeff")
	writer := csv.NewWriter(&buffer)
	writer.Comma = ';'
	// The buffer never fails a write.
	_ = writer.Write(header)
	_ = writer.WriteAll(rows)
	data := bytes.TrimSuffix(buffer.Bytes(), []byte{'\n'})
	c.Header("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": file + ".csv"}))
	c.Data(200, "text/csv; charset=utf-8", data)
}
