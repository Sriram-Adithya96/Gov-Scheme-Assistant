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

        # Age check
        if not (
            eligibility["min_age"]
            <= citizen.age
            <= eligibility["max_age"]
        ):
            continue

        # Income check
        if citizen.income > eligibility["max_income"]:
            continue

        # Caste check
        if "allowed_castes" in eligibility:
            if citizen.caste not in eligibility["allowed_castes"]:
                continue

        if "required_caste" in eligibility:
            if citizen.caste != eligibility["required_caste"]:
                continue

        # Gender check
        if "required_gender" in eligibility:
            if citizen.gender.lower() != eligibility["required_gender"].lower():
                continue

        # Occupation check
        if "required_occupation" in eligibility:
            occupations = eligibility["required_occupation"]

            if "Any" not in occupations:
                if citizen.occupation not in occupations:
                    continue

        eligible_schemes.append({
            "id": scheme["id"],
            "name": scheme["name_en"],
            "category": scheme["category"],
            "benefit": scheme["benefit"],
            "documents": scheme["documents_required"],
            "application_link": scheme["application_link"]
        })

    return {
        "count": len(eligible_schemes),
        "eligible_schemes": eligible_schemes
    }