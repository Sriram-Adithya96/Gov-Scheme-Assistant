# Government Scheme Eligibility & Application Assistant

An AI-powered web application that helps citizens discover government schemes they may be eligible for, understand why a scheme matches their profile, identify required documents, and get clear guidance for applying.

## 🚀 Project Overview

Finding the right government scheme can be difficult because citizens need to understand eligibility rules, benefits, required documents, and application procedures.

The Government Scheme Eligibility & Application Assistant simplifies this process.

A citizen provides basic information such as:

- Age
- Annual income
- State
- Gender
- Caste / Category
- Occupation
- Student status
- Farmer status

The system checks the citizen's information against government scheme eligibility rules and displays matching schemes.

The application is designed to eventually provide:

- Eligibility checking
- AI-generated eligibility explanations
- Multilingual support
- Document upload and information extraction
- Application guidance

---

# ✨ Features

## 1. Citizen Profile

Citizens can enter their basic information through a mobile-friendly form.

The form includes:

- Age
- Annual income
- State
- Gender
- Caste / Category
- Occupation
- Student status
- Farmer status

---

## 2. Government Scheme Results

The application displays government schemes using reusable scheme cards.

Each scheme card can show:

- Scheme name
- Scheme category
- Benefits
- Eligibility reason
- Required documents
- Official application link

The current frontend uses mock scheme data.

The backend eligibility API will be connected later.

---

## 3. AI Eligibility Explanation

The AI/Data module prepares simple explanations for why a citizen appears to match a government scheme.

Example:

> You may be eligible because you are within the required age range, belong to the required category, and meet the student requirement.

The AI explanation layer does **not** make the final eligibility decision.

The eligibility engine remains responsible for applying the actual government eligibility rules.

The AI is only responsible for explaining the result in simple language.

---

## 4. Multilingual Interface

The frontend includes a language selector supporting:

- English
- Telugu
- Hindi
- Tamil
- Kannada
- Malayalam
- Marathi
- Bengali
- Gujarati
- Punjabi
- Odia
- Assamese

The current prototype stores the selected language in React state.

The interface is prepared for integration with a translation API later.

No full manual translation is currently implemented.

---

## 5. Document Assistance

Citizens can upload documents such as:

- Income certificate
- Caste certificate
- Other certificates

The current implementation is a frontend demonstration.

It provides:

- Document type selection
- File selection
- Uploading status
- Processing status
- Ready status
- Mock extracted information
- "Use This Information" functionality

OCR and real document extraction will be integrated later.

---

# 🏗️ Project Structure

```text
gov-scheme-assistant/
│
├── ai/
│   ├── explanation.py
│   ├── README.md
│   └── prompts/
│       └── eligibility_explanation.txt
│
├── backend/
│   └── main.py
│
├── data/
│   └── schemes.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CitizenForm.jsx
│   │   │   ├── SchemeCard.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   └── DocumentUpload.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Application.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
└── README.md
