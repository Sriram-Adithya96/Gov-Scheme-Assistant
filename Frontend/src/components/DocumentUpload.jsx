import { useEffect, useState } from 'react'
import './DocumentUpload.css'

const CERTIFICATE_TYPES = [
  { value: 'income', label: 'Income certificate' },
  { value: 'caste', label: 'Caste certificate' },
  { value: 'other', label: 'Other certificate' },
]

const MOCK_EXTRACTED = {
  income: [
    { label: 'Full name', value: 'Priya Sharma' },
    { label: 'Annual income', value: '₹1,80,000' },
    { label: 'Issuing authority', value: 'Tehsildar, Jaipur' },
    { label: 'Valid until', value: '31 March 2027' },
  ],
  caste: [
    { label: 'Full name', value: 'Priya Sharma' },
    { label: 'Category', value: 'OBC' },
    { label: 'Caste', value: 'Yadav' },
    { label: 'Certificate number', value: 'RJ/OBC/2024/18421' },
  ],
  other: [
    { label: 'Document type', value: 'Residence certificate' },
    { label: 'Full name', value: 'Priya Sharma' },
    { label: 'Address', value: 'Ward 12, Jaipur, Rajasthan' },
    { label: 'Issued on', value: '12 January 2026' },
  ],
}

const STATUS_LABEL = {
  idle: 'Waiting for a file',
  uploading: 'Uploading…',
  processing: 'Reading document…',
  ready: 'Extraction complete (sample data)',
}

function DocumentUpload({ onUseInformation }) {
  const [certificateType, setCertificateType] = useState('income')
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('idle')
  const [extracted, setExtracted] = useState(null)
  const [used, setUsed] = useState(false)

  useEffect(() => {
    if (status !== 'uploading' && status !== 'processing') {
      return undefined
    }

    const nextStatus = status === 'uploading' ? 'processing' : 'ready'
    const delay = status === 'uploading' ? 900 : 1200
    const timer = window.setTimeout(() => {
      if (nextStatus === 'ready') {
        setExtracted(MOCK_EXTRACTED[certificateType])
      }
      setStatus(nextStatus)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [status, certificateType])

  function handleTypeChange(event) {
    setCertificateType(event.target.value)
    setFileName('')
    setStatus('idle')
    setExtracted(null)
    setUsed(false)
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setFileName(file.name)
    setExtracted(null)
    setUsed(false)
    setStatus('uploading')
  }

  function handleUseInformation() {
    if (!extracted) {
      return
    }

    setUsed(true)
    onUseInformation?.({
      certificateType,
      fileName,
      fields: extracted,
    })
  }

  return (
    <section className="doc-upload">
      <label className="doc-upload-field">
        <span>Certificate type</span>
        <select value={certificateType} onChange={handleTypeChange}>
          {CERTIFICATE_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="doc-upload-field">
        <span>Upload file</span>
        <input
          key={certificateType}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
      </label>

      <p className={`doc-upload-status is-${status}`} role="status">
        {STATUS_LABEL[status]}
        {fileName ? ` · ${fileName}` : ''}
      </p>

      {extracted ? (
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
          <button
            type="button"
            className="doc-upload-use"
            onClick={handleUseInformation}
            disabled={used}
          >
            {used ? 'Information applied' : 'Use This Information'}
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default DocumentUpload
