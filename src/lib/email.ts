/** Shared email check for the early-bird form and the API. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmail(value: string): boolean {
  if (value.length < 3 || value.length > 254) return false;
  if (value.includes(',') || value.includes(' ') || value.includes('..')) return false;
  return EMAIL_PATTERN.test(value);
}
