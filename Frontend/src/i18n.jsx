/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Use the Sarvam-enabled translation service. The existing eligibility API
// remains on port 8000 and is not changed.
const API_URL = 'http://127.0.0.1:8000'
const TranslationContext = createContext(null)
const memoryCache = new Map()
const inFlight = new Map()

export const LANGUAGE_CODES = {
  en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN',
  mr: 'mr-IN', gu: 'gu-IN', bn: 'bn-IN', pa: 'pa-IN', od: 'od-IN', as: 'as-IN',
}

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [revision, setRevision] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)
  const targetLanguage = LANGUAGE_CODES[language] || 'en-IN'

  const prefetch = useCallback(async (texts) => {
    const uniqueTexts = [...new Set(texts.filter(Boolean))]
    if (targetLanguage === 'en-IN' || uniqueTexts.length === 0) return
    const uncached = uniqueTexts.filter((text) => {
      const cacheKey = `${targetLanguage}:${text}`
      return !memoryCache.has(cacheKey) && !inFlight.has(cacheKey)
    })
    if (uncached.length === 0) return

    setPendingRequests((count) => count + uncached.length)
    const requests = uncached.map((text) => {
      const cacheKey = `${targetLanguage}:${text}`
      const request = fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Keep this aligned with the documented, working /translate API.
        body: JSON.stringify({ text, target_language: targetLanguage }),
      })
        .then(async (response) => {
          const data = await response.json()
          if (!response.ok || !data.success || typeof data.translated_text !== 'string') {
            throw new Error(data.message || 'Translation unavailable')
          }
          memoryCache.set(cacheKey, data.translated_text)
        })
        .catch(() => {
          // Leave the cache empty so t() displays English and a later language
          // change can retry after a temporary backend/service failure.
        })
        .finally(() => {
          inFlight.delete(cacheKey)
          setPendingRequests((count) => Math.max(0, count - 1))
          setRevision((current) => current + 1)
        })
      inFlight.set(cacheKey, request)
      return request
    })
    return Promise.all(requests)
  }, [targetLanguage])

  const t = useCallback((text) => {
    void revision
    return memoryCache.get(`${targetLanguage}:${text}`) || text
  }, [revision, targetLanguage])

  const value = useMemo(() => ({
    t,
    prefetch,
    language,
    setLanguage,
    loading: pendingRequests > 0,
  }), [t, prefetch, language, pendingRequests])
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation(texts = []) {
  const context = useContext(TranslationContext)
  if (!context) throw new Error('useTranslation must be used inside TranslationProvider')
  const { prefetch } = context
  const textKey = texts.join('\u0001')
  // textKey changes whenever the actual requested strings change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { prefetch(texts) }, [prefetch, textKey])
  return context
}

export function TranslatedText({ text }) {
  const { t } = useTranslation([text])
  return t(text)
}
