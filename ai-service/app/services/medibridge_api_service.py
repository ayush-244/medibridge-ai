import requests

NODE_API_BASE_URL = "http://localhost:5000/api"

def get_matching_data():
    response = requests.get(
        f"{NODE_API_BASE_URL}/ai/matching-data",
        timeout=30,
    )

    response.raise_for_status()

    return response.json()

def get_referral_data(referral_id: str):
    response = requests.get(
        f"{NODE_API_BASE_URL}/ai/referral/{referral_id}",
        timeout=30,
    )

    response.raise_for_status()

    return response.json()