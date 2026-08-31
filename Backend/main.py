import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from ai_service import generate_scheme_explanation
from sarvam_service import translate_text, text_to_speech
from document_service import analyze_pdf_with_gemini
app = FastAPI(title="Government Scheme Assistant")

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load scheme data
with open("../data/schemes.json", "r", encoding="utf-8") as file:
    data = json.load(file)

schemes = data["schemes"]


# Citizen information received from frontend
class Citizen(BaseModel):
    age: int
    income: float
    state: str
    gender: str
    caste: str
    occupation: str

    student: bool = False
    farmer: bool = False

    # Additional information for scheme-specific conditions
    owns_land: bool = False
    income_tax_payer: bool = False
    homeless: bool = False
    bpl_family: bool = False
    pregnant: bool = False
    lactating: bool = False
    widow: bool = False
    disability_percentage: int = 0
    has_bank_account: bool = False
    has_lpg_connection: bool = False
    unemployed: bool = False

    documents_available: list[str] = []

@app.get("/")
def home():
    return {
        "message": "Government Scheme Assistant API is running"
    }


@app.get("/schemes")
def get_schemes():
    return {
        "count": len(schemes),
        "schemes": schemes
    }
def calculate_match_score(reasons, scheme):
    """
    Calculate a simple priority score for the prototype.

    This is NOT a probability of approval.
    It represents how strongly the citizen profile
    matches the information available in our database.
    """

    score = 0

    # Each satisfied eligibility condition
    score += len(reasons) * 10

    # Scheme has a defined benefit
    if scheme.get("benefit"):
        score += 5

    # Scheme has required documents listed
    if scheme.get("documents_required"):
        score += 5

    return min(score, 100)

def calculate_application_readiness(
    required_documents,
    available_documents
):
    if not required_documents:
        return {
            "score": 100,
            "missing_documents": []
        }

    available = {
        document.lower().strip()
        for document in available_documents
    }

    matched = 0
    missing = []

    for document in required_documents:
        document_clean = document.lower().strip()

        if document_clean in available:
            matched += 1
        else:
            missing.append(document)

    score = round(
        (matched / len(required_documents)) * 100
    )

    return {
        "score": score,
        "missing_documents": missing
    }

