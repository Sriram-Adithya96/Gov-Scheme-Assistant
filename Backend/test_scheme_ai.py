import sys
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from ai.explanation import get_scheme_by_id
from ai_service import generate_scheme_explanation


citizen = {
    "age": 22,
    "annual_income": 180000,
    "state": "Telangana",
    "gender": "Female",
    "caste": "OBC",
    "occupation": "Student"
}


scheme = get_scheme_by_id("SCH001")

if scheme is None:
    print("Scheme not found")
else:
    explanation = generate_scheme_explanation(
        citizen,
        scheme
    )

    print("\n===== AI EXPLANATION =====\n")
    print(explanation)