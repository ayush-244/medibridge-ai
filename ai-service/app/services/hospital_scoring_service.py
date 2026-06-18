from typing import Dict


def calculate_hospital_score(
    has_specialist: bool,
    current_patients: int,
    max_patients: int,
    available_beds: int,
    distance_km: float,
) -> Dict:

    specialist_score = 40.0 if has_specialist else 0.0

    if max_patients > 0:
        available_slots = max(0, max_patients - current_patients)
        capacity_ratio = available_slots / max_patients
        doctor_capacity_score = capacity_ratio * 25.0
    else:
        doctor_capacity_score = 0.0

    bed_score = min(20.0, max(0.0, available_beds * 1.5))
    distance_score = max(0.0, 15.0 - (distance_km * 0.5))

    total_score = round(
        specialist_score
        + doctor_capacity_score
        + bed_score
        + distance_score
    )

    total_score = max(0, min(100, total_score))

    return {
        "score": total_score,
        "breakdown": {
            "specialistScore": round(specialist_score, 2),
            "doctorCapacityScore": round(doctor_capacity_score, 2),
            "bedScore": round(bed_score, 2),
            "distanceScore": round(distance_score, 2),
        },
    }