@app.post("/check-eligibility")
def check_eligibility(citizen: Citizen):

    eligible_schemes = []

    for scheme in schemes:

        eligibility = scheme["eligibility"]
        reasons = []

        # -------------------------
        # AGE
        # -------------------------
        if not (
            eligibility["min_age"]
            <= citizen.age
            <= eligibility["max_age"]
        ):
            continue

        reasons.append("Age requirement satisfied")

        # -------------------------
        # INCOME
        # -------------------------
        if citizen.income > eligibility["max_income"]:
            continue

        reasons.append("Income requirement satisfied")

        # -------------------------
        # CASTE
        # -------------------------
        if "allowed_castes" in eligibility:
            if citizen.caste not in eligibility["allowed_castes"]:
                continue

            reasons.append("Category requirement satisfied")

        if "required_caste" in eligibility:
            if citizen.caste != eligibility["required_caste"]:
                continue

            reasons.append("Required category satisfied")

        # -------------------------
        # GENDER
        # -------------------------
        if "required_gender" in eligibility:
            if citizen.gender.lower() != eligibility["required_gender"].lower():
                continue

            reasons.append("Gender requirement satisfied")

        # -------------------------
        # OCCUPATION
        # -------------------------
        if "required_occupation" in eligibility:

            occupations = eligibility["required_occupation"]

            if "Any" not in occupations:

                if citizen.occupation not in occupations:
                    continue

                reasons.append("Occupation requirement satisfied")

        # -------------------------
        # SPECIAL CONDITIONS
        # -------------------------

        conditions = eligibility.get("special_conditions", [])

        for condition in conditions:

            condition_lower = condition.lower()

            # Land ownership
            if "own cultivable land" in condition_lower:
                if not citizen.owns_land:
                    break

                reasons.append("Land ownership requirement satisfied")

            # Income tax
            if "not an income tax payer" in condition_lower:
                if citizen.income_tax_payer:
                    break

                reasons.append("Income-tax condition satisfied")

            # Homeless
            if "homeless" in condition_lower:
                if not citizen.homeless:
                    break

                reasons.append("Housing condition satisfied")

            # BPL
            if "bpl family" in condition_lower:
                if not citizen.bpl_family:
                    break

                reasons.append("BPL requirement satisfied")

            # Pregnant
            if "pregnant" in condition_lower:
                if not citizen.pregnant:
                    break

                reasons.append("Pregnancy requirement satisfied")

            # Lactating
            if "lactating" in condition_lower:
                if not citizen.lactating:
                    break

                reasons.append("Lactation requirement satisfied")

            # Widow
            if "widow" in condition_lower:
                if not citizen.widow:
                    break

                reasons.append("Widow requirement satisfied")

            # Disability
            if "80%" in condition_lower:
                if citizen.disability_percentage < 80:
                    break

                reasons.append("Disability requirement satisfied")

            # Bank account
            if "savings bank account" in condition_lower:
                if not citizen.has_bank_account:
                    break

                reasons.append("Bank account requirement satisfied")

            # LPG
            if "no existing lpg connection" in condition_lower:
                if citizen.has_lpg_connection:
                    break

                reasons.append("No existing LPG connection")

            # Unemployed
            if "unemployed" in condition_lower:
                if not citizen.unemployed:
                    break

                reasons.append("Unemployment condition satisfied")

        else:
            # All conditions passed
            match_score = calculate_match_score(reasons, scheme)

            if match_score >= 90:
                priority = "Highly Recommended"
            elif match_score >= 75:
                priority = "Recommended"
            else:
                priority = "Good Match"

            readiness = calculate_application_readiness(
                scheme["documents_required"],
                citizen.documents_available
            )

            eligible_schemes.append({
                "id": scheme["id"],
                "name": scheme["name_en"],
                "category": scheme["category"],
                "benefit": scheme["benefit"],
                "documents": scheme["documents_required"],
                "application_link": scheme["application_link"],
                "reasons": reasons,
                "match_score": match_score,
                "priority": priority,
                "application_readiness": readiness["score"],
                "missing_documents": readiness["missing_documents"]
            })

    eligible_schemes.sort(
        key=lambda scheme: scheme["match_score"],
        reverse=True
    )
    return {
        "count": len(eligible_schemes),
        "eligible_schemes": eligible_schemes
    }


@app.post("/ai/explain")
def ai_explain(citizen: Citizen, scheme_id: str):
    """
    Generate an AI explanation for a specific government scheme.
    Eligibility itself is still determined by the rule engine.
    """

    from ai.explanation import get_scheme_by_id

    scheme = get_scheme_by_id(scheme_id)

    if scheme is None:
        return {
            "success": False,
            "message": "Scheme not found"
        }

    # Convert Citizen model into the format expected
    # by Friend 1's explanation module.
    user_data = citizen.model_dump()

    # Friend 1's module expects annual_income.
    user_data["annual_income"] = user_data.get("income")

    try:
        explanation = generate_scheme_explanation(
            user_data,
            scheme
        )

        return {
            "success": True,
            "scheme_id": scheme_id,
            "scheme_name": scheme["name_en"],
            "explanation": explanation
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"AI explanation failed: {str(e)}"
        }


@app.post("/documents/analyze")
async def analyze_document(
    certificate_type: str = Form(...), document: UploadFile = File(...)
):
    """Analyze one PDF in memory; documents and text are never persisted."""
    if not (document.filename or "").lower().endswith(".pdf"):
        return {"success": False, "message": "Please upload a PDF document.", "fields": []}

    document_bytes = await document.read()
    return analyze_pdf_with_gemini(document_bytes, certificate_type)


SUPPORTED_TRANSLATION_LANGUAGES = {
    "en-IN", "hi-IN", "te-IN", "ta-IN", "kn-IN", "ml-IN", "mr-IN",
    "gu-IN", "bn-IN", "pa-IN", "od-IN", "as-IN", "brx-IN", "doi-IN",
    "kok-IN", "ks-IN", "mai-IN", "mni-IN", "ne-IN", "sa-IN", "sat-IN",
    "sd-IN", "ur-IN",
}


class TranslationRequest(BaseModel):
    text: str | None = None
    # Used by the UI to reduce browser requests. The documented single-text
    # request remains supported and returns translated_text.
    texts: list[str] | None = None
    target_language: str


