import SchemeCard from '../components/SchemeCard.jsx'
import './Results.css'

const MOCK_SCHEMES = [
  {
    id: 'mock-1',
    name: 'National Scholarship for Students',
    category: 'Education',
    benefit: 'Up to ₹20,000 per year toward tuition and books.',
    whyEligible:
      'Your profile lists you as a student within the supported age range.',
    documents: ['Aadhaar card', 'Student ID / enrolment proof', 'Bank passbook'],
  },
  {
    id: 'mock-2',
    name: 'Income Support for Small Farmers',
    category: 'Agriculture',
    benefit: '₹6,000 per year, paid in three instalments.',
    whyEligible:
      'Your occupation and farmer status match this scheme’s basic criteria.',
    documents: ['Aadhaar card', 'Land record', 'Bank account details'],
  },
  {
    id: 'mock-3',
    name: 'Family Health Cover',
    category: 'Healthcare',
    benefit: 'Hospitalisation cover of ₹5 lakh per family per year.',
    whyEligible:
      'Household income in your profile is within the scheme’s ceiling.',
    documents: ['Aadhaar card', 'Ration card', 'Income certificate'],
  },
]

function Results({ onApply }) {
  return (
    <main className="results">
      <header className="results-header">
        <p className="results-kicker">Eligibility results</p>
        <h1 className="results-title">Schemes you may qualify for</h1>
        <p className="results-lead">
          Sample matches only. These cards use mock data and are not loaded
          from the live scheme list.
        </p>
      </header>

      <ul className="results-list">
        {MOCK_SCHEMES.map((scheme) => (
          <li key={scheme.id}>
            <SchemeCard
              name={scheme.name}
              category={scheme.category}
              benefit={scheme.benefit}
              whyEligible={scheme.whyEligible}
              documents={scheme.documents}
              onApply={onApply}
            />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Results
