import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validatePasswordStrength } from "@/shared/utils/password-policy";

const SALT_ROUNDS = 10;
const TEMP_PASSWORD_LENGTH = 10;
const TEMP_PASSWORD_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function assertStrongPassword(password: string) {
  const error = validatePasswordStrength(password);
  if (error) throw new Error(error);
}

export function generateTemporaryPassword(): string {
  let password = "";
  while (validatePasswordStrength(password) !== null) {
    password = Array.from(crypto.randomBytes(TEMP_PASSWORD_LENGTH), (byte) => TEMP_PASSWORD_CHARS[byte % TEMP_PASSWORD_CHARS.length]).join("");
  }
  return password;
}
