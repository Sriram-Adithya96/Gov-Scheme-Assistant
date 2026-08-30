"""
Eligibility Explanation Module

This module provides AI-powered explanations for scheme eligibility results.
It will analyze user data against scheme criteria and generate human-readable
explanations for why a user qualifies or doesn't qualify for specific schemes.

Functions:
- load_data(): Load schemes and mock users from JSON
- get_schemes(): Get all available schemes
- get_mock_users(): Get all mock users for testing
- get_scheme_by_id(): Retrieve a scheme by ID
- explain_eligibility(): Generate explanation for scheme eligibility
- get_eligibility_reasons(): Extract reasons for qualification/disqualification
- format_explanation(): Format explanation for frontend display
"""

import json
import os
from pathlib import Path


def load_data():
    """
    Load schemes and mock users from the data/schemes.json file.
    
    Returns:
        Tuple[list, list]: (schemes list, mock_users list)
        
    Raises:
        FileNotFoundError: If the JSON file does not exist
        json.JSONDecodeError: If the JSON file is invalid
        KeyError: If required keys are missing from JSON
    """
    # Get the path to the schemes.json file
    # Assuming ai/explanation.py is in ai/ directory, go up one level to project root
    project_root = Path(__file__).parent.parent
    json_file_path = project_root / "data" / "schemes.json"
    
    # Check if file exists
    if not json_file_path.exists():
        raise FileNotFoundError(f"Schemes data file not found at {json_file_path}")
    
    try:
        # Read and parse the JSON file
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate required keys
        if "schemes" not in data:
            raise KeyError("Missing 'schemes' key in JSON file")
        if "mock_users" not in data:
            raise KeyError("Missing 'mock_users' key in JSON file")
        
        schemes = data["schemes"]
        mock_users = data["mock_users"]
        
        # Validate they are lists
        if not isinstance(schemes, list):
            raise ValueError("'schemes' must be a list")
        if not isinstance(mock_users, list):
            raise ValueError("'mock_users' must be a list")
        
        return schemes, mock_users
    
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(
            f"Invalid JSON in schemes file: {e.msg}",
            e.doc,
            e.pos
        )


def get_schemes():
    """
    Get all available schemes.
    
    Returns:
        list: List of scheme dictionaries
    """
    try:
        schemes, _ = load_data()
        return schemes
    except Exception as e:
        print(f"Error loading schemes: {e}")
        return []


def get_mock_users():
    """
    Get all mock users for testing.
    
    Returns:
        list: List of mock user dictionaries
    """
    try:
        _, mock_users = load_data()
        return mock_users
    except Exception as e:
        print(f"Error loading mock users: {e}")
        return []


def get_scheme_by_id(scheme_id):
    """
    Retrieve a scheme by its ID from the schemes database.
    
    Args:
        scheme_id (str): The unique scheme identifier (e.g., "SCH001")
        
    Returns:
        dict: The complete scheme dictionary if found, None otherwise
    """
    try:
        schemes, _ = load_data()
        for scheme in schemes:
            if scheme.get("id") == scheme_id:
                return scheme
        return None
    except Exception as e:
        print(f"Error retrieving scheme {scheme_id}: {e}")
        return None