@app.post("/translate")
def translate(request: TranslationRequest):
    """Translate English user-facing text with Sarvam AI."""
    if request.target_language not in SUPPORTED_TRANSLATION_LANGUAGES:
        return {"success": False, "message": "Unsupported target language"}

    requested_texts = request.texts if request.texts is not None else [request.text]
    if not requested_texts or any(not isinstance(text, str) or not text.strip() for text in requested_texts):
        return {"success": False, "message": "Text cannot be empty"}

    try:
        translations = [translate_text(text, request.target_language) for text in requested_texts]
    except Exception as exc:
        return {"success": False, "message": f"Translation failed: {str(exc)}"}

    response = {"success": True, "target_language": request.target_language}
    if request.texts is None:
        response["translated_text"] = translations[0]
    else:
        response["translated_texts"] = translations
    return response


class TTSRequest(BaseModel):
    text: str
    language_code: str = "te-IN"


@app.post("/tts")
def tts(request: TTSRequest):
    """Convert text to speech with Sarvam AI."""
    if not request.text or not request.text.strip():
        return {"success": False, "message": "Text cannot be empty"}
    try:
        base64_audio = text_to_speech(request.text, request.language_code)
        return {
            "success": True,
            "base64_audio": base64_audio
        }
    except Exception as exc:
        return {"success": False, "message": f"TTS conversion failed: {str(exc)}"}


# -------------------------------------------------------------------------
# VOICE ASSISTANT — profile extraction
# -------------------------------------------------------------------------

class VoiceExtractRequest(BaseModel):
    user_input: str
    language_code: str = "en-IN"
    field: str          # which field we are currently asking about
    collected_so_far: dict = {}


VALID_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
]

VALID_OCCUPATIONS = [
    "Student", "Farmer", "Unemployed", "Salaried employee",
    "Self-employed", "Daily wage / labour", "Homemaker", "Retired", "Other",
]


@app.post("/ai/voice-extract")
def voice_extract(request: VoiceExtractRequest):
    """
    Use Gemini to extract a citizen-profile field from multilingual voice/text input.
    The Gemini API key is never sent to the frontend.
    """
    try:
        from ai_service import generate_ai_explanation

        prompt = f"""You are a government scheme assistant helping a citizen fill their profile.
The citizen spoke in language: {request.language_code}
They are currently answering the question about their "{request.field}".
Their input (may be in any Indian language): "{request.user_input}"
Profile collected so far: {json.dumps(request.collected_so_far)}

Valid states: {json.dumps(VALID_STATES)}
Valid occupations: {json.dumps(VALID_OCCUPATIONS)}

Extract ONLY the "{request.field}" field from the citizen's input.
Return a JSON object with ONLY these keys:
- "extracted": object with the extracted field(s) and their values (use English for string values)
- "needs_clarification": boolean — true only if the answer is genuinely unclear and you cannot extract the field
- "clarification_prompt": string in English — only if needs_clarification is true

Rules:
- For "age": extract an integer (years)
- For "income": extract an integer (annual rupees; convert lakhs/thousands as needed, e.g. "2 lakh" = 200000)
- For "state": match to the closest valid state name
- For "gender": one of "Female", "Male", "Other", "Prefer not to say"
- For "caste": one of "General", "OBC", "SC", "ST", "EWS"
- For "occupation": match to closest valid occupation
- For "student": boolean true/false
- For "farmer": boolean true/false
- Never invent data. If truly unclear, set needs_clarification to true.
- Return ONLY valid JSON, no markdown, no explanation."""

        raw = generate_ai_explanation(prompt)

        # Strip any markdown code fences Gemini might add
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            lines = [l for l in lines if not l.startswith("```")]
            cleaned = "\n".join(lines).strip()

        result = json.loads(cleaned)
        return {"success": True, **result}

    except json.JSONDecodeError:
        return {
            "success": False,
            "needs_clarification": True,
            "clarification_prompt": "Could you please repeat your answer more clearly?",
        }
    except Exception as exc:
        return {
            "success": False,
            "needs_clarification": True,
            "clarification_prompt": "Sorry, I could not understand that. Please try again.",
            "error": str(exc),
        }
