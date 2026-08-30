const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'Telugu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'od', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
]

function LanguageSelector({ value, onChange, loading = false }) {
  const selected =
    LANGUAGES.find((language) => language.code === value) ?? LANGUAGES[0]

  return (
    <div className="language-selector">
      <label className="language-selector-control">
        <span className="visually-hidden">Language</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </select>
      </label>
      <p className="language-selector-selected" aria-live="polite">
        {loading ? 'Translating…' : `Selected language: ${selected.label}`}
      </p>
    </div>
  )
}

export default LanguageSelector
