import { useState, useEffect, useRef, useCallback } from 'react'
import './VoiceAssistant.css'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'English',    sarvam: 'en-IN', speech: 'en-IN' },
  { code: 'te', label: 'తెలుగు',     sarvam: 'te-IN', speech: 'te-IN' },
  { code: 'hi', label: 'हिन्दी',    sarvam: 'hi-IN', speech: 'hi-IN' },
  { code: 'ta', label: 'தமிழ்',     sarvam: 'ta-IN', speech: 'ta-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ',     sarvam: 'kn-IN', speech: 'kn-IN' },
  { code: 'ml', label: 'മലയാളം',    sarvam: 'ml-IN', speech: 'ml-IN' },
  { code: 'mr', label: 'मराठी',      sarvam: 'mr-IN', speech: 'mr-IN' },
  { code: 'gu', label: 'ગુજરાતી',   sarvam: 'gu-IN', speech: 'gu-IN' },
  { code: 'bn', label: 'বাংলা',     sarvam: 'bn-IN', speech: 'bn-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',    sarvam: 'pa-IN', speech: 'pa-IN' },
  { code: 'od', label: 'ଓଡ଼ିଆ',     sarvam: 'od-IN', speech: 'or-IN' },
  { code: 'as', label: 'অসমীয়া',   sarvam: 'as-IN', speech: 'as-IN' },
]

// Questions in English — will be translated automatically to the user's selected language
const QUESTIONS = [
  { field: 'age',        en: 'What is your age?' },
  { field: 'income',     en: 'What is your approximate annual income in rupees?' },
  { field: 'state',      en: 'Which state do you live in?' },
  { field: 'gender',     en: 'What is your gender? (Male / Female / Other)' },
  { field: 'caste',      en: 'What is your caste or category? (General, OBC, SC, ST, or EWS)' },
  { field: 'occupation', en: 'What is your occupation?' },
  { field: 'student',    en: 'Are you currently a student? (Yes or No)' },
  { field: 'farmer',     en: 'Are you a farmer? (Yes or No)' },
]

const FIELD_LABELS = {
  age:        'Age',
  income:     'Annual Income',
  state:      'State',
  gender:     'Gender',
  caste:      'Caste / Category',
  occupation: 'Occupation',
  student:    'Student',
  farmer:     'Farmer',
}

const API_URL = 'http://127.0.0.1:8000'

// Same list as Profile form
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
]

