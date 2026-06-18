from typing import List, Dict

from app.services.recommendation_service import recommend_specialist
from app.services.hospital_scoring_service import calculate_hospital_score


def haversine_distance(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, sqrt, atan2

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def match_hospitals(
    patient_id: str,
    referral_data: Dict,
    matching_data: Dict,
) -> Dict:

    # STEP 1
    specialist_result = recommend_specialist(patient_id)

    specialist = specialist_result["specialist"]

    # STEP 2
    origin_hospital = referral_data["fromHospital"]

    origin_hospital_id = origin_hospital["_id"]

    origin_lat = origin_hospital["location"]["latitude"]
    origin_lon = origin_hospital["location"]["longitude"]

    hospitals = matching_data["hospitals"]
    doctors = matching_data["doctors"]
    reservations = matching_data["reservations"]

    # STEP 3
    active_reservations = {}

    for reservation in reservations:

        status = reservation.get("reservationStatus")

        if status not in [
            "PENDING",
            "CONFIRMED",
            "ARRIVED",
        ]:
            continue

        hospital_id = reservation.get("hospital")

        active_reservations[hospital_id] = (
            active_reservations.get(hospital_id, 0) + 1
        )

    recommended_hospitals = []

    # STEP 4
    for hospital in hospitals:

        hospital_id = hospital["_id"]

        print("\n================================================")
        print("HOSPITAL:", hospital["name"])
        print("HOSPITAL ID:", hospital_id)

        # Don't recommend same hospital
        if hospital_id == origin_hospital_id:
            print("SKIPPED -> Origin Hospital")
            continue

        # STEP 5
        hospital_doctors = [
            doctor
            for doctor in doctors
            if str(doctor.get("hospital")) == str(hospital_id)
        ]

        specialist_doctors = [
            doctor
            for doctor in hospital_doctors
            if doctor.get("specialization", "").strip().lower()
            == specialist.strip().lower()
        ]

        available_doctors = [
            doctor
            for doctor in specialist_doctors
            if doctor.get("status", "AVAILABLE") == "AVAILABLE"
        ]

        print("Required Specialist:", specialist)
        print("Doctors Found:", len(hospital_doctors))
        print("Specialist Doctors:", len(specialist_doctors))
        print("Available Doctors:", len(available_doctors))

        for d in hospital_doctors:
            print(
                f"Doctor={d.get('name')} | "
                f"Specialization={d.get('specialization')} | "
                f"Status={d.get('status')} | "
                f"Hospital={d.get('hospital')}"
            )

        if not available_doctors:
            print("REJECTED -> No Available Specialist Doctors")
            continue

        # STEP 6
        reserved_count = active_reservations.get(
            hospital_id,
            0,
        )

        available_beds = (
            hospital["availableBeds"]
            - reserved_count
        )

        print("Available Beds:", available_beds)

        if available_beds <= 0:
            print("REJECTED -> No Beds")
            continue

        # STEP 7
        distance_km = haversine_distance(
            origin_lat,
            origin_lon,
            hospital["location"]["latitude"],
            hospital["location"]["longitude"],
        )

        print("Distance KM:", round(distance_km, 2))

        # STEP 8
        best_doctor = min(
            available_doctors,
            key=lambda d: d.get("currentPatients", 0),
        )

        print("Selected Doctor:", best_doctor["name"])

        # STEP 9
        score_result = calculate_hospital_score(
            has_specialist=True,
            current_patients=best_doctor.get(
                "currentPatients",
                0,
            ),
            max_patients=best_doctor.get(
                "maxPatients",
                5,
            ),
            available_beds=available_beds,
            distance_km=distance_km,
        )

        print("Score:", score_result["score"])

        recommended_hospitals.append(
            {
                "hospitalId": hospital_id,
                "hospitalName": hospital["name"],
                "doctorId": best_doctor["_id"],
                "doctorName": best_doctor["name"],
                "specialist": specialist,
                "availableBeds": available_beds,
                "distanceKm": round(distance_km, 2),
                "score": score_result["score"],
                "breakdown": score_result["breakdown"],
            }
        )

    print("\nFINAL MATCHES:", len(recommended_hospitals))

    recommended_hospitals.sort(
        key=lambda hospital: (
            -hospital["score"],
            hospital["distanceKm"],
        )
    )

    return {
        "specialist": specialist,
        "recommendedHospitals": recommended_hospitals[:5],
    }