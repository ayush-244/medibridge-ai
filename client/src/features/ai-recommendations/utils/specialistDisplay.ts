const SPECIALIST_DISPLAY_NAMES: Record<string, string> = {
  Cardiology: "Cardiologist",
  Neurology: "Neurologist",
  Orthopedics: "Orthopedic Surgeon",
  "Emergency Medicine": "Emergency Physician",
  "General Medicine": "General Physician",
  Pediatrics: "Pediatrician",
  Dermatology: "Dermatologist",
  Psychiatry: "Psychiatrist",
  Oncology: "Oncologist",
  Radiology: "Radiologist",
  Pulmonology: "Pulmonologist",
  Nephrology: "Nephrologist",
  Gastroenterology: "Gastroenterologist",
  Endocrinology: "Endocrinologist",
  Urology: "Urologist",
  ENT: "ENT Specialist",
  Ophthalmology: "Ophthalmologist",
  Gynecology: "Gynecologist",
  Anesthesiology: "Anesthesiologist",
  "Critical Care": "Intensivist",
  Surgery: "General Surgeon",
};

export function getSpecialistDisplayName(specialization: string): string {
  return SPECIALIST_DISPLAY_NAMES[specialization] ?? specialization;
}
