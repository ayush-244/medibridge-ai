import requests

from app.services.hospital_matching_service import match_hospitals


REFERRAL_ID = "6a26b08bceaee55f6b61bd97"

# Get referral data from Node backend
referral_response = requests.get(
    f"http://localhost:5000/api/ai/referral/{REFERRAL_ID}"
)

referral_data = referral_response.json()["data"]

# Get hospitals/doctors/reservations
matching_response = requests.get(
    "http://localhost:5000/api/ai/matching-data"
)

matching_data = matching_response.json()

print("Hospitals:", len(matching_data["hospitals"]))
print("Doctors:", len(matching_data["doctors"]))
print("Reservations:", len(matching_data["reservations"]))

result = match_hospitals(
    patient_id="PATIENT002",
    referral_data=referral_data,
    matching_data=matching_data,
)

print("\nRESULT:")
print(result)