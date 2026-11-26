package identity

import "time"

type User struct {
	ID                  string     `gorm:"column:id;primaryKey"`
	Email               string     `gorm:"column:email"`
	Password            string     `gorm:"column:password" json:"-"`
	MustChangePassword  bool       `gorm:"column:mustChangePassword"`
	FailedLoginAttempts int32      `gorm:"column:failedLoginAttempts"`
	LockedUntil         *time.Time `gorm:"column:lockedUntil;type:timestamp(3)"`
	RoleID              string     `gorm:"column:roleId"`
	CreatedAt           time.Time  `gorm:"column:createdAt;type:timestamp(3)"`
	UpdatedAt           time.Time  `gorm:"column:updatedAt;type:timestamp(3)"`
}

func (User) TableName() string { return "User" }

type Role struct {
	ID        string    `gorm:"column:id;primaryKey"`
	Name      string    `gorm:"column:name"`
	CreatedAt time.Time `gorm:"column:createdAt;type:timestamp(3)"`
}

func (Role) TableName() string { return "Role" }

type PasswordResetToken struct {
	ID        string    `gorm:"column:id;primaryKey"`
	Token     string    `gorm:"column:token" json:"-"`
	Expires   time.Time `gorm:"column:expires;type:timestamp(3)"`
	UserID    string    `gorm:"column:userId"`
	CreatedAt time.Time `gorm:"column:createdAt;type:timestamp(3)"`
}

func (PasswordResetToken) TableName() string { return "PasswordResetToken" }