/** Canonical state → aliases (English, regional, phonetic) */
const STATE_ALIASES = {
  'Andhra Pradesh': [
    'andhra pradesh', 'andhra', 'andhrapradesh', 'आंध्र प्रदेश', 'आन्ध्र प्रदेश',
    'ఆంధ్రప్రదేశ్', 'ఆంధ్ర', 'andhra pradhesh',
  ],
  'Arunachal Pradesh': [
    'arunachal pradesh', 'arunachal', 'arunachalpradesh', 'अरुणाचल प्रदेश', 'అరుణాచల్ ప్రదేశ్',
  ],
  'Assam': ['assam', 'asam', 'असम', 'অসম', 'అస్సాం'],
  'Bihar': ['bihar', 'bihaar', 'बिहार', 'బిహార్'],
  'Chhattisgarh': [
    'chhattisgarh', 'chattisgarh', 'chattisgar', 'छत्तीसगढ़', 'ఛత్తీస్‌గఢ్',
  ],
  'Goa': ['goa', 'गोआ', 'గోవా'],
  'Gujarat': ['gujarat', 'gujrat', 'gujaraat', 'गुजरात', 'ગુજરાત', 'గుజరాత్', 'గుజరాత'],
  'Haryana': ['haryana', 'hariyana', 'हरियाणा', 'హర్యానా'],
  'Himachal Pradesh': [
    'himachal pradesh', 'himachal', 'himachalpradesh', 'हिमाचल प्रदेश', 'హిమాచల్ ప్రదేశ్',
  ],
  'Jharkhand': ['jharkhand', 'jharakhand', 'झारखंड', 'జార్ఖండ్'],
  'Karnataka': [
    'karnataka', 'karnatak', 'karnatka', 'कर्नाटक', 'ಕರ್ನಾಟಕ', 'కర్నాటక', 'కార్నాటక',
  ],
  'Kerala': ['kerala', 'kerela', 'केरल', 'കേരള', 'కేరళ', 'కేరళా'],
  'Madhya Pradesh': [
    'madhya pradesh', 'madhya', 'madhyapradesh', 'मध्य प्रदेश', 'మధ్య ప్రదేశ్',
  ],
  'Maharashtra': [
    'maharashtra', 'maharastra', 'maharashtr', 'महाराष्ट्र', 'महाराष्ट्र', 'మహారాష్ట్ర',
  ],
  'Manipur': ['manipur', 'manipoor', 'मणिपुर', 'మణిపూర్'],
  'Meghalaya': ['meghalaya', 'megalaya', 'मेघालय', 'మేఘాలయ'],
  'Mizoram': ['mizoram', 'mizoraam', 'मिजोरम', 'మిజోరాం'],
  'Nagaland': ['nagaland', 'naagaland', 'नागaland', 'नागालैंड', 'నాగaland', 'నాగాలాండ్'],
  'Odisha': ['odisha', 'orissa', 'ओडिशा', 'उड़ीसा', 'ଓଡ଼ିଶା', 'ఒడిశా'],
  'Punjab': ['punjab', 'panjab', 'पंजाब', 'ਪੰਜਾਬ', 'పంజాబ్'],
  'Rajasthan': ['rajasthan', 'rajastan', 'rajsthan', 'राजस्थान', 'రాజస్థాన్'],
  'Sikkim': ['sikkim', 'sicim', 'सिक्किम', 'సిక్కిం'],
  'Tamil Nadu': [
    'tamil nadu', 'tamilnadu', 'tamil naadu', 'tamilnad', 'तमिलनाडु', 'तमिल नाडु',
    'தமிழ்நாடு', 'తమిళనాడు', 'తమిళ నాడు',
  ],
  'Telangana': [
    'telangana', 'telengana', 'telingana', 'telangna', 'तेलंगाना', 'तेलंगाना',
    'తెలంగాణ', 'తెలంగాణా',
  ],
  'Tripura': ['tripura', 'tripura', 'त्रिपुरा', 'త్రిపుర'],
  'Uttar Pradesh': [
    'uttar pradesh', 'uttarpradesh', 'up', 'उत्तर प्रदेश', 'ఉత్తర ప్రదేశ్', 'uttar pradhesh',
  ],
  'Uttarakhand': [
    'uttarakhand', 'uttaranchal', 'uttarakhand', 'उत्तराखंड', 'ఉత్తరాఖండ్',
  ],
  'West Bengal': [
    'west bengal', 'westbengal', 'bengal', 'पश्चिम बंगाल', 'পশ্চিমবঙ্গ', 'పశ్చిమ బెంగాల్',
  ],
  'Andaman and Nicobar Islands': [
    'andaman', 'andaman and nicobar', 'andaman nicobar', 'अंडमान', 'అండమాన్',
  ],
  'Chandigarh': ['chandigarh', 'chandi garh', 'चंडीगढ़', 'చండీగఢ్'],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'dadra', 'daman', 'diu', 'dadra and nagar haveli', 'daman and diu', 'दादरा', 'దమన్',
  ],
  'Delhi': ['delhi', 'new delhi', 'dilli', 'दिल्ली', 'ఢిల్లీ', 'nct delhi'],
  'Jammu and Kashmir': [
    'jammu and kashmir', 'jammu kashmir', 'jammu', 'kashmir', 'जम्मू कश्मीर', 'జammu kashmir',
  ],
  'Ladakh': ['ladakh', 'ladak', 'लद्दाख', 'లadakh', 'లడ్డాఖ్'],
  'Lakshadweep': ['lakshadweep', 'laccadive', 'लक्षद्वीप', 'లక్షadweep'],
  'Puducherry': ['puducherry', 'pondicherry', 'pondy', 'पुडुचेरी', 'పuducherry', 'పాండిచcherri'],
}

const WORD_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  ek: 1, do: 2, don: 2, teen: 3, char: 4, paanch: 5, panch: 5, chhe: 6, che: 6, saat: 7,
  aath: 8, ath: 8, nau: 9, das: 10, bees: 20, tees: 30, chaalis: 40, pachaas: 50,
  'एक': 1, 'दो': 2, 'दोन': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7,
  'आठ': 8, 'नौ': 9, 'दस': 10, 'बीस': 20, 'तीस': 30, 'चalis': 40,
  'ఒకటి': 1, 'రెండు': 2, 'rendu': 2, 'reudu': 2, 'మూడు': 3, 'నాలుగు': 4, 'అయిదు': 5,
  'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeText(input) {
  return input
    .trim()
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Lowercase Latin letters only — preserves Indic scripts */
function normalizeForMatch(input) {
  return normalizeText(input).replace(/[A-Za-z]/g, (c) => c.toLowerCase())
}

function parseNumberToken(token) {
  if (!token) return null
  const trimmed = token.trim()
  if (WORD_NUMBERS[trimmed] !== undefined) return WORD_NUMBERS[trimmed]
  const lower = trimmed.toLowerCase()
  if (WORD_NUMBERS[lower] !== undefined) return WORD_NUMBERS[lower]
  const digits = trimmed.replace(/[^\d]/g, '')
  if (digits) return parseInt(digits, 10)
  return null
}

function extractFirstNumber(input) {
  const normalized = normalizeForMatch(input)
  const wordMatch = normalized.match(
    /\b(\d{1,3}|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|ek|do|don|teen|char|paanch|panch|bees|tees|chaalis|pachaas|एक|दो|दोन|तीन|चार|पांच|पाँच|बीस|तीस|ఒకటి|రెండు|rendu|reudu|మూడు|నాలుగు|అయిదు|పది)\b/i
  )
  if (wordMatch) {
    const n = parseNumberToken(wordMatch[1])
    if (n !== null && n >= 1 && n <= 120) return n
  }
  const digitMatch = input.match(/(\d{1,3})/)
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10)
    if (n >= 1 && n <= 120) return n
  }
  return null
}

