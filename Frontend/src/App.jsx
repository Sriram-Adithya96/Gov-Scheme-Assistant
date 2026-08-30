import { useState } from "react";

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
};

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiExplanations, setAiExplanations] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [error, setError] = useState("");

  // Handle text, number, select and checkbox inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Send citizen information to FastAPI
  const findSchemes = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/check-eligibility",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,

            // Convert string values from HTML inputs into numbers
            age: Number(formData.age),
            income: Number(formData.income),
            disability_percentage: Number(
              formData.disability_percentage
            ),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      setResults(data.eligible_schemes || []);
    } catch (error) {
      console.error("Eligibility API error:", error);

      setError(
        "Unable to connect to the eligibility service. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

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

  // Reset the form and results
  const resetForm = () => {
    setFormData(initialFormData);
    setResults([]);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header>
        <h1>🇮🇳 Government Scheme Assistant</h1>

        <p>
          Find government schemes you may be eligible for
          based on your personal information.
        </p>
      </header>

      <hr />

      {/* CITIZEN FORM */}
      <section>
        <h2>Citizen Information</h2>

        <form onSubmit={findSchemes}>
          {/* Age */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Age</strong>
            </label>
            <br />

            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              min="0"
              required
            />
          </div>

          {/* Income */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Annual Income (₹)</strong>
            </label>
            <br />

            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              placeholder="Example: 180000"
              min="0"
              required
            />
          </div>

          {/* State */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>State</strong>
            </label>
            <br />

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter your state"
              required
            />
          </div>

          {/* Gender */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Gender</strong>
            </label>
            <br />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Category */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Category</strong>
            </label>
            <br />

            <select
              name="caste"
              value={formData.caste}
              onChange={handleChange}
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          {/* Occupation */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Occupation</strong>
            </label>
            <br />

            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            >
              <option value="Student">Student</option>
              <option value="Farmer">Farmer</option>
              <option value="Self Employed">
                Self Employed
              </option>
              <option value="Business Owner">
                Business Owner
              </option>
              <option value="Worker">Worker</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <hr />

          {/* ADDITIONAL INFORMATION */}
          <h3>Additional Information</h3>

          <label>
            <input
              type="checkbox"
              name="student"
              checked={formData.student}
              onChange={handleChange}
            />
            {" "}I am a student
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="farmer"
              checked={formData.farmer}
              onChange={handleChange}
            />
            {" "}I am a farmer
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="owns_land"
              checked={formData.owns_land}
              onChange={handleChange}
            />
            {" "}I own agricultural land
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="income_tax_payer"
              checked={formData.income_tax_payer}
              onChange={handleChange}
            />
            {" "}I am an income-tax payer
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="homeless"
              checked={formData.homeless}
              onChange={handleChange}
            />
            {" "}I need housing assistance / am homeless
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="bpl_family"
              checked={formData.bpl_family}
              onChange={handleChange}
            />
            {" "}I belong to a BPL family
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="pregnant"
              checked={formData.pregnant}
              onChange={handleChange}
            />
            {" "}I am pregnant
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="lactating"
              checked={formData.lactating}
              onChange={handleChange}
            />
            {" "}I am lactating
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="widow"
              checked={formData.widow}
              onChange={handleChange}
            />
            {" "}I am a widow
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="has_bank_account"
              checked={formData.has_bank_account}
              onChange={handleChange}
            />
            {" "}I have a bank account
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="has_lpg_connection"
              checked={formData.has_lpg_connection}
              onChange={handleChange}
            />
            {" "}My household has an LPG connection
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              name="unemployed"
              checked={formData.unemployed}
              onChange={handleChange}
            />
            {" "}I am unemployed
          </label>

          <br />
          <br />

          {/* Disability */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>
                Disability Percentage
              </strong>
            </label>
            <br />

            <input
              type="number"
              name="disability_percentage"
              value={formData.disability_percentage}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>

          {/* BUTTONS */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Finding Schemes..."
              : "🔍 Find My Schemes"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "10px 20px",
            }}
          >
            Reset
          </button>
        </form>
      </section>

      <hr />

      {/* ERROR */}
      {error && (
        <section>
          <p>
            ❌ <strong>{error}</strong>
          </p>
        </section>
      )}

      {/* RESULTS */}
      <section>
        <h2>
          {results.length > 0
            ? `${results.length} Schemes You May Be Eligible For`
            : "Eligible Schemes"}
        </h2>

        {results.length === 0 && !loading && !error && (
          <p>
            Enter your information and click
            <strong> Find My Schemes</strong>.
          </p>
        )}

        {loading && (
          <p>
            🔄 Checking government scheme eligibility...
          </p>
        )}

        {/* SCHEME CARDS */}
        {results.map((scheme) => (
          <div
            key={scheme.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>{scheme.name}</h3>

            <p>
              <strong>Category:</strong>{" "}
              {scheme.category}
            </p>

            <p>
              <strong>Benefit:</strong>{" "}
              {scheme.benefit}
            </p>

            <h4>✅ Why you may be eligible</h4>

            <ul>
              {scheme.reasons?.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>

            <button
              onClick={() => getAIExplanation(scheme.id)}
              disabled={aiLoading[scheme.id]}
            >
              {aiLoading[scheme.id]
                ? "🤖 Generating..."
                : "🤖 Explain with AI"}
            </button>

            {aiExplanations[scheme.id] && (
              <div>
                <h4>🤖 AI Explanation</h4>

                <p>
                  {aiExplanations[scheme.id]}
                </p>

                <small>
                  AI explanation is based on the available
                  scheme information. Verify final eligibility
                  on the official government portal.
                </small>
              </div>
            )}

            <h4>📄 Required Documents</h4>

            <ul>
              {scheme.documents?.map(
                (document, index) => (
                  <li key={index}>{document}</li>
                )
              )}
            </ul>

            <a
              href={scheme.application_link}
              target="_blank"
              rel="noreferrer"
            >
              Apply on Official Website →
            </a>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;