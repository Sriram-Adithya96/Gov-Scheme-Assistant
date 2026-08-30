import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Support both the older google-generativeai library and the newer google-genai package.
try:
    import importlib
    genai = importlib.import_module("google.generativeai")
except ModuleNotFoundError:
    genai = None

if genai is not None and hasattr(genai, "configure") and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

try:
    google_genai = importlib.import_module("google.genai")
except ModuleNotFoundError:
    google_genai = None


def _extract_text(response):
    """Return the generated text from either SDK response format."""
    if response is None:
        return ""

    text = getattr(response, "text", None)
    if text:
        return text

    try:
        return response.candidates[0].content.parts[0].text
    except Exception:
        return str(response)


def generate_ai_explanation(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the generated explanation.
    """

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")

    if genai is not None:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return _extract_text(response)

    if google_genai is not None:
        client = google_genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return _extract_text(response)

    raise ModuleNotFoundError(
        "No supported Google AI SDK found. Install google-genai or google-generativeai."
    )


def generate_scheme_explanation(user_data, scheme):
    """
    Generate a citizen-friendly AI explanation
    using the existing eligibility explanation module.
    """

    from ai.explanation import explain_eligibility

    explanation_data = explain_eligibility(
        user_data,
        scheme,
    )

    prompt = explanation_data["prompt"]

    return generate_ai_explanation(prompt)