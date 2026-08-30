import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from document_service import analyze_pdf_with_gemini
import main


class FakeResponse:
    def __init__(self, parsed):
        self.parsed = parsed


class FakeModels:
    def __init__(self, parsed):
        self.parsed = parsed

    def generate_content(self, **_kwargs):
        return FakeResponse(self.parsed)


class FakeClient:
    def __init__(self, parsed):
        self.models = FakeModels(parsed)


def gemini_result(document_type, matches, fields):
    return {
        "document_type": document_type,
        "matches_requested_type": matches,
        "confidence": 0.95,
        "fields": {
            "full_name": None,
            "annual_income": None,
            "issuing_authority": None,
            "valid_until": None,
            "certificate_number": None,
            "state": None,
            "caste": None,
            **fields,
        },
    }


class DocumentServiceTests(unittest.TestCase):
    def analyze(self, parsed, certificate_type="income"):
        with patch("document_service.genai.Client", return_value=FakeClient(parsed)):
            return analyze_pdf_with_gemini(b"%PDF-test", certificate_type)

    def test_accepts_income_certificate_and_preserves_missing_nulls(self):
        result = self.analyze(gemini_result("income_certificate", True, {
            "full_name": "Anil Kumar", "annual_income": "Rs. 180,000",
        }))
        self.assertTrue(result["success"])
        self.assertTrue(result["matches_requested_type"])
        self.assertEqual(result["fields"]["annual_income"], "Rs. 180,000")
        self.assertIsNone(result["fields"]["valid_until"])

    def test_rejects_resume_selected_as_income_certificate(self):
        result = self.analyze(gemini_result("resume", False, {"full_name": "Anil Kumar"}))
        self.assertFalse(result["success"])
        self.assertFalse(result["matches_requested_type"])
        self.assertTrue(all(value is None for value in result["fields"].values()))

    def test_rejects_caste_certificate_when_income_was_selected(self):
        result = self.analyze(gemini_result("caste_certificate", False, {"caste": "OBC"}))
        self.assertFalse(result["success"])
        self.assertTrue(all(value is None for value in result["fields"].values()))

    def test_accepts_scanned_caste_certificate_from_gemini(self):
        result = self.analyze(gemini_result("caste_certificate", True, {
            "full_name": "Sana Begum", "caste": "BC-B", "state": "Telangana",
        }), certificate_type="caste")
        self.assertTrue(result["success"])
        self.assertEqual(result["fields"]["caste"], "BC-B")

    def test_rejects_non_pdf_before_calling_gemini(self):
        result = analyze_pdf_with_gemini(b"not a pdf", "income")
        self.assertFalse(result["success"])
        self.assertEqual(result["document_type"], "unknown")

    def test_upload_endpoint_returns_the_structured_response(self):
        expected = gemini_result("income_certificate", True, {"annual_income": "Rs. 75,000"})
        expected.update({"success": True, "message": "Document analyzed successfully."})
        with patch("main.analyze_pdf_with_gemini", return_value=expected):
            response = TestClient(main.app).post(
                "/documents/analyze",
                files={"document": ("income.pdf", b"%PDF-test", "application/pdf")},
                data={"certificate_type": "income"},
            )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["matches_requested_type"])
        self.assertEqual(response.json()["fields"]["annual_income"], "Rs. 75,000")


if __name__ == "__main__":
    unittest.main()
