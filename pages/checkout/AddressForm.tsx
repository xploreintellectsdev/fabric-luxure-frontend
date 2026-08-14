import React, { useState } from 'react'
import toast from 'react-hot-toast'

const COUNTRIES = [
  { id: 'in', label: 'India', prefix: '+91' },
  { id: 'us', label: 'United States', prefix: '+1' },
  { id: 'gb', label: 'United Kingdom', prefix: '+44' },
  { id: 'ae', label: 'UAE', prefix: '+971' },
  { id: 'au', label: 'Australia', prefix: '+61' }
]

export default function AddressForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    countryId: 'in', // Defaults to India key matching COUNTRIES array
    saveForNextTime: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Find active metadata based on state configuration tracking
  const currentCountry = COUNTRIES.find(c => c.id === formData.countryId) || COUNTRIES[0]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Core structural validations
    if (!formData.phone || !formData.firstName || !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Please fill out all required fields.')
      return
    }

    // Combine prefix and input string safely for the data model
    const fullPhoneNumber = `${currentCountry.prefix} ${formData.phone.trim()}`

    const newAddressItem = {
      id: `addr-${Date.now()}`,
      phone: fullPhoneNumber,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      line1: formData.apartment ? `${formData.address}, ${formData.apartment}` : formData.address,
      cityState: `${formData.city}, ${formData.state || 'Tamil Nadu'}`,
      postalCountry: `${formData.postalCode}, ${currentCountry.label}`
    }

    onSave(newAddressItem)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto lg:mx-0 text-[#2C2A29] font-sans antialiased text-left flex flex-col gap-4">
      
      {/* SECTION HEADER */}
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-[#2C2A29]">
        Add New Address
      </h3>

      {/* PHONE INPUT WITH ADAPTIVE PREFIX & FLAG */}
      <div className="flex border border-[#EBE3D5] rounded-md bg-[#FAF4EB] focus-within:border-[#A8793E] transition-colors overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 border-r border-[#EBE3D5] bg-[#FAF4EB] min-w-[70px] justify-center select-none">
          <img 
            src={`https://flagcdn.com/w20/${currentCountry.id}.png`} 
            alt={`${currentCountry.label} Flag`} 
            className="w-4 h-auto object-contain shadow-xs"
          />
          <span className="text-xs text-[#4E4B49] font-medium">{currentCountry.prefix}</span>
        </div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none"
          required
        />
      </div>

      {/* FIRST & LAST NAME GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First name"
          className="w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none focus:border-[#A8793E] transition-colors"
          required
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last name"
          className="w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none focus:border-[#A8793E] transition-colors"
        />
      </div>

      {/* ADDRESS LINE 1 */}
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        className="w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none focus:border-[#A8793E] transition-colors"
        required
      />

      {/* APARTMENT / SUITE */}
      <input
        type="text"
        name="apartment"
        value={formData.apartment}
        onChange={handleChange}
        placeholder="Apartment, Suite, etc. (optional)"
        className="w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none focus:border-[#A8793E] transition-colors"
      />

      {/* CITY & STATE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none focus:border-[#A8793E] transition-colors"
          required
        />
        <div className="relative w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] text-left focus-within:border-[#A8793E] transition-colors">
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full bg-transparent appearance-none px-4 py-3 text-xs sm:text-sm text-[#4E4B49] outline-none cursor-pointer pr-10"
          >
            <option value="">State</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Other">Other Region</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#4E4B49]/70">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* POSTAL CODE & DRIVEN COUNTRY DROPDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          placeholder="Postal code"
          className="w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] px-4 py-3 text-xs sm:text-sm placeholder-[#4E4B49]/50 text-[#2C2A29] outline-none focus:border-[#A8793E] transition-colors"
          required
        />
        <div className="relative w-full border border-[#EBE3D5] rounded-md bg-[#FAF4EB] text-left focus-within:border-[#A8793E] transition-colors">
          <select
            name="countryId"
            value={formData.countryId}
            onChange={handleChange}
            className="w-full bg-transparent appearance-none px-4 py-3 text-xs sm:text-sm text-[#4E4B49] font-medium outline-none cursor-pointer pr-10"
          >
            {COUNTRIES.map((country) => (
              <option key={country.id} value={country.id}>
                {country.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#4E4B49]/70">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* REMEMBER CHECKBOX */}
      <label className="flex items-center gap-3 cursor-pointer mt-1 select-none">
        <input
          type="checkbox"
          name="saveForNextTime"
          checked={formData.saveForNextTime}
          onChange={handleChange}
          className="accent-[#A8793E] h-3.5 w-3.5 border-[#EBE3D5] rounded focus:ring-0"
        />
        <span className="text-[11px] text-[#4E4B49] tracking-normal font-medium">
          Save this information for next time
        </span>
      </label>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          type="submit"
          className="w-full bg-[#A8793E] hover:bg-[#916531] text-light text-xs font-semibold uppercase tracking-widest py-4 px-6 rounded-md transition-colors duration-200 cursor-pointer shadow-sm text-center"
        >
          Add Address
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-transparent hover:bg-[#FAF4EB] text-[#4E4B49] border border-[#E6DDD0] text-xs font-medium uppercase tracking-widest py-4 px-6 rounded-md transition-colors duration-200 cursor-pointer text-center"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
