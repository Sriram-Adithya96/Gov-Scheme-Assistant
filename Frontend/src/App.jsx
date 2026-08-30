import { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
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
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const findSchemes = async () => {
    setLoading(true);

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
            age: Number(formData.age),
            income: Number(formData.income),
            disability_percentage: Number(
              formData.disability_percentage
            ),
          }),
        }
      );

      const data = await response.json();

      setResults(data.eligible_schemes);
    } catch (error) {
      console.error(error);
      alert("Could not connect to the backend.");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Government Scheme Assistant</h1>

      <h2>Find Schemes You May Be Eligible For</h2>

      <div>
        <label>Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Annual Income</label>
        <input
          type="number"
          name="income"
          value={formData.income}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>
      </div>

      <div>
        <label>Category</label>
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

      <div>
        <label>Occupation</label>
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
        />
      </div>

      <button onClick={findSchemes}>
        {loading ? "Finding Schemes..." : "Find My Schemes"}
      </button>

      <hr />

      <h2>Eligible Schemes</h2>

      {results.length === 0 ? (
        <p>No schemes found yet.</p>
      ) : (
        results.map((scheme) => (
          <div key={scheme.id}>
            <h3>{scheme.name}</h3>

            <p>
              <strong>Category:</strong> {scheme.category}
            </p>

            <p>
              <strong>Benefit:</strong> {scheme.benefit}
            </p>

            <h4>Why you may be eligible:</h4>

            <ul>
              {scheme.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>

            <h4>Documents:</h4>

            <ul>
              {scheme.documents.map((document, index) => (
                <li key={index}>{document}</li>
              ))}
            </ul>

            <a
              href={scheme.application_link}
              target="_blank"
              rel="noreferrer"
            >
              Official Application
            </a>
          </div>
        ))
      )}
    </div>
  );
}

export default App;