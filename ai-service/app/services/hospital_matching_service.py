from typing import Any, Dict, List, Optional

from app.core.logger import logger
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
    referral_context = {
        "patientName": referral_data.get("patientName"),
        "age": referral_data.get("age"),
        "condition": referral_data.get("condition"),
    }
    logger.info("[diag] match_hospitals step1: calling recommend_specialist patient_id=%s context=%s", patient_id, referral_context)
    specialist_result = recommend_specialist(
        patient_id,
        referral_context=referral_context,
    )

    logger.info(
        "Hospital match specialist source=%s for patientId=%s",
        specialist_result.get("source", "unknown"),
        patient_id,
    )

    specialist = specialist_result["specialist"]

    # STEP 2
    origin_hospital = referral_data["fromHospital"]
    logger.info("[diag] match_hospitals step2: origin_hospital keys=%s location=%s", list(origin_hospital.keys()), origin_hospital.get("location"))

    origin_hospital_id = origin_hospital["_id"]

    origin_lat = origin_hospital["location"]["latitude"]
    origin_lon = origin_hospital["location"]["longitude"]
    logger.info("[diag] match_hospitals step2: origin_lat=%s origin_lon=%s", origin_lat, origin_lon)

    hospitals = matching_data["hospitals"]
    doctors = matching_data["doctors"]
    reservations = matching_data["reservations"]
    logger.info("[diag] match_hospitals step2: hospitals=%d, doctors=%d, reservations=%d", len(hospitals), len(doctors), len(reservations))

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

    logger.info("[diag] match_hospitals step4: starting hospital loop over %d hospitals", len(hospitals))

    # STEP 4
    for hospital in hospitals:

        hospital_id = hospital["_id"]

        # Don't recommend same hospital
        if hospital_id == origin_hospital_id:
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


        if not available_doctors:
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

        if available_beds <= 0:
            continue

        # STEP 7
        distance_km = haversine_distance(
            origin_lat,
            origin_lon,
            hospital["location"]["latitude"],
            hospital["location"]["longitude"],
        )       

        # STEP 8
        best_doctor = min(
            available_doctors,
            key=lambda d: d.get("currentPatients", 0),
        )
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

from app.services.medibridge_api_service import (
    get_matching_data,
    get_referral_data,
)


def generate_hospital_match(
    patient_id: str,
    referral_id: str,
    origin_hospital_id: Optional[str] = None,
):
    logger.info("[diag] generate_hospital_match start: patient_id=%s referral_id=%s origin_hospital_id=%s", patient_id, referral_id, origin_hospital_id)

    matching_response = get_matching_data()
    logger.info("[diag] get_matching_data keys=%s hospitals=%d doctors=%d reservations=%d", list(matching_response.keys()), len(matching_response.get("hospitals", [])), len(matching_response.get("doctors", [])), len(matching_response.get("reservations", [])))

    if origin_hospital_id:
        hospitals = matching_response.get("hospitals", [])
        matching_ids = [h.get("_id") for h in hospitals]
        logger.info("[diag] origin_hospital_id=%s matching hospital _ids (first 5)=%s", origin_hospital_id, matching_ids[:5])

        origin_hospital = next(
            (h for h in hospitals if h["_id"] == origin_hospital_id),
            None,
        )
        logger.info("[diag] origin_hospital found=%s", origin_hospital is not None)
        if not origin_hospital:
            raise ValueError(
                f"Origin hospital {origin_hospital_id} not found in matching data"
            )
        referral_data = {
            "_id": origin_hospital_id,
            "patientName": "",
            "age": 0,
            "condition": "",
            "fromHospital": origin_hospital,
        }
    else:
        referral_response = get_referral_data(referral_id)
        referral_data = referral_response["data"]

    logger.info("[diag] calling match_hospitals...")
    result = match_hospitals(
        patient_id=patient_id,
        referral_data=referral_data,
        matching_data=matching_response,
    )
    logger.info("[diag] match_hospitals returned: specialist=%s hospitals=%d", result.get("specialist"), len(result.get("recommendedHospitals", [])))
    return result