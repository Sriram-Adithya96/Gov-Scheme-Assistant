import re


def _matches_allowed_value(value, allowed_values):
    """Return whether a value satisfies a scalar/list rule, including Any."""
    if not isinstance(allowed_values, list):
        allowed_values = [allowed_values]

    return any(
        str(allowed).lower() == "any"
        or str(value).lower() == str(allowed).lower()
        for allowed in allowed_values
    )


def _matches_required_boolean(citizen, eligibility, attribute):
    """Apply required_<attribute> only when that JSON key is present."""
    rule_name = f"required_{attribute}"
    return (
        rule_name not in eligibility
        or bool(citizen.get(attribute, False)) == eligibility[rule_name]
    )


def _matches_dataset_special_conditions(citizen, conditions):
    """Evaluate only special-condition phrases present in the current dataset."""
    for condition in conditions:
        condition_lower = condition.lower()

        if "own cultivable land" in condition_lower and not citizen.get("owns_land", False):
            return False
        if "land record or tenant certificate" in condition_lower and not citizen.get("owns_land", False):
            return False
        if "not an income tax payer" in condition_lower and citizen.get("income_tax_payer", False):
            return False
        if "homeless" in condition_lower and not citizen.get("homeless", False):
            return False
        if "bpl family" in condition_lower and not citizen.get("bpl_family", False):
            return False
        if (
            "studying in" in condition_lower
            or "enrolled in educational institution" in condition_lower
        ) and not citizen.get("student", False):
            return False
        if "pregnant or lactating" in condition_lower:
            if not (citizen.get("pregnant", False) or citizen.get("lactating", False)):
                return False
        elif "pregnant" in condition_lower and not citizen.get("pregnant", False):
            return False
        elif "lactating" in condition_lower and not citizen.get("lactating", False):
            return False
        if "must be a widow" in condition_lower and not citizen.get("widow", False):
            return False
        if "no existing lpg connection" in condition_lower and citizen.get("has_lpg_connection", False):
            return False
        if (
            "savings bank account" in condition_lower
            or "aadhaar-linked bank account" in condition_lower
        ) and not citizen.get("has_bank_account", False):
            return False
        if "disability" in condition_lower:
            required_percentage = re.search(r"(\d+)%", condition_lower)
            if (
                required_percentage
                and citizen.get("disability_percentage", 0)
                < int(required_percentage.group(1))
            ):
                return False
        if "resident of mp" in condition_lower and not _matches_allowed_value(
            citizen.get("state", ""), ["MP", "Madhya Pradesh"]
        ):
            return False

    return True


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
    if "allowed_castes" in eligibility and not _matches_allowed_value(
        citizen["caste"], eligibility["allowed_castes"]
    ):
        return False

    if "required_caste" in eligibility and not _matches_allowed_value(
        citizen["caste"], eligibility["required_caste"]
    ):
        return False

    # 4. Gender check
    if "required_gender" in eligibility and not _matches_allowed_value(
        citizen["gender"], eligibility["required_gender"]
    ):
        return False

    # 5. Occupation check
    if "required_occupation" in eligibility and not _matches_allowed_value(
        citizen["occupation"], eligibility["required_occupation"]
    ):
        return False

    # 6. Optional structured rules. They apply only when a scheme includes them.
    for attribute in (
        "student",
        "farmer",
        "owns_land",
        "income_tax_payer",
        "homeless",
        "bpl_family",
        "pregnant",
        "lactating",
        "widow",
        "has_bank_account",
        "has_lpg_connection",
        "unemployed",
    ):
        if not _matches_required_boolean(citizen, eligibility, attribute):
            return False

    if "required_state" in eligibility and not _matches_allowed_value(
        citizen.get("state", ""), eligibility["required_state"]
    ):
        return False

    disability_percentage = citizen.get("disability_percentage", 0)
    if (
        "min_disability_percentage" in eligibility
        and disability_percentage < eligibility["min_disability_percentage"]
    ):
        return False
    if (
        "max_disability_percentage" in eligibility
        and disability_percentage > eligibility["max_disability_percentage"]
    ):
        return False

    # 7. Current dataset rules are stored in special_conditions.
    if not _matches_dataset_special_conditions(
        citizen, eligibility.get("special_conditions", [])
    ):
        return False

    return True
