const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Emergency Medicine",
  "General Medicine",
  "Pediatrics",
  "Dermatology",
  "Psychiatry",
  "Oncology",
  "Radiology",
  "Pulmonology",
  "Nephrology",
  "Gastroenterology",
  "Endocrinology",
  "Urology",
  "ENT",
  "Ophthalmology",
  "Gynecology",
  "Anesthesiology",
  "Critical Care",
  "Surgery",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && PHONE_REGEX.test(phone.trim());
}

function isValidSpecialization(value) {
  if (!value || typeof value !== "string") return false;
  return SPECIALIZATIONS.includes(value.trim());
}

module.exports = {
  SPECIALIZATIONS,
  isValidEmail,
  isValidPhone,
  isValidSpecialization,
};
