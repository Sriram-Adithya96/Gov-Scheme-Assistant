import { useState } from 'react'
import './Profile.css'

const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say']
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']
const OCCUPATIONS = [
  
  'Unemployed',
  'Salaried employee',
  'Self-employed',
  'Daily wage / labour',
  'Homemaker',
  'Retired',
  'Other',
]

const initialForm = {
  age: '',
  annualIncome: '',
  state: '',
  gender: '',
  caste: '',
  occupation: '',
  student: '',
  farmer: '',
}

function Profile({ onCheckEligibility }) {
  const [form, setForm] = useState(initialForm)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onCheckEligibility?.(form)
  }

  return (
    <main className="profile">
      <header className="profile-header">
        <p className="profile-kicker">Citizen profile</p>
        <h1 className="profile-title">Your details</h1>
        <p className="profile-lead">
          Fill this in so we can match you with government schemes you may
          qualify for.
        </p>
      </header>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-grid">
          <label className="profile-field">
            <span>Age</span>
            <input
              type="number"
              name="age"
              min="0"
              max="120"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 28"
              value={form.age}
              onChange={handleChange}
            />
          </label>

          <label className="profile-field">
            <span>Annual income</span>
            <input
              type="number"
              name="annualIncome"
              min="0"
              step="1000"
              inputMode="numeric"
              autoComplete="off"
              placeholder="₹ e.g. 250000"
              value={form.annualIncome}
              onChange={handleChange}
            />
          </label>

          <label className="profile-field">
            <span>State</span>
            <select name="state" value={form.state} onChange={handleChange}>
              <option value="">Select state</option>
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-field">
            <span>Gender</span>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-field">
            <span>Caste / category</span>
            <select name="caste" value={form.caste} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-field">
            <span>Occupation</span>
            <select
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
            >
              <option value="">Select occupation</option>
              {OCCUPATIONS.map((occupation) => (
                <option key={occupation} value={occupation}>
                  {occupation}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="profile-yesno">
          <fieldset className="profile-choice">
            <legend>Student</legend>
            <label>
              <input
                type="radio"
                name="student"
                value="yes"
                checked={form.student === 'yes'}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="student"
                value="no"
                checked={form.student === 'no'}
                onChange={handleChange}
              />
              No
            </label>
          </fieldset>

          <fieldset className="profile-choice">
            <legend>Farmer</legend>
            <label>
              <input
                type="radio"
                name="farmer"
                value="yes"
                checked={form.farmer === 'yes'}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="farmer"
                value="no"
                checked={form.farmer === 'no'}
                onChange={handleChange}
              />
              No
            </label>
          </fieldset>
        </div>

        <button type="submit" className="profile-submit">
          Check My Eligibility
        </button>
      </form>
    </main>
  )
}

export default Profile
