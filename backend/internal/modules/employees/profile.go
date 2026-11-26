package employees

import (
	"database/sql"
	"regexp"
	"strings"
	"time"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/platform/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type personalFields struct {
	BankName          *string `json:"bankName"`
	BankAccount       *string `json:"bankAccount"`
	BankHolderName    *string `json:"bankHolderName"`
	EmergencyName     *string `json:"emergencyName"`
	EmergencyPhone    *string `json:"emergencyPhone"`
	EmergencyRelation *string `json:"emergencyRelation"`
	Education         *string `json:"education"`
	Skills            *string `json:"skills"`
	Bio               *string `json:"bio"`
	Avatar            *string `json:"avatar"`
}

func (i personalFields) values() map[string]*string {
	return map[string]*string{
		"bankName": i.BankName, "bankAccount": i.BankAccount, "bankHolderName": i.BankHolderName, "emergencyName": i.EmergencyName,
		"emergencyPhone": i.EmergencyPhone, "emergencyRelation": i.EmergencyRelation, "education": i.Education, "skills": i.Skills, "bio": i.Bio,
	}
}

type profileInput struct {
	personalFields
	Name           string  `json:"namaLengkap"`
	Email          string  `json:"email"`
	Phone          *string `json:"nomorTelepon"`
	BirthDate      *string `json:"tanggalLahir"`
	Address        *string `json:"alamat"`
	PlaceOfBirth   *string `json:"tempatLahir"`
	Gender         *string `json:"jenisKelamin"`
	IdentityNumber *string `json:"nik"`
	NPWPNumber     *string `json:"npwp"`
}

type onboardingInput struct {
	personalFields
	Phone          *string `json:"phone"`
	Address        *string `json:"address"`
	Gender         *string `json:"gender"`
	PlaceOfBirth   *string `json:"placeOfBirth"`
	BirthDate      string  `json:"birthDate"`
	IdentityNumber *string `json:"identityNumber"`
	NPWPNumber     *string `json:"npwpNumber"`
}

func personalUpdates(fields map[string]*string, clearEmpty bool) (map[string]any, error) {
	result := map[string]any{}
	for name, value := range fields {
		if value == nil {
			if clearEmpty {
				result[name] = nil
			}
			continue
		}
		limit := 240
		if name == "bio" || name == "address" || name == "skills" || name == "education" {
			limit = 4000
		}
		if !web.Text(*value, 0, limit) || strings.ContainsRune(*value, 0) {
			return nil, web.Invalid("Data profil tidak valid")
		}
		if name == "gender" && *value != "" && *value != "MALE" && *value != "FEMALE" {
			return nil, web.Invalid("Jenis kelamin tidak valid")
		}
		if clearEmpty && *value == "" {
			result[name] = nil
		} else {
			result[name] = *value
		}
	}
	return result, nil
}

func getProfileHTTP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := identity.Current(c)
		if actor.EmployeeID == nil {
			web.Fail(c, web.NotFound("Profil karyawan tidak ditemukan"))
			return
		}
		r, err := detail(db.WithContext(c.Request.Context()), *actor.EmployeeID)
		if err != nil {
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Profile fetched", gin.H{"namaLengkap": r.Name, "email": r.Email, "nomorTelepon": web.String(r.Phone), "tanggalLahir": dateString(r.BirthDate, time.DateOnly),
			"alamat": web.String(r.Address), "idKaryawan": web.Fallback(web.String(r.NIP), "-"), "departemen": web.Fallback(web.String(r.Division), "-"), "jabatan": web.Fallback(web.String(r.Position), "-"),
			"tanggalBergabung": web.Fallback(dateString(r.JoinDate, time.DateOnly), "-"), "tempatLahir": web.String(r.PlaceOfBirth), "jenisKelamin": web.String(r.Gender), "nik": web.String(r.IdentityNumber),
			"npwp": web.String(r.NPWPNumber), "bankName": web.String(r.BankName), "bankAccount": web.String(r.BankAccount), "bankHolderName": web.String(r.BankHolderName), "emergencyName": web.String(r.EmergencyName),
			"emergencyPhone": web.String(r.EmergencyPhone), "emergencyRelation": web.String(r.EmergencyRelation), "education": web.String(r.Education), "skills": web.String(r.Skills), "bio": web.String(r.Bio), "avatar": web.String(r.Avatar)})
	}
}

