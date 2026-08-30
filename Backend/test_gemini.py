from ai_service import generate_ai_explanation


prompt = """
Explain this to an Indian citizen in very simple language.

The citizen is a 22-year-old student.

They may be eligible for a government scholarship.

Explain:
1. Why they may be eligible
2. What benefit they may receive
3. What documents they may need

Do not invent eligibility rules.
Mention that final eligibility must be verified
with the official scheme.
"""


result = generate_ai_explanation(prompt)

print("\n===== GEMINI RESPONSE =====\n")
print(result)