import './Home.css'
import { useTranslation } from '../i18n.jsx'

function Home({ onFindSchemes }) {
  const translationTexts = [
    'Eligibility & application support', 'Government Scheme Eligibility & Application Assistant',
    'Find government schemes you may qualify for, understand why they match your details, and get clear next steps to apply.',
    'Find My Schemes',
    'Personalized Matching', 'Find schemes based on your profile.',
    'AI-Powered Explanations', 'Understand why a scheme matches you.',
    'Document Readiness', 'Know what documents you need before applying.',
    'What-If Simulation', 'See how changes in your situation affect eligibility.',
    '12+ Indian Languages', 'Access the assistant in your preferred language.',
    'How it works',
    'Create your profile', 'Tell us about your age, income, location and other details.',
    'Check eligibility', 'Our eligibility engine matches your profile with government schemes.',
    'Understand & apply', 'See why you match, check documents, get an AI explanation and apply.',
    'More than a scheme directory',
    'Get personalized matches, understand your eligibility, check document readiness, explore what-if scenarios, and access the assistant in Indian languages.',
    'Eligibility results are based on available scheme information. Always verify final eligibility on the official government portal.',
  ]
  const { t, language } = useTranslation(translationTexts)

  const features = [
    ['◎', 'Personalized Matching', 'Find schemes based on your profile.'],
    ['✦', 'AI-Powered Explanations', 'Understand why a scheme matches you.'],
    ['▤', 'Document Readiness', 'Know what documents you need before applying.'],
    ['↺', 'What-If Simulation', 'See how changes in your situation affect eligibility.'],
    ['अ', '12+ Indian Languages', 'Access the assistant in your preferred language.'],
  ]

  const steps = [
    ['01', 'Create your profile', 'Tell us about your age, income, location and other details.'],
    ['02', 'Check eligibility', 'Our eligibility engine matches your profile with government schemes.'],
    ['03', 'Understand & apply', 'See why you match, check documents, get an AI explanation and apply.'],
  ]

  return (
    <main className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="home-kicker">{t('Eligibility & application support')}</p>
        <h1 className="home-title" id="home-title" key={language}>
          {t('Government Scheme Eligibility & Application Assistant')}
        </h1>
        <p className="home-description">
          {t('Find government schemes you may qualify for, understand why they match your details, and get clear next steps to apply.')}
        </p>
        <button type="button" className="home-cta" onClick={onFindSchemes}>
          {t('Find My Schemes')} <span aria-hidden="true">→</span>
        </button>
      </section>

      <section className="home-features" aria-label="Assistant benefits">
        {features.map(([icon, title, description]) => (
          <article className="home-feature" key={title}>
            <span className="home-feature-icon" aria-hidden="true">{icon}</span>
            <h2>{t(title)}</h2>
            <p>{t(description)}</p>
          </article>
        ))}
      </section>

      <section className="home-how" aria-labelledby="how-it-works">
        <h2 className="home-section-title" id="how-it-works">{t('How it works')}</h2>
        <div className="home-steps">
          {steps.map(([number, title, description]) => (
            <article className="home-step" key={number}>
              <span className="home-step-number">{number}</span>
              <h3>{t(title)}</h3>
              <p>{t(description)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-highlight" aria-labelledby="directory-heading">
        <div>
          <p className="home-highlight-label">{t('Eligibility & application support')}</p>
          <h2 id="directory-heading">{t('More than a scheme directory')}</h2>
        </div>
        <p>{t('Get personalized matches, understand your eligibility, check document readiness, explore what-if scenarios, and access the assistant in Indian languages.')}</p>
      </section>

      <p className="home-disclaimer">
        {t('Eligibility results are based on available scheme information. Always verify final eligibility on the official government portal.')}
      </p>
    </main>
  )
}

export default Home
