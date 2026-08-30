import LanguageSelector from './LanguageSelector.jsx'
import './LanguageSelector.css'
import './Navbar.css'

function Navbar({ language, onLanguageChange, onHome, onBack, backLabel }) {
  return (
    <nav className="navbar">
      <div className="navbar-start">
        <button type="button" className="navbar-brand" onClick={onHome}>
          Scheme Assistant
        </button>
        {onBack ? (
          <button type="button" className="navbar-back" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}
      </div>
      <LanguageSelector value={language} onChange={onLanguageChange} />
    </nav>
  )
}

export default Navbar
