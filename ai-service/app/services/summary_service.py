import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_medical_summary(text: str):

    prompt = f"""
    You are a medical assistant.

    Analyze the following patient report.

    Return:

    1. Patient Summary
    2. Diagnosis
    3. Symptoms
    4. Risk Factors
    5. Current Medications
    6. Follow-up Recommendations

    Report:

    {text}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text