def get_eligibility_reasons(user_data, scheme):
    """
    Extract detailed reasons by comparing user data with scheme eligibility criteria.
    
    Returns a list of dictionaries with criterion comparisons. Each dictionary has:
    - criterion: the eligibility field being checked
    - status: "matched", "not_matched", or "unknown"
    - reason: human-readable explanation
    
    This function does NOT make eligibility decisions. It only compares available data.
    
    Args:
        user_data (dict): Dictionary containing user information with keys like:
            - age, annual_income, caste, gender, occupation
        scheme (dict): Dictionary containing scheme data with 'eligibility' key
        
    Returns:
        list: List of dictionaries with criterion, status, and reason
    """
    reasons = []
    eligibility = scheme.get("eligibility", {})
    
    if not eligibility:
        reasons.append({
            "criterion": "scheme_eligibility",
            "status": "unknown",
            "reason": "No eligibility criteria specified for this scheme"
        })
        return reasons
    
    # Age criteria
    user_age = user_data.get("age")
    min_age = eligibility.get("min_age")
    max_age = eligibility.get("max_age")
    
    if user_age is None:
        reasons.append({
            "criterion": "age",
            "status": "unknown",
            "reason": "User age is not provided"
        })
    else:
        if min_age is not None and max_age is not None:
            if min_age <= user_age <= max_age:
                reasons.append({
                    "criterion": "age",
                    "status": "matched",
                    "reason": f"Age {user_age} is within the required range ({min_age}-{max_age} years)"
                })
            else:
                reasons.append({
                    "criterion": "age",
                    "status": "not_matched",
                    "reason": f"Age {user_age} is outside the required range ({min_age}-{max_age} years)"
                })
        elif min_age is not None:
            if user_age >= min_age:
                reasons.append({
                    "criterion": "age",
                    "status": "matched",
                    "reason": f"Age {user_age} meets minimum requirement ({min_age} years)"
                })
            else:
                reasons.append({
                    "criterion": "age",
                    "status": "not_matched",
                    "reason": f"Age {user_age} is below minimum requirement ({min_age} years)"
                })
        elif max_age is not None:
            if user_age <= max_age:
                reasons.append({
                    "criterion": "age",
                    "status": "matched",
                    "reason": f"Age {user_age} is within maximum requirement ({max_age} years)"
                })
            else:
                reasons.append({
                    "criterion": "age",
                    "status": "not_matched",
                    "reason": f"Age {user_age} exceeds maximum requirement ({max_age} years)"
                })
    
    # Income criteria
    user_income = user_data.get("annual_income")
    max_income = eligibility.get("max_income")
    
    if max_income is not None:
        if user_income is None:
            reasons.append({
                "criterion": "income",
                "status": "unknown",
                "reason": "User income is not provided"
            })
        else:
            if user_income <= max_income:
                reasons.append({
                    "criterion": "income",
                    "status": "matched",
                    "reason": f"Income {user_income} is within maximum limit ({max_income})"
                })
            else:
                reasons.append({
                    "criterion": "income",
                    "status": "not_matched",
                    "reason": f"Income {user_income} exceeds maximum limit ({max_income})"
                })
    
    # Caste criteria
    user_caste = user_data.get("caste")
    required_caste = eligibility.get("required_caste")
    allowed_castes = eligibility.get("allowed_castes")
    
    if required_caste is not None:
        if user_caste is None:
            reasons.append({
                "criterion": "caste",
                "status": "unknown",
                "reason": "User caste is not provided"
            })
        else:
            if user_caste == required_caste:
                reasons.append({
                    "criterion": "caste",
                    "status": "matched",
                    "reason": f"Caste '{user_caste}' matches the required caste '{required_caste}'"
                })
            else:
                reasons.append({
                    "criterion": "caste",
                    "status": "not_matched",
                    "reason": f"Caste '{user_caste}' does not match the required caste '{required_caste}'"
                })
    elif allowed_castes is not None:
        if user_caste is None:
            reasons.append({
                "criterion": "caste",
                "status": "unknown",
                "reason": "User caste is not provided"
            })
        else:
            if isinstance(allowed_castes, list):
                if user_caste in allowed_castes:
                    reasons.append({
                        "criterion": "caste",
                        "status": "matched",
                        "reason": f"Caste '{user_caste}' is in the allowed list: {allowed_castes}"
                    })
                else:
                    reasons.append({
                        "criterion": "caste",
                        "status": "not_matched",
                        "reason": f"Caste '{user_caste}' is not in the allowed list: {allowed_castes}"
                    })
    
    # Gender criteria
    user_gender = user_data.get("gender")
    required_gender = eligibility.get("required_gender")
    
    if required_gender is not None:
        if user_gender is None:
            reasons.append({
                "criterion": "gender",
                "status": "unknown",
                "reason": "User gender is not provided"
            })
        else:
            if user_gender == required_gender:
                reasons.append({
                    "criterion": "gender",
                    "status": "matched",
                    "reason": f"Gender '{user_gender}' matches the required gender '{required_gender}'"
                })
            else:
                reasons.append({
                    "criterion": "gender",
                    "status": "not_matched",
                    "reason": f"Gender '{user_gender}' does not match the required gender '{required_gender}'"
                })
    
    # Occupation criteria
    user_occupation = user_data.get("occupation")
    required_occupation = eligibility.get("required_occupation")
    
    if required_occupation is not None:
        if user_occupation is None:
            reasons.append({
                "criterion": "occupation",
                "status": "unknown",
                "reason": "User occupation is not provided"
            })
        else:
            if isinstance(required_occupation, list):
                if "Any" in required_occupation:
                    reasons.append({
                        "criterion": "occupation",
                        "status": "matched",
                        "reason": f"Any occupation is allowed (user has '{user_occupation}')"
                    })
                elif user_occupation in required_occupation:
                    reasons.append({
                        "criterion": "occupation",
                        "status": "matched",
                        "reason": f"Occupation '{user_occupation}' is in the allowed list: {required_occupation}"
                    })
                else:
                    reasons.append({
                        "criterion": "occupation",
                        "status": "not_matched",
                        "reason": f"Occupation '{user_occupation}' is not in the allowed list: {required_occupation}"
                    })
    
    # Special conditions - report as unknown (verification requires external data)
    special_conditions = eligibility.get("special_conditions", [])
    if special_conditions and isinstance(special_conditions, list):
        for condition in special_conditions:
            reasons.append({
                "criterion": "special_condition",
                "status": "unknown",
                "reason": f"Requires verification: {condition}"
            })
    
    return reasons