func updateProfileHTTP(db *gorm.DB, avatars AvatarStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := identity.Current(c)
		if actor.EmployeeID == nil {
			web.Fail(c, web.NotFound("Profil karyawan tidak ditemukan"))
			return
		}
		var input profileInput
		if !web.Bind(c, &input, profileBodyLimit) {
			return
		}
		email, err := identity.NormalizeEmail(input.Email)
		name := strings.TrimSpace(input.Name)
		if err != nil || !web.Text(name, 1, 160) {
			web.Fail(c, web.Invalid("Nama atau email tidak valid"))
			return
		}
		values := input.values()
		values["phone"], values["address"], values["placeOfBirth"], values["gender"], values["identityNumber"], values["npwpNumber"] = input.Phone, input.Address, input.PlaceOfBirth, input.Gender, input.IdentityNumber, input.NPWPNumber
		fields, err := personalUpdates(values, false)
		if err != nil {
			web.Fail(c, err)
			return
		}
		date, err := web.ParseDate(web.String(input.BirthDate))
		if err != nil {
			web.Fail(c, err)
			return
		}
		if date != nil {
			fields["birthDate"] = date
		}
		fields["email"], fields["name"] = email, name
		cleanup := func() {}
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			row, err := lockEmployee(tx, *actor.EmployeeID)
			if err != nil {
				return err
			}
			if web.String(row.UserID) != actor.ID {
				return web.Forbidden("Profil tidak dapat diakses")
			}
			user, err := identity.LockUser(tx, actor.ID)
			if err != nil {
				return err
			}
			if err := ensureEmail(tx, email, row.ID, user.ID); err != nil {
				return err
			}
			var avatar *string
			avatar, cleanup, err = avatars.Save(input.Avatar, row.Avatar)
			if err != nil {
				return err
			}
			fields["avatar"] = avatar
			if err := tx.Model(&row).Updates(fields).Error; err != nil {
				return err
			}
			if email != user.Email {
				if err := tx.Where(`"userId" = ?`, user.ID).Delete(&identity.PasswordResetToken{}).Error; err != nil {
					return err
				}
			}
			return tx.Model(&user).Update("email", email).Error
		}, &sql.TxOptions{Isolation: sql.LevelSerializable})
		if err != nil {
			cleanup()
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Profil berhasil diperbarui", nil)
	}
}

var phoneNumber = regexp.MustCompile(`^\+[0-9]{9,16}$`)
var numeric = regexp.MustCompile(`^[0-9]+$`)

func onboardHTTP(db *gorm.DB, avatars AvatarStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		actor := identity.Current(c)
		if actor.EmployeeID == nil || actor.MustChangePassword {
			web.Fail(c, web.Forbidden("Selesaikan penggantian password sebelum onboarding"))
			return
		}
		var input onboardingInput
		if !web.Bind(c, &input, profileBodyLimit) {
			return
		}
		if !phoneNumber.MatchString(web.String(input.Phone)) || strings.TrimSpace(web.String(input.Address)) == "" || strings.TrimSpace(web.String(input.PlaceOfBirth)) == "" || web.String(input.Gender) == "" {
			web.Fail(c, web.Invalid("Lengkapi data pribadi"))
			return
		}
		identityNumber := web.String(input.IdentityNumber)
		account := web.String(input.BankAccount)
		emergency := web.String(input.EmergencyPhone)
		if len(identityNumber) != 16 || !numeric.MatchString(identityNumber) || !numeric.MatchString(account) || strings.TrimSpace(web.String(input.BankName)) == "" || strings.TrimSpace(web.String(input.BankHolderName)) == "" ||
			strings.TrimSpace(web.String(input.EmergencyName)) == "" || strings.TrimSpace(web.String(input.EmergencyRelation)) == "" || !numeric.MatchString(emergency) {
			web.Fail(c, web.Invalid("Lengkapi identitas, rekening, dan kontak darurat"))
			return
		}
		date, err := web.ParseDate(input.BirthDate)
		if err != nil || date == nil || date.After(time.Now()) {
			web.Fail(c, web.Invalid("Tanggal lahir tidak valid"))
			return
		}
		values := input.values()
		values["phone"], values["address"], values["placeOfBirth"], values["gender"], values["identityNumber"], values["npwpNumber"] = input.Phone, input.Address, input.PlaceOfBirth, input.Gender, input.IdentityNumber, input.NPWPNumber
		fields, err := personalUpdates(values, true)
		if err != nil {
			web.Fail(c, err)
			return
		}
		fields["birthDate"], fields["isProfileComplete"], fields["onboardedAt"] = date, true, time.Now().UTC()
		cleanup := func() {}
		var avatar *string
		err = db.WithContext(c.Request.Context()).Transaction(func(tx *gorm.DB) error {
			row, err := lockEmployee(tx, *actor.EmployeeID)
			if err != nil {
				return err
			}
			if web.String(row.UserID) != actor.ID {
				return web.Forbidden("Profil tidak dapat diakses")
			}
			if row.IsProfileComplete {
				return web.Conflict("Onboarding sudah diselesaikan")
			}
			user, err := identity.LockUser(tx, actor.ID)
			if err != nil {
				return err
			}
			if user.MustChangePassword {
				return web.Forbidden("Selesaikan penggantian password sebelum onboarding")
			}
			avatar, cleanup, err = avatars.Save(input.Avatar, row.Avatar)
			if err != nil {
				return err
			}
			fields["avatar"] = avatar
			return tx.Model(&row).Updates(fields).Error
		})
		if err != nil {
			cleanup()
			web.Fail(c, err)
			return
		}
		web.OK(c, 200, "Onboarding berhasil diselesaikan!", gin.H{"avatar": avatar})
	}
}
