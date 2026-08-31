"""Server-side Sarvam AI translation helpers."""
# Kept as a separate service so credentials never reach the React bundle.

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

try:
    from sarvamai import SarvamAI
except ModuleNotFoundError:  # Lets the rest of the API start with a clear route error.
    SarvamAI = None


def _client():
    if SarvamAI is None:
        raise RuntimeError("sarvamai is not installed. Install it with: pip install sarvamai")
    if not SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY is not configured on the server")
    return SarvamAI(api_subscription_key=SARVAM_API_KEY)


@lru_cache(maxsize=1024)
def translate_text(text: str, target_language: str) -> str:
    """Translate English display text and keep the API key on the server."""
    if target_language == "en-IN":
        return text
    if len(text) > 2000:
        raise ValueError("Text must be 2,000 characters or fewer")

    response = _client().text.translate(
        input=text,
        source_language_code="en-IN",
        target_language_code=target_language,
        model="sarvam-translate:v1",
    )
    translated_text = getattr(response, "translated_text", None)
    if not translated_text:
        raise RuntimeError("Sarvam AI returned no translated text")
    return translated_text