function extractIncome(input) {
  const normalized = normalizeForMatch(input)

  const croreMatch = normalized.match(/(\d+(?:\.\d+)?|[\p{L}\p{M}]+)\s*(?:crore|cr|करोड|కోటి)/iu)
  if (croreMatch) {
    const base = parseNumberToken(croreMatch[1]) ?? parseFloat(croreMatch[1])
    if (base) return Math.round(base * 10000000)
  }

  const lakhMatch = normalized.match(/(\d+(?:\.\d+)?|[\p{L}\p{M}]+)\s*(?:lakh|lac|lakhs|lacs|लाख|लाखों|లక్ష|లక్షలు|lakshalu|laksha)/iu)
  if (lakhMatch) {
    const base = parseNumberToken(lakhMatch[1]) ?? parseFloat(lakhMatch[1])
    if (base) return Math.round(base * 100000)
  }

  const thousandMatch = normalized.match(/(\d+(?:\.\d+)?|[\p{L}\p{M}]+)\s*(?:thousand|k|हजार|हज़ार|వేలు|velu)/iu)
  if (thousandMatch) {
    const base = parseNumberToken(thousandMatch[1]) ?? parseFloat(thousandMatch[1])
    if (base) return Math.round(base * 1000)
  }

  const raw = input.replace(/[,\s₹]/g, '')
  const numMatch = raw.match(/\b(\d{4,9})\b/)
  if (numMatch) return parseInt(numMatch[1], 10)

  return null
}

function extractState(input) {
  const normalized = normalizeForMatch(input)
  if (!normalized) return null

  // Longest alias first so "tamil nadu" wins over "tamil"
  const entries = []
  for (const state of INDIAN_STATES) {
    const aliases = STATE_ALIASES[state] || [state.toLowerCase()]
    for (const alias of aliases) {
      entries.push({ state, alias: normalizeForMatch(alias) })
    }
    entries.push({ state, alias: normalizeForMatch(state) })
  }
  entries.sort((a, b) => b.alias.length - a.alias.length)

  for (const { state, alias } of entries) {
    if (alias && normalized.includes(alias)) return state
  }
  return null
}

/** Local extraction for language name */
function detectLanguage(input) {
  const text = input.trim().toLowerCase()

  if (text.includes('english') || text.includes('ఇంగ్లీష్') || text.includes('अंग्रेजी')) {
    return LANGUAGES.find(l => l.code === 'en')
  }
  if (text.includes('telugu') || text.includes('telgu') || text.includes('తెలుగు')) {
    return LANGUAGES.find(l => l.code === 'te')
  }
  if (text.includes('hindi') || text.includes('हिन्दी') || text.includes('हिंदी')) {
    return LANGUAGES.find(l => l.code === 'hi')
  }
  if (text.includes('tamil') || text.includes('தமிழ்')) {
    return LANGUAGES.find(l => l.code === 'ta')
  }
  if (text.includes('kannada') || text.includes('ಕನ್ನಡ')) {
    return LANGUAGES.find(l => l.code === 'kn')
  }
  if (text.includes('malayalam') || text.includes('മലയാളം')) {
    return LANGUAGES.find(l => l.code === 'ml')
  }
  if (text.includes('marathi') || text.includes('मराठी')) {
    return LANGUAGES.find(l => l.code === 'mr')
  }
  if (text.includes('gujarati') || text.includes('ગુજરાતી')) {
    return LANGUAGES.find(l => l.code === 'gu')
  }
  if (text.includes('bengali') || text.includes('bangla') || text.includes('বাংলা')) {
    return LANGUAGES.find(l => l.code === 'bn')
  }
  if (text.includes('punjabi') || text.includes('ਪੰਜਾਬੀ')) {
    return LANGUAGES.find(l => l.code === 'pa')
  }
  if (text.includes('odia') || text.includes('oriya') || text.includes('ଓଡ଼ିଆ')) {
    return LANGUAGES.find(l => l.code === 'od')
  }
  if (text.includes('assamese') || text.includes('অসমীয়া')) {
    return LANGUAGES.find(l => l.code === 'as')
  }

  for (const lang of LANGUAGES) {
    if (text.includes(lang.label.toLowerCase()) || text.includes(lang.code)) {
      return lang
    }
  }
  return null
}

