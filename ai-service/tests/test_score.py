from app.services.hospital_scoring_service import (
    calculate_hospital_score
)

result = calculate_hospital_score(
    has_specialist=True,
    current_patients=0,
    max_patients=5,
    available_beds=100,
    distance_km=5,
)

print(result)