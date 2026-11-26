package employees

import (
	"bytes"
	"encoding/base64"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "golang.org/x/image/webp"
)

const maxAvatarBytes = 4 << 20
const profileBodyLimit = 6 << 20
const avatarURL = "/uploads/avatars/"

var avatarName = regexp.MustCompile(`^(?:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|avatar-[a-zA-Z0-9_-]{1,64}-[0-9]{10,16})\.jpg$`)

type AvatarStore struct{ Directory string }

func (s AvatarStore) Save(value *string, current *string) (path *string, cleanup func(), err error) {
	cleanup = func() {}
	if value == nil || web.String(value) == web.String(current) {
		return current, cleanup, nil
	}
	if *value == "" {
		return nil, cleanup, nil
	}
	meta, encoded, valid := strings.Cut(*value, ",")
	if !valid || (meta != "data:image/jpeg;base64" && meta != "data:image/png;base64" && meta != "data:image/gif;base64" && meta != "data:image/webp;base64") || len(encoded) > base64.StdEncoding.EncodedLen(maxAvatarBytes) {
		return nil, cleanup, web.Invalid("Foto harus berupa JPEG, PNG, GIF, atau WebP dengan ukuran maksimal 4 MB")
	}
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil || len(raw) > maxAvatarBytes {
		return nil, cleanup, web.Invalid("Foto tidak valid")
	}
	config, format, err := image.DecodeConfig(bytes.NewReader(raw))
	if err != nil || "data:image/"+format+";base64" != meta || config.Width < 1 || config.Height < 1 || config.Width > 4096 || config.Height > 4096 || config.Width*config.Height > 12_000_000 {
		return nil, cleanup, web.Invalid("Isi atau dimensi foto tidak valid")
	}
	img, _, err := image.Decode(bytes.NewReader(raw))
	if err != nil {
		return nil, cleanup, web.Invalid("Foto tidak valid")
	}
	if err := os.MkdirAll(s.Directory, 0750); err != nil {
		return nil, cleanup, err
	}
	name := uuid.NewString() + ".jpg"
	filePath := filepath.Join(s.Directory, name)
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0640)
	if err != nil {
		return nil, cleanup, err
	}
	cleanup = func() { _ = os.Remove(filePath) }
	if err := jpeg.Encode(file, img, &jpeg.Options{Quality: 88}); err != nil {
		file.Close()
		cleanup()
		return nil, cleanup, err
	}
	if err := file.Close(); err != nil {
		cleanup()
		return nil, cleanup, err
	}
	return web.Ptr(avatarURL + name), cleanup, nil
}

func (s AvatarStore) Get(c *gin.Context) {
	name := c.Param("file")
	if !avatarName.MatchString(name) {
		web.Fail(c, web.NotFound("Foto tidak ditemukan"))
		return
	}
	root, err := os.OpenRoot(s.Directory)
	if err != nil {
		web.Fail(c, web.NotFound("Foto tidak ditemukan"))
		return
	}
	defer root.Close()
	file, err := root.Open(name)
	if err != nil {
		web.Fail(c, web.NotFound("Foto tidak ditemukan"))
		return
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil || !info.Mode().IsRegular() {
		web.Fail(c, web.NotFound("Foto tidak ditemukan"))
		return
	}
	var preview [512]byte
	n, err := io.ReadFull(file, preview[:])
	if err != nil && err != io.ErrUnexpectedEOF {
		web.Fail(c, web.NotFound("Foto tidak ditemukan"))
		return
	}
	contentType := http.DetectContentType(preview[:n])
	switch contentType {
	case "image/jpeg", "image/png", "image/gif", "image/webp":
	default:
		web.Fail(c, web.NotFound("Foto tidak ditemukan"))
		return
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		web.Fail(c, err)
		return
	}
	c.Header("Content-Type", contentType)
	http.ServeContent(c.Writer, c.Request, name, info.ModTime(), file)
}
