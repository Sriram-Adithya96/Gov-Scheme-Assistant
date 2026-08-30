import './SchemeCard.css'

function SchemeCard({
  scheme,
  aiExplanation,
  aiLoading,
  onGetAIExplanation,
  onApply,
}) {
  if (!scheme) return null

  return (
    <article className="scheme-card">
      <p className="scheme-card-category">{scheme.category}</p>
      <h2 className="scheme-card-name">{scheme.name}</h2>

      <div className="scheme-card-block">
        <h3>Benefit</h3>
        <p>{scheme.benefit}</p>
      </div>

      <div className="scheme-card-block">
        <h3>Match Score & Priority</h3>
        <p>
          <strong>Match Score:</strong> {scheme.match_score}/100
        </p>
        <p>
          <strong>Priority:</strong> {scheme.priority}
        </p>
      </div>

      <div className="scheme-card-block">
        <h3>Why you may be eligible</h3>
        {scheme.reasons && scheme.reasons.length > 0 ? (
          <ul>
            {scheme.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p>No specific reasons available</p>
        )}
      </div>

      <div className="scheme-card-block">
        <h3>Application Readiness</h3>
        <p>
          <strong>Document Readiness:</strong>{' '}
          {scheme.application_readiness}%
        </p>
        {scheme.missing_documents &&
          scheme.missing_documents.length > 0 && (
            <div>
              <strong>Missing Documents:</strong>
              <ul>
                {scheme.missing_documents.map(
                  (doc, idx) => (
                    <li key={idx}>{doc}</li>
                  )
                )}
              </ul>
            </div>
          )}
      </div>

      <div className="scheme-card-block">
        <h3>Required documents</h3>
        {scheme.documents && scheme.documents.length > 0 ? (
          <ul>
            {scheme.documents.map((document, idx) => (
              <li key={idx}>{document}</li>
            ))}
          </ul>
        ) : (
          <p>No documents specified</p>
        )}
      </div>

      <button
        type="button"
        className="scheme-card-ai"
        onClick={onGetAIExplanation}
        disabled={aiLoading}
      >
        {aiLoading ? '🤖 Generating...' : '🤖 Explain with AI'}
      </button>

      {aiExplanation && (
        <div className="scheme-card-block ai-explanation">
          <h3>🤖 AI Explanation</h3>
          <p>{aiExplanation}</p>
          <small>
            AI explanation is based on the available scheme
            information. Verify final eligibility on the
            official government portal.
          </small>
        </div>
      )}

      {scheme.application_link && (
        <a
          href={scheme.application_link}
          target="_blank"
          rel="noreferrer"
          className="scheme-card-apply"
        >
          Apply on Official Website →
        </a>
      )}

      {onApply && (
        <button
          type="button"
          className="scheme-card-apply"
          onClick={onApply}
        >
          Apply Now
        </button>
      )}
    </article>
  )
}

export default SchemeCard
