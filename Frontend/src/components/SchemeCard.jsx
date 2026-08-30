import './SchemeCard.css'

function SchemeCard({
  name,
  category,
  benefit,
  whyEligible,
  documents,
  onApply,
}) {
  return (
    <article className="scheme-card">
      <p className="scheme-card-category">{category}</p>
      <h2 className="scheme-card-name">{name}</h2>

      <div className="scheme-card-block">
        <h3>Benefit</h3>
        <p>{benefit}</p>
      </div>

      <div className="scheme-card-block">
        <h3>Why you may be eligible</h3>
        <p>{whyEligible}</p>
      </div>

      <div className="scheme-card-block">
        <h3>Required documents</h3>
        <ul>
          {documents.map((document) => (
            <li key={document}>{document}</li>
          ))}
        </ul>
      </div>

      <button type="button" className="scheme-card-apply" onClick={onApply}>
        Apply Now
      </button>
    </article>
  )
}

export default SchemeCard
