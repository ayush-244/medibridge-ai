export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

export function isValidEmail(email: string): boolean {
  if (!email.trim()) return false;
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone.trim()) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && PHONE_REGEX.test(phone.trim());
}

export function getEmailError(email: string, required = false): string | null {
  if (!email.trim()) {
    return required ? "Email is required" : null;
  }
  if (!isValidEmail(email)) {
    return "Enter a valid email address";
  }
  return null;
}

export function getPhoneError(phone: string, required = false): string | null {
  if (!phone.trim()) {
    return required ? "Phone number is required" : null;
  }
  if (!isValidPhone(phone)) {
    return "Enter a valid phone number (7–15 digits)";
  }
  return null;
}
