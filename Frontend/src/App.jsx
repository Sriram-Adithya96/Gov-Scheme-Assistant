import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Results from "./pages/Results.jsx";
import Application from "./pages/Application.jsx";
import VoiceAssistant from "./pages/VoiceAssistant.jsx";
import { TranslationProvider } from "./i18n.jsx";

const BACK_BY_PAGE = {
  profile: { page: "home", label: "Back to home" },
  voice: { page: "home", label: "Back to home" },
  results: { page: "profile", label: "Back to profile" },
  application: { page: "results", label: "Back to results" },
};

const initialFormData = {
  age: "",
  income: "",
  state: "Telangana",
  gender: "Female",
  caste: "OBC",
  occupation: "Student",

  student: true,
  farmer: false,
  owns_land: false,
  income_tax_payer: false,
  homeless: false,
  bpl_family: false,
  pregnant: false,
  lactating: false,
  widow: false,
  disability_percentage: 0,
  has_bank_account: true,
  has_lpg_connection: false,
  unemployed: false,
  documents_available: [],
};

function App() {
  const [page, setPage] = useState("home");

  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiExplanations, setAiExplanations] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [error, setError] = useState("");

  const back = BACK_BY_PAGE[page];

  // Called when Profile form is submitted
  const handleCheckEligibility = async (profileData) => {
    setLoading(true);
    setError("");
    setResults([]);

    const citizenData = {
      ...formData,
      ...profileData,

      age: Number(profileData.age),
      income: Number(profileData.annualIncome),

      student:
        profileData.student === "yes" ||
        profileData.student === true,

      farmer:
        profileData.farmer === "yes" ||
        profileData.farmer === true,

      owns_land: false,
      income_tax_payer: false,
      homeless: false,
      bpl_family: false,
      pregnant: false,
      lactating: false,
      widow: false,
      disability_percentage: 0,
      has_bank_account: true,
      has_lpg_connection: false,
      unemployed:
        profileData.occupation === "Unemployed",

      documents_available: [],
    };

    setFormData(citizenData);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/check-eligibility",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(citizenData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      setResults(data.eligible_schemes || []);
      setPage("results");
    } catch (error) {
      console.error("Eligibility API error:", error);

      setError(
        "Unable to connect to the eligibility service. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Ask Gemini to explain a scheme
  const getAIExplanation = async (schemeId) => {
    setAiLoading((previous) => ({
      ...previous,
      [schemeId]: true,
    }));

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai/explain?scheme_id=${encodeURIComponent(
          schemeId
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            age: Number(formData.age),
            income: Number(formData.income),
            disability_percentage: Number(
              formData.disability_percentage
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI explanation failed"
        );
      }

      setAiExplanations((previous) => ({
        ...previous,
        [schemeId]: data.explanation,
      }));
    } catch (error) {
      console.error("AI explanation error:", error);

      setAiExplanations((previous) => ({
        ...previous,
        [schemeId]:
          "Unable to generate AI explanation right now.",
      }));
    } finally {
      setAiLoading((previous) => ({
        ...previous,
        [schemeId]: false,
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setResults([]);
    setError("");
    setAiExplanations({});
    setPage("profile");
  };

  let screen = (
    <Home
      onFindSchemes={() => setPage("profile")}
      onTalkToAssistant={() => setPage("voice")}
    />
  );

  if (page === "voice") {
    screen = (
      <VoiceAssistant
        onCheckEligibility={handleCheckEligibility}
        onBack={() => setPage("home")}
      />
    );
  } else if (page === "profile") {
    screen = (
      <Profile
        onCheckEligibility={handleCheckEligibility}
      />
    );
  } else if (page === "results") {
    screen = (
      <Results
        results={results}
        aiExplanations={aiExplanations}
        aiLoading={aiLoading}
        getAIExplanation={getAIExplanation}
        loading={loading}
        error={error}
        onApply={() => setPage("application")}
        onBack={() => setPage("profile")}
        citizenProfile={formData}
      />
    );
  } else if (page === "application") {
    screen = <Application />;
  }

  return (
    <TranslationProvider>
      <Navbar
        onHome={() => setPage("home")}
        onBack={
          back
            ? () => setPage(back.page)
            : undefined
        }
        backLabel={back?.label}
      />

      {screen}
    </TranslationProvider>
  );
}

export default App;
