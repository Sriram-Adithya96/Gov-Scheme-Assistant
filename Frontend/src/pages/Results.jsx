import { useState } from 'react'
import SchemeCard from '../components/SchemeCard.jsx'
import './Results.css'
import { useTranslation } from '../i18n.jsx'

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']
const OCCUPATIONS = [
  'Student', 'Unemployed', 'Salaried employee', 'Self-employed',
  'Daily wage / labour', 'Homemaker', 'Retired', 'Other',
]

function createSimulationProfile(profile) {
  return {
    ...profile,
    age: String(profile?.age ?? ''),
    income: String(profile?.income ?? ''),
    state: profile?.state ?? '',
    caste: profile?.caste ?? '',
    occupation: profile?.occupation ?? '',
    student: Boolean(profile?.student),
    farmer: Boolean(profile?.farmer),
  }
}

function Results({
  results,
  aiExplanations,
  aiLoading,
  getAIExplanation,
  loading,
  error,
  onApply,
  onBack,
  citizenProfile,
}) {
  const { t } = useTranslation(['Error', 'Go Back', 'Checking eligibility...', 'Finding your schemes', 'Analyzing your profile against government schemes...', 'Eligibility results', 'No schemes found', 'What if?', 'Explore changes', 'Try different details to see how the matching schemes could change. Your original profile and results will not be changed.', 'Annual income', 'Age', 'State', 'Caste / category', 'Occupation', 'Student', 'Farmer', 'Simulating...', 'Simulate', 'Reset Simulation', 'Simulation results', 'Current:', 'Simulation:', 'eligible schemes', 'Newly eligible', 'No longer eligible', 'Remain eligible', 'No newly eligible schemes.', 'No schemes were removed.', 'No schemes remain eligible.', 'Update Profile'])
  const [simulationProfile, setSimulationProfile] = useState(() =>
    createSimulationProfile(citizenProfile)
  )
  const [simulation, setSimulation] = useState(null)
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationError, setSimulationError] = useState('')

  const updateSimulationProfile = (event) => {
    const { name, value, type, checked } = event.target
    setSimulationProfile((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const simulate = async (event) => {
    event.preventDefault()
    setSimulationLoading(true)
    setSimulationError('')

    const temporaryProfile = {
      ...simulationProfile,
      age: Number(simulationProfile.age),
      income: Number(simulationProfile.income),
      disability_percentage: Number(simulationProfile.disability_percentage || 0),
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(temporaryProfile),
      })
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()
      const simulatedSchemes = data.eligible_schemes || []
      const originalById = new Map(results.map((scheme) => [scheme.id, scheme]))
      const simulatedById = new Map(simulatedSchemes.map((scheme) => [scheme.id, scheme]))

      setSimulation({
        count: simulatedSchemes.length,
        newlyEligible: simulatedSchemes.filter((scheme) => !originalById.has(scheme.id)),
        removed: results.filter((scheme) => !simulatedById.has(scheme.id)),
        unchanged: simulatedSchemes.filter((scheme) => originalById.has(scheme.id)),
      })
    } catch (requestError) {
      console.error('Simulation API error:', requestError)
      setSimulationError('Unable to run the simulation. Make sure the eligibility service is running.')
    } finally {
      setSimulationLoading(false)
    }
  }

  const resetSimulation = () => {
    setSimulationProfile(createSimulationProfile(citizenProfile))
    setSimulation(null)
    setSimulationError('')
  }

  if (error) {
    return (
      <main className="results">
        <header className="results-header">
          <h1 className="results-title">{t('Error')}</h1>
          <p className="results-lead" style={{ color: '#d32f2f' }}>
            {error}
          </p>
        </header>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: '30px',
          }}
        >
          {t('Go Back')}
        </button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="results">
        <header className="results-header">
          <p className="results-kicker">{t('Checking eligibility...')}</p>
          <h1 className="results-title">{t('Finding your schemes')}</h1>
          <p className="results-lead">
            {t('Analyzing your profile against government schemes...')}
          </p>
        </header>
      </main>
    )
  }

  return (
    <main className="results">
      <header className="results-header">
        <p className="results-kicker">{t('Eligibility results')}</p>
        <h1 className="results-title">
          {results.length > 0
            ? `${results.length} scheme${results.length !== 1 ? 's' : ''} you may qualify for`
            : t('No schemes found')}
        </h1>
        <p className="results-lead">
          {results.length > 0
            ? 'These schemes match your profile. Scroll down to see more details and apply now.'
            : "Based on your profile, we couldn't find any matching schemes at this time. You can explore temporary changes below or update your information."}
        </p>
      </header>

      <section className="simulation" aria-labelledby="simulation-title">
        <div className="simulation-heading">
          <p className="results-kicker">{t('What if?')}</p>
          <h2 id="simulation-title">{t('Explore changes')}</h2>
          <p>
            {t('Try different details to see how the matching schemes could change. Your original profile and results will not be changed.')}
          </p>
        </div>

        <form className="simulation-form" onSubmit={simulate}>
          <div className="simulation-grid">
            <label className="simulation-field">
              <span>{t('Annual income')}</span>
              <input type="number" name="income" min="0" step="1000" inputMode="numeric" value={simulationProfile.income} onChange={updateSimulationProfile} required />
            </label>
            <label className="simulation-field">
              <span>{t('Age')}</span>
              <input type="number" name="age" min="0" max="120" inputMode="numeric" value={simulationProfile.age} onChange={updateSimulationProfile} required />
            </label>
            <label className="simulation-field">
              <span>{t('State')}</span>
              <select name="state" value={simulationProfile.state} onChange={updateSimulationProfile} required>
                {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </label>
            <label className="simulation-field">
              <span>{t('Caste / category')}</span>
              <select name="caste" value={simulationProfile.caste} onChange={updateSimulationProfile} required>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="simulation-field">
              <span>{t('Occupation')}</span>
              <select name="occupation" value={simulationProfile.occupation} onChange={updateSimulationProfile} required>
                {OCCUPATIONS.map((occupation) => <option key={occupation} value={occupation}>{occupation}</option>)}
              </select>
            </label>
          </div>
          <div className="simulation-toggles">
            <label><input type="checkbox" name="student" checked={simulationProfile.student} onChange={updateSimulationProfile} /> {t('Student')}</label>
            <label><input type="checkbox" name="farmer" checked={simulationProfile.farmer} onChange={updateSimulationProfile} /> {t('Farmer')}</label>
          </div>
          <div className="simulation-actions">
            <button type="submit" className="simulation-submit" disabled={simulationLoading}>
              {simulationLoading ? t('Simulating...') : t('Simulate')}
            </button>
            <button type="button" className="simulation-reset" onClick={resetSimulation}>{t('Reset Simulation')}</button>
          </div>
        </form>

        {simulationError && <p className="simulation-error" role="alert">{simulationError}</p>}

        {simulation && (
          <div className="simulation-results" aria-live="polite">
            <h3>{t('Simulation results')}</h3>
            <div className="simulation-counts">
              <p><strong>{t('Current:')}</strong> {results.length} {t('eligible schemes')}</p>
              <p><strong>{t('Simulation:')}</strong> {simulation.count} {t('eligible schemes')}</p>
            </div>
            <p className="simulation-summary">
              {simulation.newlyEligible.length > 0
                ? `With this change, you may become eligible for ${simulation.newlyEligible.length} additional scheme${simulation.newlyEligible.length === 1 ? '' : 's'}.`
                : 'With this change, no additional schemes were found.'}
            </p>
            <div className="simulation-lists">
              <SchemeList title={t('Newly eligible')} schemes={simulation.newlyEligible} emptyText={t('No newly eligible schemes.')} />
              <SchemeList title={t('No longer eligible')} schemes={simulation.removed} emptyText={t('No schemes were removed.')} />
              <SchemeList title={t('Remain eligible')} schemes={simulation.unchanged} emptyText={t('No schemes remain eligible.')} />
            </div>
            <p className="simulation-notice">This is a simulation based on the information entered. Verify eligibility with the official scheme authority.</p>
          </div>
        )}
      </section>

      {results.length > 0 ? (
        <ul className="results-list">
          {results.map((scheme) => (
            <li key={scheme.id}>
              <SchemeCard
                scheme={scheme}
                aiExplanation={aiExplanations[scheme.id]}
                aiLoading={aiLoading[scheme.id]}
                onGetAIExplanation={() =>
                  getAIExplanation(scheme.id)
                }
                onApply={onApply}
              />
            </li>
          ))}
        </ul>
      ) : (
        <button className="simulation-reset results-update" type="button" onClick={onBack}>
          {t('Update Profile')}
        </button>
      )}
    </main>
  )
}

function SchemeList({ title, schemes, emptyText }) {
  return (
    <section className="simulation-list">
      <h4>{title} ({schemes.length})</h4>
      {schemes.length > 0 ? (
        <ul>{schemes.map((scheme) => <li key={scheme.id}>{scheme.name}</li>)}</ul>
      ) : <p>{emptyText}</p>}
    </section>
  )
}

export default Results
