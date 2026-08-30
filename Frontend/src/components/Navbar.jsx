import LanguageSelector from './LanguageSelector.jsx'
import './LanguageSelector.css'
import './Navbar.css'
import { useTranslation } from '../i18n.jsx'

function Navbar({ onHome, onBack, backLabel }) {
  const { t, loading, language, setLanguage } = useTranslation(['Scheme Assistant', 'Translating…', 'Back to home', 'Back to profile', 'Back to results'])
  return (
    <nav className="navbar">
      <div className="navbar-start">
        <button type="button" className="navbar-brand" onClick={onHome}>
          {t('Scheme Assistant')}
        </button>
        {onBack ? (
          <button type="button" className="navbar-back" onClick={onBack}>
            {t(backLabel)}
          </button>
        ) : null}
      </div>
      <LanguageSelector value={language} onChange={setLanguage} loading={loading} />
    </nav>
  )
}

export default Navbar
