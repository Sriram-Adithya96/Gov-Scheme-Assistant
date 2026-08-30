import { useState } from 'react'
import DocumentUpload from '../components/DocumentUpload.jsx'
import './Application.css'

function Application() {
  const [applied, setApplied] = useState(null)

  return (
    <main className="application">
      <header className="application-header">
        <p className="application-kicker">Application</p>
        <h1 className="application-title">Upload a supporting certificate</h1>
        <p className="application-lead">
          Your PDF is processed securely using Gemini AI to identify the
          document type and extract relevant information. It is not sent to
          translation services.
        </p>
      </header>

      <DocumentUpload onUseInformation={setApplied} />

      {applied ? (
        <aside className="application-applied" aria-live="polite">
          <h2>Using this information</h2>
          <p>
            {applied.fileName} ({applied.certificateType} certificate) will be
            attached to this application draft.
          </p>
        </aside>
      ) : null}
    </main>
  )
}

export default Application
