export const SPECIALIZATIONS = [
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
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

export function isStandardSpecialization(
  value: string,
): value is Specialization {
  return SPECIALIZATIONS.includes(value as Specialization);
}
