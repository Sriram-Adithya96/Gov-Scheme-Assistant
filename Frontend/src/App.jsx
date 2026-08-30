import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Results from './pages/Results.jsx'
import Application from './pages/Application.jsx'

const BACK_BY_PAGE = {
  profile: { page: 'home', label: 'Back to home' },
  results: { page: 'profile', label: 'Back to profile' },
  application: { page: 'results', label: 'Back to results' },
}

function App() {
  const [page, setPage] = useState('home')
  const [language, setLanguage] = useState('en')
  const back = BACK_BY_PAGE[page]

  let screen = <Home onFindSchemes={() => setPage('profile')} />

  if (page === 'profile') {
    screen = <Profile onCheckEligibility={() => setPage('results')} />
  } else if (page === 'results') {
    screen = <Results onApply={() => setPage('application')} />
  } else if (page === 'application') {
    screen = <Application />
  }

  return (
    <>
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onHome={() => setPage('home')}
        onBack={back ? () => setPage(back.page) : undefined}
        backLabel={back?.label}
      />
      {screen}
    </>
  )
}

export default App
