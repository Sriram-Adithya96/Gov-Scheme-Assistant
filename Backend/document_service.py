"""Gemini-backed, in-memory PDF certificate analysis."""

import json
import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel


load_dotenv(Path(__file__).with_name(".env"))

MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

REQUESTED_TYPES = {
    "income": ("income_certificate", "Income Certificate"),
    "caste": ("caste_certificate", "Caste Certificate"),
    "other": ("other_certificate", "Other Certificate"),
}


class DocumentFields(BaseModel):
    full_name: str | None = None
    annual_income: str | None = None
    issuing_authority: str | None = None
    valid_until: str | None = None
    certificate_number: str | None = None
    state: str | None = None
    caste: str | None = None


class GeminiDocumentAnalysis(BaseModel):
    document_type: Literal[
        "income_certificate", "caste_certificate", "other_certificate", "resume", "unknown"
    ]
    matches_requested_type: bool
    confidence: float
    fields: DocumentFields


def _empty_fields() -> dict[str, None]:
    return DocumentFields().model_dump()


def _result(message: str, *, success: bool = False, document_type: str = "unknown",
            confidence: float = 0.0, fields: dict | None = None) -> dict:
    return {
        "success": success,
        "message": message,
        "document_type": document_type,
        "matches_requested_type": success,
        "confidence": confidence,
        "fields": fields if fields is not None else _empty_fields(),
    }


def _prompt(certificate_type: str) -> str:
    expected_type, expected_label = REQUESTED_TYPES[certificate_type]
    return f"""
Analyze the supplied PDF visually and textually. It may be a scanned document.
The user selected: {expected_label}.

Classify document_type as exactly one of: income_certificate, caste_certificate,
other_certificate, resume, or unknown. Set matches_requested_type true only when
you can confidently verify that the document is a {expected_label}
({expected_type}). If it is a resume, another certificate type, or uncertain,
set it to false.

Extract only values explicitly present in the PDF. Never infer, calculate,
complete, or copy values from a non-matching document. Use null for every field
that is absent or unclear. The fields are full_name, annual_income,
issuing_authority, valid_until, certificate_number, state, and caste. Keep
annual_income as the exact printed text, including its currency where present.
Return only the structured response required by the schema.
"""


def analyze_pdf_with_gemini(document_bytes: bytes, certificate_type: str) -> dict:
    """Send one PDF to Gemini without persisting its bytes or content locally."""
    if certificate_type not in REQUESTED_TYPES:
        return _result("Document type could not be verified.")
    if not document_bytes or len(document_bytes) > MAX_DOCUMENT_BYTES:
        return _result("The PDF is empty or exceeds the 10 MB limit.")
    if not document_bytes.startswith(b"%PDF-"):
        return _result("Please upload a PDF document.")
    if not GEMINI_API_KEY:
        return _result("Document analysis is unavailable because GEMINI_API_KEY is not configured.")

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                _prompt(certificate_type),
                types.Part.from_bytes(data=document_bytes, mime_type="application/pdf"),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiDocumentAnalysis,
            ),
        )
        parsed = getattr(response, "parsed", None)
        if parsed is None:
            parsed = json.loads(response.text)
        analysis = GeminiDocumentAnalysis.model_validate(parsed)
    except Exception:
        # Do not expose document content or provider details in an error response.
        return _result("Document type could not be verified.")

    expected_type, _ = REQUESTED_TYPES[certificate_type]
    matches = (
        analysis.matches_requested_type
        and analysis.document_type == expected_type
    )
    confidence = max(0.0, min(float(analysis.confidence), 1.0))
    fields = analysis.fields.model_dump()
    if not matches:
        # Never return extracted data from a document that did not match the user's selection.
        return _result(
            "Document type could not be verified.",
            document_type=analysis.document_type,
            confidence=confidence,
        )

    return _result(
        "Document analyzed successfully.",
        success=True,
        document_type=analysis.document_type,
        confidence=confidence,
        fields=fields,
    )
