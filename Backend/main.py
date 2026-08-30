from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI(title="Government Scheme Assistant")

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
            eligible_schemes.append({
                "id": scheme["id"],
                "name": scheme["name_en"],
                "category": scheme["category"],
                "benefit": scheme["benefit"],
                "documents": scheme["documents_required"],
                "application_link": scheme["application_link"],
                "reasons": reasons
            })

    return {
        "count": len(eligible_schemes),
        "eligible_schemes": eligible_schemes
    }