/** Local extraction for profile questions */
function localExtract(field, input) {
  const text = normalizeForMatch(input)
  const raw = input.trim()

  if (field === 'age') {
    const age = extractFirstNumber(raw)
    if (age !== null) return { age }
  }

  if (field === 'income') {
    const income = extractIncome(raw)
    if (income !== null && income > 0) return { income }
  }

  if (field === 'state') {
    const state = extractState(raw)
    if (state) return { state }
  }

  if (field === 'caste') {
    if (text.includes('general') || text.includes('सामान्य') || text.includes('జనరల్')) return { caste: 'General' }
    if (text.includes('obc') || text.includes('other backward') || text.includes('ओबीसी') || text.includes('ओबीस') || text.includes('ఓబీసీ')) return { caste: 'OBC' }
    if (/\bsc\b/.test(text) || text.includes('scheduled caste') || text.includes('एससी') || text.includes('scheduled caste') || text.includes('ఎస్సీ')) return { caste: 'SC' }
    if (/\bst\b/.test(text) || text.includes('scheduled tribe') || text.includes('एसटी') || text.includes('ఎస్టీ')) return { caste: 'ST' }
    if (text.includes('ews') || text.includes('economically weaker') || text.includes('ईडब्ल्यूएस') || text.includes('ఈడబ్ల్యూఎస్')) return { caste: 'EWS' }
  }

  if (field === 'occupation') {
    if (text.includes('student') || text.includes('छात्र') || text.includes('विद्यार्थी') || text.includes('విద్యార్థి')) return { occupation: 'Student' }
    if (text.includes('farmer') || text.includes('किसान') || text.includes('कृषक') || text.includes('రైతు')) return { occupation: 'Farmer' }
    if (text.includes('unemployed') || text.includes('बेरोजगार') || text.includes('निरुद्योग') || text.includes('నిరుద్యోగ')) return { occupation: 'Unemployed' }
    if (text.includes('salaried') || text.includes('employee') || text.includes('नौकरी') || text.includes('ఉద్యోగి')) return { occupation: 'Salaried employee' }
    if (text.includes('self') || text.includes('business') || text.includes('व्यवसाय') || text.includes('సొంత')) return { occupation: 'Self-employed' }
    if (text.includes('labour') || text.includes('labor') || text.includes('daily') || text.includes('wage') || text.includes('मजदूर') || text.includes('కూలీ')) return { occupation: 'Daily wage / labour' }
    if (text.includes('homemaker') || text.includes('housewife') || text.includes('गृहिणी') || text.includes('గృహిణి')) return { occupation: 'Homemaker' }
    if (text.includes('retired') || text.includes('सेवानिवृत्त') || text.includes('రిటైర్డ్')) return { occupation: 'Retired' }
  }

  if (field === 'student') {
    const yesTerms = ['yes', 'yeah', 'yep', 'ha', 'haa', 'haan', 'han', 'avunu', 'avu', 'awnu', 'हाँ', 'हां', 'अवुन', 'అవును', 'అవు']
    const noTerms = ['no', 'nope', 'ledu', 'ledhu', 'nahi', 'nahin', 'नहीं', 'కాదు', 'kaadu']

    if (yesTerms.some(term => text.includes(term))) return { student: true }
    if (noTerms.some(term => text.includes(term))) return { student: false }
  }

  if (field === 'farmer') {
    const yesTerms = ['yes', 'yeah', 'ha', 'haa', 'haan', 'avunu', 'avu', 'awnu', 'हाँ', 'हां', 'అవును', 'అవు']
    const noTerms = ['no', 'nope', 'ledu', 'ledhu', 'nahi', 'nahin', 'नहीं', 'కాదు', 'kaadu']
    const farmerTerms = ['farmer', 'raitu', 'rait', 'rythu', 'రైతు', 'किसान', 'खेती', 'कृषक', 'krishi']

    if (farmerTerms.some(term => text.includes(term))) return { farmer: true }
    if (yesTerms.some(term => text.includes(term))) return { farmer: true }
    if (noTerms.some(term => text.includes(term))) return { farmer: false }
  }

  if (field === 'gender') {
    const femaleTerms = ['female', 'woman', 'women', 'lady', 'girl', 'mahila', 'mahilaa', 'mahila', 'महिला', 'स्त्री', 'महिला', 'మహిళ', 'స్త్రీ', 'pen', 'pennu']
    const maleTerms = ['male', 'man', 'men', 'boy', 'purush', 'purusa', 'पुरुष', 'पुरूष', 'పురుష', 'పురుషుడు', 'maga', 'magaa', 'మగ']

    if (femaleTerms.some(term => text.includes(term))) return { gender: 'Female' }
    if (maleTerms.some(term => text.includes(term))) return { gender: 'Male' }
    if (text.includes('other') || text.includes('trans') || text.includes('third gender')) return { gender: 'Other' }
  }

  return null
}