def explain_eligibility(user_data, scheme):
    """
    Prepare a prompt for AI-based explanation using the scheme eligibility analysis.

    This function does not call any external API. It gathers the structured
    comparison reasons and injects them into the prompt template so the AI can
    generate a citizen-friendly explanation later.

    Args:
        user_data: Dictionary containing user information
        scheme: Dictionary containing scheme eligibility criteria

    Returns:
        Dictionary with the final prompt, derived result, and raw comparison data
    """
    reasons = get_eligibility_reasons(user_data, scheme)

    matched = sum(1 for reason in reasons if reason.get("status") == "matched")
    not_matched = sum(1 for reason in reasons if reason.get("status") == "not_matched")
    unknown = sum(1 for reason in reasons if reason.get("status") == "unknown")

    if not_matched > 0:
        result = "Not eligible based on the available information."
    elif unknown > 0:
        result = "Need additional verification before a final eligibility decision can be made."
    else:
        result = "Likely eligible based on the available information."

    prompt_path = Path(__file__).resolve().parent / "prompts" / "eligibility_explanation.txt"
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt template not found at {prompt_path}")

    with open(prompt_path, "r", encoding="utf-8") as file:
        template = file.read()

    # Keep the prompt readable while still including the exact user and scheme data
    citizen_summary = json.dumps(user_data, ensure_ascii=False, indent=2)
    scheme_summary = json.dumps({
        "id": scheme.get("id"),
        "name_en": scheme.get("name_en"),
        "name_hi": scheme.get("name_hi"),
        "category": scheme.get("category"),
        "benefit": scheme.get("benefit"),
        "eligibility": scheme.get("eligibility", {})
    }, ensure_ascii=False, indent=2)
    reasons_summary = json.dumps(reasons, ensure_ascii=False, indent=2)

    final_prompt = template
    final_prompt = final_prompt.replace("{{citizen}}", citizen_summary)
    final_prompt = final_prompt.replace("{{scheme}}", scheme_summary)
    final_prompt = final_prompt.replace("{{result}}", result)
    final_prompt = final_prompt.replace("{{reasons}}", reasons_summary)

    return {
        "citizen": user_data,
        "scheme": scheme,
        "result": result,
        "reasons": reasons,
        "matched_count": matched,
        "not_matched_count": not_matched,
        "unknown_count": unknown,
        "prompt": final_prompt
    }


def format_explanation(explanation_data):
    """
    Format explanation for frontend display.
    
    Args:
        explanation_data: Raw explanation data
        
    Returns:
        Formatted explanation string
    """
    pass
