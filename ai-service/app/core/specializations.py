from typing import Optional

SPECIALIZATIONS = [
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
]

_SPECIALIST_ALIASES = {
    "cardiologist": "Cardiology",
    "cardiology": "Cardiology",
    "neurologist": "Neurology",
    "neurology": "Neurology",
    "orthopedic surgeon": "Orthopedics",
    "orthopedics": "Orthopedics",
    "orthopaedic surgeon": "Orthopedics",
    "emergency medicine": "Emergency Medicine",
    "emergency physician": "Emergency Medicine",
    "general medicine": "General Medicine",
    "general physician": "General Medicine",
    "internist": "General Medicine",
    "pediatrician": "Pediatrics",
    "pediatrics": "Pediatrics",
    "dermatologist": "Dermatology",
    "dermatology": "Dermatology",
    "psychiatrist": "Psychiatry",
    "psychiatry": "Psychiatry",
    "oncologist": "Oncology",
    "oncology": "Oncology",
    "radiologist": "Radiology",
    "radiology": "Radiology",
    "pulmonologist": "Pulmonology",
    "pulmonology": "Pulmonology",
    "nephrologist": "Nephrology",
    "nephrology": "Nephrology",
    "gastroenterologist": "Gastroenterology",
    "gastroenterology": "Gastroenterology",
    "endocrinologist": "Endocrinology",
    "endocrinology": "Endocrinology",
    "urologist": "Urology",
    "urology": "Urology",
    "ent specialist": "ENT",
    "ent": "ENT",
    "otolaryngologist": "ENT",
    "ophthalmologist": "Ophthalmology",
    "ophthalmology": "Ophthalmology",
    "gynecologist": "Gynecology",
    "gynecology": "Gynecology",
    "obstetrician": "Gynecology",
    "anesthesiologist": "Anesthesiology",
    "anesthesiology": "Anesthesiology",
    "critical care": "Critical Care",
    "intensivist": "Critical Care",
    "general surgeon": "Surgery",
    "surgeon": "Surgery",
    "surgery": "Surgery",
}


def is_valid_specialization(value: str) -> bool:
    if not value or not isinstance(value, str):
        return False
    return value.strip() in SPECIALIZATIONS


def normalize_specialization(value: str) -> Optional[str]:
    if not value or not isinstance(value, str):
        return None

    cleaned = value.strip()
    if cleaned in SPECIALIZATIONS:
        return cleaned

    alias_match = _SPECIALIST_ALIASES.get(cleaned.lower())
    if alias_match:
        return alias_match

    lower_cleaned = cleaned.lower()
    for specialization in SPECIALIZATIONS:
        if specialization.lower() == lower_cleaned:
            return specialization

    for alias, specialization in _SPECIALIST_ALIASES.items():
        if alias in lower_cleaned or lower_cleaned in alias:
            return specialization

    for specialization in SPECIALIZATIONS:
        spec_lower = specialization.lower()
        if spec_lower in lower_cleaned or lower_cleaned in spec_lower:
            return specialization

    return None