/** Translate text via backend translate service */
async function translateText(text, targetSarvam) {
  if (targetSarvam === 'en-IN') return text
  try {
    const res = await fetch(`${API_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_language: targetSarvam }),
    })
    const data = await res.json()
    if (data.success && typeof data.translated_text === 'string') return data.translated_text
  } catch {
    // ignore
  }
  return text
}

/** Display value formatting */
function displayValue(field, value) {
  if (field === 'income') return `₹${Number(value).toLocaleString('en-IN')}`
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

function VoiceAssistant({ onCheckEligibility, onBack }) {
  // ── State ──
  const [stage, setStage] = useState('language') // 'language' | 'questions' | 'summary'
  const [selectedLang, setSelectedLang] = useState(null)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [translatedQuestion, setTranslatedQuestion] = useState('')
  const [translatingQuestion, setTranslatingQuestion] = useState(false)

  const [profile, setProfile] = useState({})
  const [textInput, setTextInput] = useState('')

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')

  const [micAvailable, setMicAvailable] = useState(true)
  const [speechAvailable] = useState(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // 'speaking' | 'listening' | 'processing' | 'waiting'
  const [convState, setConvState] = useState('speaking')

  const recognitionRef = useRef(null)
  const textInputRef = useRef(null)
  const startListeningRef = useRef(null)
  const speakGenRef = useRef(0)
  const isSpeakingRef = useRef(false)
  const isListeningRef = useRef(false)
  const stageRef = useRef(stage)
  const selectedLangRef = useRef(selectedLang)
  const questionIndexRef = useRef(questionIndex)
  const profileRef = useRef(profile)
  const processingRef = useRef(processing)
  const processAnswerRef = useRef(null)
  const processLanguageInputRef = useRef(null)
  const activeAudioRef = useRef(null)

  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { selectedLangRef.current = selectedLang }, [selectedLang])
  useEffect(() => { questionIndexRef.current = questionIndex }, [questionIndex])
  useEffect(() => { profileRef.current = profile }, [profile])
  useEffect(() => { processingRef.current = processing }, [processing])

  /** Pick best TTS voice for locale — always reads fresh voice list */
  function pickVoice(speechLocale) {
    if (!window.speechSynthesis) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return null

    const localeLower = (speechLocale || 'en-IN').toLowerCase()
    const langPrefix = localeLower.split('-')[0]

    return (
      voices.find(v => v.lang.toLowerCase() === localeLower)
      || voices.find(v => v.lang.toLowerCase().startsWith(`${langPrefix}-`))
      || voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
      || null
    )
  }

  // ── Speak with status tracking ──
  const speak = useCallback((text, speechLocale, onEnd) => {
    const locale = speechLocale || 'en-IN'
    const generation = ++speakGenRef.current

    // Abort recognition before speaking to prevent echo/feedback
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }
    isListeningRef.current = false
    setListening(false)

    console.log(`[Voice] Speaking language: ${locale}`)
    console.log(`[Voice] Question: ${text}`)

    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause()
        activeAudioRef.current.src = ''
      } catch { /* ignore */ }
      activeAudioRef.current = null
    }

    const finish = () => {
      if (generation !== speakGenRef.current) return
      isSpeakingRef.current = false
      if (locale === 'te-IN') {
        console.log('[VOICE] Telugu audio finished')
      } else {
        console.log('[Voice] Speech finished')
      }
      setConvState('waiting')
      if (onEnd) {
        if (locale === 'te-IN') {
          console.log('[VOICE] starting microphone')
        }
        onEnd()
      }
    }

    const speakWithBrowserSpeech = (txt, loc) => {
      if (!window.speechSynthesis || !txt?.trim()) {
        isSpeakingRef.current = false
        setConvState('waiting')
        if (onEnd) onEnd()
        return
      }

      window.speechSynthesis.cancel()
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume() } catch { /* ignore */ }
      }

      const utterance = new SpeechSynthesisUtterance(txt)
      utterance.lang = loc
      utterance.rate = 0.92

      const matchedVoice = pickVoice(loc)
      if (matchedVoice) {
        utterance.voice = matchedVoice
        console.log(`[Voice] Using voice: ${matchedVoice.name} (${matchedVoice.lang})`)
      } else {
        console.log(`[Voice] No dedicated voice for ${loc}; using browser default with lang set`)
      }

      utterance.onend = finish
      utterance.onerror = (e) => {
        console.error('[Voice] Speech synthesis error:', e)
        finish()
      }

      setTimeout(() => {
        if (generation !== speakGenRef.current) return
        try {
          window.speechSynthesis.speak(utterance)
          window.speechSynthesis.resume()
        } catch (err) {
          console.error('[Voice] TTS speak failed:', err)
          finish()
        }
      }, 80)
    }

    if (locale === 'te-IN') {
      console.log('[VOICE] language = te-IN')
      console.log('[VOICE] using Sarvam TTS')
      console.log('[VOICE] generating Telugu audio')

      isSpeakingRef.current = true
      setConvState('speaking')

      fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language_code: 'te-IN' })
      })
      .then(res => res.json())
      .then(data => {
        if (generation !== speakGenRef.current) return
        if (data.success && data.base64_audio) {
          console.log('[VOICE] Telugu audio playing')
          const audio = new Audio(`data:audio/wav;base64,${data.base64_audio}`)
          activeAudioRef.current = audio
          audio.onended = () => {
            if (generation !== speakGenRef.current) return
            activeAudioRef.current = null
            finish()
          }
          audio.onerror = (e) => {
            console.error('[Voice] Sarvam audio playback error:', e)
            if (generation !== speakGenRef.current) return
            activeAudioRef.current = null
            finish()
          }
          audio.play().catch(err => {
            console.error('[Voice] Audio play failed:', err)
            finish()
          })
        } else {
          console.error('[Voice] Sarvam TTS failed:', data.message)
          setErrorMsg('Sarvam TTS failed. Falling back to browser speech...')
          speakWithBrowserSpeech(text, locale)
        }
      })
      .catch(err => {
        console.error('[Voice] Sarvam TTS fetch error:', err)
        setErrorMsg('Sarvam TTS error. Falling back to browser speech...')
        speakWithBrowserSpeech(text, locale)
      })

      return
    }

    // Default flow for other languages (English, Hindi)
    isSpeakingRef.current = true
    setConvState('speaking')
    speakWithBrowserSpeech(text, locale)
  }, [])

  // Preload browser TTS voices (Chrome loads asynchronously)
  useEffect(() => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.getVoices()
    const onVoicesChanged = () => window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
  }, [])

  // ── First speech on mount (English welcome message) ──
  useEffect(() => {
    const welcome = "Which language are you comfortable speaking? You can say English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, or Assamese."
    speak(welcome, 'en-IN', () => {
      if (startListeningRef.current) startListeningRef.current()
    })
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      if (activeAudioRef.current) {
        try {
          activeAudioRef.current.pause()
          activeAudioRef.current.src = ''
        } catch { /* ignore */ }
      }
    }
  }, [speak])

  // ── Track current question ──
  const currentQuestion = QUESTIONS[questionIndex]
  const currentQuestionRef = useRef(currentQuestion)
  useEffect(() => { currentQuestionRef.current = currentQuestion }, [currentQuestion])

  // ── Advance Queue ──
  const advanceQuestion = useCallback(() => {
    const nextIndex = questionIndex + 1
    if (nextIndex >= QUESTIONS.length) {
      setStage('summary')
    } else {
      setQuestionIndex(nextIndex)
      setTranscript('')
      setTextInput('')
      setErrorMsg('')
      setInfoMsg('')
    }
  }, [questionIndex])

  // ── Language choice handler ──
  const handleLanguageSelect = useCallback((lang) => {
    speakGenRef.current += 1
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }
    isListeningRef.current = false
    setListening(false)
    setSelectedLang(lang)
    setStage('questions')
    setQuestionIndex(0)
    setProfile({})
    setErrorMsg('')
    setInfoMsg('')
  }, [])

  // ── Language Input Processing ──
  const processLanguageInput = useCallback(async (input) => {
    if (!input.trim()) return
    setProcessing(true)
    setConvState('processing')
    setErrorMsg('')
    setInfoMsg('')

    const lang = detectLanguage(input)
    if (lang) {
      handleLanguageSelect(lang)
      setProcessing(false)
      return
    }

    // Call Gemini extract as fallback for language detection
    try {
      const res = await fetch(`${API_URL}/ai/voice-extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: input,
          language_code: 'en-IN',
          field: 'language',
          collected_so_far: {},
        }),
      })
      const data = await res.json()
      if (data.success && data.extracted && data.extracted.language) {
        const found = detectLanguage(data.extracted.language)
        if (found) {
          handleLanguageSelect(found)
          setProcessing(false)
          return
        }
      }

      // Re-prompt in case of unrecognized language
      const retryText = "Sorry, I didn't recognize that language. Which language are you comfortable speaking?"
      setErrorMsg(retryText)
      speak(retryText, 'en-IN', () => {
        if (startListeningRef.current) startListeningRef.current()
      })
    } catch {
      setErrorMsg('Could not detect language. Please select or type English, Hindi, Telugu etc.')
      setConvState('waiting')
    }
    setProcessing(false)
  }, [handleLanguageSelect, speak])

  // ── Profile Answers Processing ──
  const processAnswer = useCallback(async (input) => {
    if (!input.trim()) return

    setProcessing(true)
    processingRef.current = true
    setConvState('processing')
    setErrorMsg('')
    setInfoMsg('')

    const field = currentQuestionRef.current?.field
    if (!field) {
      setProcessing(false)
      processingRef.current = false
      return
    }

    // 1. Try local extraction
    const local = localExtract(field, input)
    if (local !== null) {
      setProfile((p) => ({ ...p, ...local }))
      setTextInput('')
      setTranscript('')
      setConvState('waiting')
      advanceQuestion()
      setProcessing(false)
      processingRef.current = false
      return
    }

    // 2. Fall back to backend Gemini parser
    try {
      const lang = selectedLangRef.current
      const res = await fetch(`${API_URL}/ai/voice-extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: input,
          language_code: lang?.sarvam || 'en-IN',
          field,
          collected_so_far: profileRef.current,
        }),
      })
      const data = await res.json()

      if (data.needs_clarification || !data.extracted || data.extracted[field] === undefined) {
        const defaultClarification = `Sorry, I didn't understand your ${FIELD_LABELS[field].toLowerCase()}. Please say it again.`
        const clarifyMsg = data.clarification_prompt || defaultClarification
        const translated = await translateText(clarifyMsg, lang?.sarvam || 'en-IN')
        setErrorMsg(translated)
        speak(translated, lang?.speech || 'en-IN', () => {
          if (startListeningRef.current) startListeningRef.current()
        })
      } else {
        setProfile((p) => ({ ...p, ...data.extracted }))
        setTextInput('')
        setTranscript('')
        setConvState('waiting')
        advanceQuestion()
      }
    } catch {
      setErrorMsg('Could not reach the assistant. Please type your answer below.')
      setConvState('waiting')
    }

    setProcessing(false)
    processingRef.current = false
  }, [advanceQuestion, speak])

  // ── Start Speech Recognition ──
  const startListening = useCallback(() => {
    if (!speechAvailable) return
    if (isSpeakingRef.current || window.speechSynthesis?.speaking) {
      console.log('[Voice] Skipping recognition — speech still active')
      return
    }
    if (isListeningRef.current || processingRef.current) return

    setConvState('listening')
    console.log('[Voice] Starting recognition')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = selectedLangRef.current?.speech || 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      isListeningRef.current = true
      setListening(true)
      setTranscript('')
      setErrorMsg('')
      setConvState('listening')
    }

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      setTranscript(result)
      isListeningRef.current = false
      setListening(false)

      if (stageRef.current === 'language') {
        processLanguageInputRef.current?.(result)
      } else {
        processAnswerRef.current?.(result)
      }
    }

    recognition.onerror = (event) => {
      isListeningRef.current = false
      setListening(false)
      setConvState('waiting')
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicAvailable(false)
        setInfoMsg('Microphone access was denied. Please type your answer below.')
      } else if (event.error === 'no-speech') {
        setErrorMsg('No speech detected. Please try again or type your answer.')
        setTimeout(() => {
          if (!isSpeakingRef.current && startListeningRef.current) {
            startListeningRef.current()
          }
        }, 600)
      } else if (event.error !== 'aborted') {
        setErrorMsg(`Speech recognition error: ${event.error}. Please type your answer.`)
      }
    }

    recognition.onend = () => {
      isListeningRef.current = false
      setListening(false)
      setConvState(prev => prev === 'listening' ? 'waiting' : prev)
    }

    try {
      recognition.start()
    } catch (e) {
      console.error('[Voice] Recognition start failed:', e)
      isListeningRef.current = false
      setListening(false)
      setConvState('waiting')
      setErrorMsg('Could not start microphone. Please type your answer below.')
    }
  }, [speechAvailable])

  // ── Assign refs so async speech/recognition callbacks stay fresh ──
  useEffect(() => {
    startListeningRef.current = startListening
  }, [startListening])

  useEffect(() => {
    processAnswerRef.current = processAnswer
  }, [processAnswer])

  useEffect(() => {
    processLanguageInputRef.current = processLanguageInput
  }, [processLanguageInput])

  // ── Translate and speak question when stage changes or question index changes ──
  useEffect(() => {
    if (stage !== 'questions' || !selectedLang || !currentQuestion) return

    let cancelled = false
    setTranslatingQuestion(true)
    setConvState('processing')
    setTranslatedQuestion('')

    const lang = selectedLang

    translateText(currentQuestion.en, lang.sarvam).then((translated) => {
      if (cancelled) return
      setTranslatedQuestion(translated)
      setTranslatingQuestion(false)
      speak(translated, lang.speech, () => {
        if (cancelled) return
        if (startListeningRef.current) {
          startListeningRef.current()
        }
      })
    })

    return () => {
      cancelled = true
      speakGenRef.current += 1
    }
  }, [stage, selectedLang, questionIndex, currentQuestion, speak])

  function stopListening() {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }
    isListeningRef.current = false
    setListening(false)
  }

  // ── Submit Text Form Fallback ──
  function handleTextSubmit(e) {
    e.preventDefault()
    if (!textInput.trim()) return

    if (stage === 'language') {
      processLanguageInput(textInput.trim())
    } else {
      processAnswer(textInput.trim())
    }
  }

  // ── Hand over to existing eligibility engine ──
  function handleCheckEligibility() {
    const profileData = {
      age:          String(profile.age ?? ''),
      annualIncome: String(profile.income ?? ''),
      state:        profile.state ?? '',
      gender:       profile.gender ?? '',
      caste:        profile.caste ?? 'General',
      occupation:   profile.occupation ?? 'Other',
      student:      profile.student === true ? 'yes' : 'no',
      farmer:       profile.farmer === true ? 'yes' : 'no',
    }
    onCheckEligibility?.(profileData)
  }

  const progressPct = stage === 'summary' ? 100 : Math.round((questionIndex / QUESTIONS.length) * 100)

  // ── Render conversation state badge ──
  const renderStatusBadge = () => {
    switch (convState) {
      case 'listening':
        return <span className="va-badge va-badge-listening">🎤 Listening...</span>
      case 'processing':
        return <span className="va-badge va-badge-processing">⏳ Processing...</span>
      case 'speaking':
        return <span className="va-badge va-badge-speaking">🔊 Speaking...</span>
      case 'waiting':
      default:
        return <span className="va-badge va-badge-waiting">✓ Got it</span>
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI Stage: Summary page
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === 'summary') {
    return (
      <main className="va-page">
        <header className="va-header">
          <p className="va-kicker">Voice Assistant</p>
          <h1 className="va-title">✓ Your profile is ready</h1>
          <p className="va-subtitle">Review and check your scheme eligibility</p>
        </header>

        <div className="va-card">
          <p className="va-summary-title">Collected Profile</p>
          <div className="va-summary-grid">
            {QUESTIONS.map(({ field }) => (
              profile[field] !== undefined ? (
                <div key={field} className="va-summary-field">
                  <div className="va-summary-label">{FIELD_LABELS[field]}</div>
                  <div className="va-summary-value">{displayValue(field, profile[field])}</div>
                </div>
              ) : null
            ))}
          </div>

          <div className="va-btn-row">
            <button
              type="button"
              className="va-btn va-btn-primary"
              style={{ flex: 1 }}
              onClick={handleCheckEligibility}
            >
              Check My Schemes →
            </button>
            <button
              type="button"
              className="va-btn va-btn-secondary"
              onClick={() => {
                setStage('language')
                setSelectedLang(null)
                setProfile({})
                setQuestionIndex(0)
                setErrorMsg('')
                setInfoMsg('')
                setConvState('speaking')
                const welcome = "Which language are you comfortable speaking? You can say English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, or Assamese."
                speak(welcome, 'en-IN', () => {
                  if (startListeningRef.current) startListeningRef.current()
                })
              }}
            >
              Start over
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI Stage: Language selection & Questions page
  // ─────────────────────────────────────────────────────────────────────────
  const confirmedFields = Object.keys(profile).filter((k) => profile[k] !== undefined)
  const isLanguageStep = stage === 'language'

  return (
    <main className="va-page">
      <header className="va-header">
        <p className="va-kicker">Voice Assistant {selectedLang && `· ${selectedLang.label}`}</p>
        <h1 className="va-title">
          {isLanguageStep ? '🎤 Talk to Assistant' : '🎤 Tell me about yourself'}
        </h1>
      </header>

      <div className="va-card">
        {/* Progress bar (only for questions) */}
        {!isLanguageStep && (
          <div className="va-progress-bar">
            <div className="va-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        {/* Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          {renderStatusBadge()}
        </div>

        {/* Confirmed fields */}
        {confirmedFields.length > 0 && (
          <div className="va-confirmed-fields" style={{ marginBottom: 18 }}>
            {confirmedFields.map((field) => (
              <span key={field} className="va-field-tag">
                <span className="va-field-tag-check">✓</span>
                {FIELD_LABELS[field]}: {displayValue(field, profile[field])}
              </span>
            ))}
          </div>
        )}

        <div className="va-question-area">
          {/* Assistant Bubble */}
          <div className="va-assistant-bubble">
            <div className="va-avatar">🤖</div>
            <div className="va-bubble-text">
              {isLanguageStep ? (
                "Which language are you comfortable speaking? You can say English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, or Assamese."
              ) : translatingQuestion ? (
                <><span className="va-spinner" /> Translating…</>
              ) : (
                translatedQuestion || currentQuestion?.en
              )}
            </div>
          </div>

          {/* Voice Prompt */}
          {!isLanguageStep && (
            <p className="va-welcome-description" style={{ textAlign: 'center', margin: '8px 0', color: '#625a69', fontSize: '14.5px' }}>
              Just speak naturally — I'll listen automatically.
            </p>
          )}

          {/* Voice status or instructions */}
          {speechAvailable && micAvailable && (
            <div className="va-voice-status">
              {listening ? (
                <><div className="va-mic-pulse" /> Listening… speak now</>
              ) : transcript ? (
                <><div className="va-mic-idle" /> Heard: &ldquo;{transcript}&rdquo;</>
              ) : (
                <><div className="va-mic-idle" /> Just speak naturally — I'll listen automatically.</>
              )}
            </div>
          )}

          {/* Mic fallbacks */}
          {!speechAvailable && (
            <div className="va-info-banner">
              Voice input isn't available in this browser. You can type your answer instead.
            </div>
          )}
          {speechAvailable && !micAvailable && (
            <div className="va-info-banner">
              Microphone access is required for voice input. You can continue by typing below.
            </div>
          )}

          {/* Banners */}
          {errorMsg && <div className="va-error-banner">{errorMsg}</div>}
          {infoMsg && <div className="va-info-banner">{infoMsg}</div>}
          {processing && (
            <div className="va-info-banner">
              <span className="va-spinner" /> Processing...
            </div>
          )}

          {/* Central microphone experience (Voice-First Onboarding UI) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0' }}>
            {speechAvailable && micAvailable && (
              <button
                type="button"
                className={`va-mic-btn-large${listening ? ' listening' : ''}`}
                onClick={listening ? stopListening : startListening}
                disabled={processing || convState === 'speaking'}
                title={listening ? 'Stop listening' : 'Start speaking'}
              >
                🎙️
              </button>
            )}

            {/* Tap to continue listening fallback button */}
            {convState === 'waiting' && speechAvailable && micAvailable && (
              <button
                type="button"
                className="va-btn va-btn-primary va-btn-tap-listening"
                style={{ marginTop: 15 }}
                onClick={startListening}
              >
                Tap to continue listening
              </button>
            )}

            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="va-btn va-btn-secondary"
                onClick={onBack}
                disabled={processing}
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Text Input Fallback (Always present but secondary) */}
          <form onSubmit={handleTextSubmit}>
            <div className="va-text-input-row">
              <input
                ref={textInputRef}
                className="va-text-input"
                type="text"
                placeholder={isLanguageStep ? "Type language (e.g. Telugu, Hindi)..." : "Or type your answer here…"}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={processing}
                aria-label="Type your answer"
              />
              <button
                type="submit"
                className="va-btn va-btn-primary"
                disabled={!textInput.trim() || processing}
              >
                Submit
              </button>
            </div>
          </form>

          {/* Available Languages Hint */}
          {isLanguageStep && (
            <p className="va-hint-text" style={{ fontSize: '12px', color: '#887d94', textAlign: 'center', marginTop: '12px', lineHeight: '1.4' }}>
              Supported: English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, Assamese
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default VoiceAssistant
