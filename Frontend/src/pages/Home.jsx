import './Home.css'

function Home({ onFindSchemes }) {
  return (
    <main className="home">
      <p className="home-kicker">Eligibility &amp; application support</p>
      <h1 className="home-title">
        Government Scheme Eligibility &amp; Application Assistant
      </h1>
      <p className="home-description">
        Find government schemes you may qualify for, understand why they match
        your details, and get clear next steps to apply.
      </p>
      <button type="button" className="home-cta" onClick={onFindSchemes}>
        Find My Schemes
      </button>
    </main>
  )
}

export default Home
