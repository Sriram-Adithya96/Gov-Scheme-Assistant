def check_scheme_eligibility(citizen, scheme):
    eligibility = scheme["eligibility"]

    # 1. Age check
    if not (
        eligibility["min_age"]
        <= citizen["age"]
        <= eligibility["max_age"]
    ):
        return False

    # 2. Income check
    if citizen["income"] > eligibility["max_income"]:
        return False

    # 3. Caste check
    if "allowed_castes" in eligibility:
        if citizen["caste"] not in eligibility["allowed_castes"]:
            return False

    if "required_caste" in eligibility:
        if citizen["caste"] != eligibility["required_caste"]:
            return False

    # 4. Gender check
    if "required_gender" in eligibility:
        if citizen["gender"].lower() != eligibility["required_gender"].lower():
            return False

    # 5. Occupation check
    if "required_occupation" in eligibility:
        occupations = eligibility["required_occupation"]

        if "Any" not in occupations:
            if citizen["occupation"] not in occupations:
                return False

    return True