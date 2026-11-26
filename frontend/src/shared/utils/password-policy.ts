export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULE_TEXT = `Minimal ${PASSWORD_MIN_LENGTH} karakter, berisi huruf dan angka.`;

export function validatePasswordStrength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`;
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return "Password harus berisi huruf dan angka.";
  return null;
}
