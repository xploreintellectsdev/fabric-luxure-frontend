import React, { useState } from 'react'
import ShippingMethod from './ShippingMethod'

// Array matching standard ISO codes for dynamic image mapping from EditAddressModal
const countryList = [
  { id: 'in', code: 'IN', label: 'India', dialCode: '+91' },
  { id: 'us', code: 'US', label: 'United States', dialCode: '+1' },
  { id: 'gb', code: 'UK', label: 'United Kingdom', dialCode: '+44' },
  { id: 'ae', code: 'AE', label: 'UAE', dialCode: '+971' }
]

function NewContactForm() {
  const [selectedCountry, setSelectedCountry] = useState(countryList[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [phoneVal, setPhoneVal] = useState('')

  const handleSelectCountry = (country) => {
    setSelectedCountry(country)
    setIsDropdownOpen(false)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        
        {/* Email Entry Field Area */}
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-semibold text-charcoal tracking-wide">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
          />
          <label className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer mt-2 font-sans select-none">
            <input
              type="checkbox"
              id="email-me"
              className="w-4 h-4 rounded border-[#E0D9CF] accent-bg-blue text-light focus:ring-0 cursor-pointer"
            />
            <span>Email me with news and offers</span>
          </label>
        </div>

        {/* Shipping Address Blocks Layer */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-charcoal tracking-wide mb-1">
            Shipping Address
          </h3>

          {/* Phone Input Box Layout */}
          <div className="relative">
            <div className="flex bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl overflow-hidden focus-within:border-brown transition-colors">
              
              {/* Country Picker Panel Toggle Trigger with flagcdn image element */}
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 border-r border-[#E0D9CF]/60 bg-[#FAF5ED] cursor-pointer select-none hover:bg-[#FAF2EB] transition-colors shrink-0"
              >
                <img 
                  src={`https://flagcdn.com/w40/${selectedCountry.id}.png`}
                  alt={`${selectedCountry.label} flag`}
                  className="w-5 h-3.5 object-cover rounded-xs border border-charcoal/15 block"
                />
                <span className="text-[10px] text-charcoal font-medium transform scale-y-75">▼</span>
              </div>

              {/* Input Area */}
              <div className="flex items-center grow px-5">
                <span className="text-sm text-dimgrey/60 font-medium select-none mr-1.5">
                  {selectedCountry.dialCode}
                </span>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden"
                />
              </div>
            </div>

            {/* DYNAMIC COUNTRY LIST DROPDOWN (Styled using EditAddressModal flag layout) */}
            {isDropdownOpen && (
              <>
                {/* Backdrop Layer to dismiss menu click out handle */}
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                
                {/* Floating Container matching card layout borders with custom webkit scrollbar overrides */}
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full max-w-md bg-[#FAF9F6] border border-[#E0D9CF] rounded-xl shadow-xl p-4 flex flex-col gap-3 max-h-64 overflow-y-auto
                                [&::-webkit-scrollbar]:w-1.5
                                [&::-webkit-scrollbar-track]:bg-transparent
                                [&::-webkit-scrollbar-thumb]:bg-[#A37B4C]/20
                                [&::-webkit-scrollbar-thumb]:rounded-full
                                hover:[&::-webkit-scrollbar-thumb]:bg-[#A37B4C]/40">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/50 px-1">Select Country Code</span>
                  
                  {countryList.map((country) => {
                    const isSelected = selectedCountry.code === country.code
                    return (
                      <div
                        key={country.code}
                        onClick={() => handleSelectCountry(country)}
                        className={`bg-[#FAF4EB] border rounded-lg p-3.5 flex gap-3.5 items-center shadow-xs cursor-pointer transition-all ${
                          isSelected ? 'border-brown' : 'border-[#EBE3D5] hover:border-brown/40'
                        }`}
                      >
                        {/* Custom Radio Circle to mimic Selection style */}
                        {/* <div className="shrink-0">
                          <div className="w-4 h-4 rounded-full border border-brown flex items-center justify-center bg-white">
                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue" />}
                          </div>
                        </div> */}

                        {/* Country Label Metrics with exact flagcdn tag definitions */}
                        <div className="text-xs sm:text-sm flex items-center justify-between grow font-medium">
                          <div className="flex items-center gap-2.5 text-charcoal">
                            <img 
                              src={`https://flagcdn.com/w40/${country.id}.png`}
                              alt=""
                              className="w-5 h-3.5 object-cover rounded-xs border border-charcoal/10"
                            />
                            <span>{country.label} ({country.code})</span>
                          </div>
                          <span className="text-dimgrey/70 font-mono text-xs">{country.dialCode}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Name Rows Split Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
            />
            <input
              type="text"
              placeholder="Last name"
              className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
            />
          </div>

          {/* Address Line 1 */}
          <input
            type="text"
            placeholder="Address"
            className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
          />

          {/* Address Line 2 (Optional) */}
          <input
            type="text"
            placeholder="Appartment, Suite, etc. (optional)"
            className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
          />

          {/* Location Split Grid Configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
            />
            <div className="relative bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl overflow-hidden">
              <select className="w-full bg-transparent px-5 py-4 text-sm text-charcoal font-medium appearance-none focus:outline-hidden focus:border-brown cursor-pointer pr-10">
                <option value="">State</option>
                <option value="TN">Tamil Nadu</option>
                <option value="KA">Karnataka</option>
                <option value="MH">Maharashtra</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dimgrey/60 pointer-events-none text-xs">▼</span>
            </div>
          </div>

          {/* Zip Code & Region Selection Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Postal code"
              className="w-full bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-charcoal font-medium placeholder:text-dimgrey/40 focus:outline-hidden focus:border-brown transition-colors"
            />
            <div className="relative bg-[#FAF5ED] border border-[#E0D9CF]/80 rounded-xl overflow-hidden">
              <select className="w-full bg-transparent px-5 py-4 text-sm text-charcoal font-medium appearance-none focus:outline-hidden focus:border-brown cursor-pointer pr-10">
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dimgrey/60 pointer-events-none text-xs">▼</span>
            </div>
          </div>

          {/* Save Info Checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer pt-1 font-sans select-none">
            <input
              type="checkbox"
              id="save-info"
              className="w-4 h-4 rounded border-[#E0D9CF] accent-bg-blue text-light focus:ring-0 cursor-pointer"
            />
            <span>Save this information for next time</span>
          </label>
        </div>

        {/* Shipping Method Blocks */}
        <ShippingMethod />
      </form>
  )
}

export default NewContactForm
