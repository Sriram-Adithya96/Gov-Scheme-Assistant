import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")

genai.configure(api_key=GEMINI_API_KEY)


def generate_ai_explanation(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the response.
    """

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)

    return response.text


def generate_scheme_explanation(user_data, scheme):
    """
    Generate an AI explanation for a government scheme.
    """

    from ai.explanation import explain_eligibility

    explanation_data = explain_eligibility(
        user_data,
        scheme
    )

    prompt = explanation_data["prompt"]

    return generate_ai_explanation(prompt)