import { useState } from 'react'
import './DocumentUpload.css'

const CERTIFICATE_TYPES = [
  { value: 'income', label: 'Income certificate' },
  { value: 'caste', label: 'Caste certificate' },
  { value: 'other', label: 'Other certificate' },
]

const FIELD_LABELS = {
  full_name: 'Full name',
  annual_income: 'Annual income',
  issuing_authority: 'Issuing authority',
  valid_until: 'Valid until',
  certificate_number: 'Certificate number',
  state: 'State',
  caste: 'Caste',
}

const STATUS_LABEL = {
  idle: 'Waiting for a file',
  processing: 'Analyzing document...',
  ready: 'Document analyzed successfully.',
}

function DocumentUpload({ onUseInformation }) {
  const [certificateType, setCertificateType] = useState('income')
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [extracted, setExtracted] = useState(null)
  const [used, setUsed] = useState(false)

  function handleTypeChange(event) {
    setCertificateType(event.target.value)
    setFileName('')
    setStatus('idle')
    setMessage('')
    setExtracted(null)
    setUsed(false)
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    event.target.value = ''
    setFileName(file.name)
    setExtracted(null)
    setUsed(false)
    setMessage('')
    setStatus('processing')

    const formData = new FormData()
    formData.append('certificate_type', certificateType)
    formData.append('document', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/documents/analyze', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      const fields = Object.entries(data.fields || {})
        .filter(([, value]) => value !== null && value !== '')
        .map(([key, value]) => ({ label: FIELD_LABELS[key] || key, value }))

      if (!response.ok || !data.success) {
        setStatus('error')
        setMessage(data.message || 'Document type could not be verified.')
        return
      }

      setExtracted(fields)
      setStatus('ready')
      setMessage(data.message || STATUS_LABEL.ready)
    } catch {
      setStatus('error')
      setMessage('Document type could not be verified.')
    }
  }

  function handleUseInformation() {
    if (!extracted?.length) return

    setUsed(true)
    onUseInformation?.({ certificateType, fileName, fields: extracted })
  }

  return (
    <section className="doc-upload">
      <label className="doc-upload-field">
        <span>Certificate type</span>
        <select value={certificateType} onChange={handleTypeChange}>
          {CERTIFICATE_TYPES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="doc-upload-field">
        <span>Upload PDF</span>
        <input
          key={certificateType}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
        />
      </label>

      <p className={`doc-upload-status is-${status}`} role="status">
        {status === 'error' ? <strong>Document type could not be verified. </strong> : null}
        {message || STATUS_LABEL[status]}
        {fileName ? ` · ${fileName}` : ''}
      </p>

      {extracted?.length ? (
        <div className="doc-upload-result">
          <h3>Extracted information</h3>
          <dl>
            {extracted.map((field) => (
              <div key={field.label} className="doc-upload-row">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className="doc-upload-use" onClick={handleUseInformation} disabled={used}>
            {used ? 'Information applied' : 'Use This Information'}
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default DocumentUpload
