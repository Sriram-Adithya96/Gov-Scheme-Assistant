# AI Explanation Module

This module is responsible for turning raw scheme eligibility data into plain-language explanations for citizens. It reads scheme and mock-user data from the project dataset, compares a user's profile against each scheme criterion, and prepares a clean prompt that can later be passed to an LLM for final wording.

## What it does

- Loads scheme and mock-user data from `data/schemes.json`
- Finds a scheme by its `id`
- Compares user information such as age, income, caste, gender, and occupation to eligibility rules
- Returns structured reason entries with statuses like `matched`, `not_matched`, and `unknown`
- Builds an AI-ready prompt using the prompt template in `ai/prompts/eligibility_explanation.txt`
- Keeps the logic separate from the actual AI API call so the backend can integrate it later without hard-coding model logic

## Files

- **explanation.py**: Main module for loading data, comparing eligibility, and preparing AI prompts
- **prompts/eligibility_explanation.txt**: Template used to generate a citizen-friendly explanation prompt
- **README.md**: Documentation for this module

## How to run it

From the project root:

```bash
cd /Users/m.saikarthikeya/gov-scheme-assistant
python3
```

Then in Python:

```python
from ai.explanation import explain_eligibility, get_mock_users, get_scheme_by_id

user = get_mock_users()[0]
scheme = get_scheme_by_id("SCH001")
result = explain_eligibility(user, scheme)

print(result["result"])
print(result["prompt"])
```

This prepares the final prompt but does not call an external AI API yet.

## FastAPI backend integration

A FastAPI endpoint can later import this module and use it like this:

```python
from ai.explanation import explain_eligibility

@app.post("/explain-eligibility")
def explain_eligibility_route(user: dict, scheme_id: str):
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        return {"error": "Scheme not found"}

    explanation = explain_eligibility(user, scheme)
    return {
        "result": explanation["result"],
        "reasons": explanation["reasons"],
        "prompt": explanation["prompt"]
    }
```

This keeps the AI explanation flow modular: the backend can call the eligibility comparison logic and then send the generated prompt to an LLM or another service when ready.
