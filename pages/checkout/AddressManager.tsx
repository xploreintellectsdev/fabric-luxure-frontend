import React, { useState } from 'react'
import ShippingMethod from './ShippingMethod'
import AddressForm from './AddressForm'

const initialAddresses = [
  {
    id: 'addr-1',
    phone: '98765 43210',
    name: 'Rahul Sharma',
    line1: '123 Cross Cut Road Apt 4B, Blue Sky Towers',
    cityState: 'Coimbatore, Tamil Nadu',
    postalCountry: '641012, India'
  },
  {
    id: 'addr-2',
    phone: '98765 89745',
    name: 'Sunil Chethri',
    line1: '123 Gandhinagar Road Apt 4B, Blue Sky Towers',
    cityState: 'Coimbatore, Tamil Nadu',
    postalCountry: '641012, India'
  },
  {
    id: 'addr-3',
    phone: '98765 11223',
    name: 'Amit Mishra',
    line1: '456 Avinashi Road, Peelamedu',
    cityState: 'Coimbatore, Tamil Nadu',
    postalCountry: '641004, India'
  }
]

export default function AddressManager() {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [selectedId, setSelectedId] = useState('addr-1')
  const [isAdding, setIsAdding] = useState(false)

  // Controls expanding the list when there are > 2 addresses
  const [isExpanded, setIsExpanded] = useState(false)
  // Controls switching between Managing All vs Single Collapsed view
  const [isManagingAll, setIsManagingAll] = useState(true)

  // Find the active selected item
  const selectedAddress = addresses.find(addr => addr.id === selectedId) || addresses[0]

  // Determine which items to render based on the expansion toggle state
  const visibleAddresses = isExpanded ? addresses : addresses.slice(0, 2)

  return (
    <div className="w-full max-w-xl mx-auto lg:mx-0 text-[#2C2A29] font-sans antialiased text-left">

      {/* SECTION HEADER */}
      <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#2C2A29]">
        Shipping Address
      </h2>

      {/* STATE 1: MULTIPLE CARDS VIEW MODE */}
      {isManagingAll ? (
        <div className="flex flex-col gap-4">

          {/* Address Cards List Wrapper */}
          <div className="flex flex-col gap-3">
            {visibleAddresses.map((address) => {
              const isSelected = address.id === selectedId
              return (
                <div
                  key={address.id}
                  onClick={() => setSelectedId(address.id)}
                  className={`bg-[#FAF4EB] border rounded-lg p-5 flex gap-4 items-start shadow-sm cursor-pointer transition-all ${isSelected ? 'border-[#A8793E]' : 'border-[#EBE3D5] hover:border-[#A8793E]/40'
                    }`}
                >
                  {/* Custom Radio Button */}
                  <div className="mt-1 shrink-0">
                    <div className="w-4 h-4 rounded-full border border-[#A8793E] flex items-center justify-center bg-white">
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#A8793E]" />}
                    </div>
                  </div>

                  {/* Address Info Display */}
                  <div className="text-xs sm:text-sm text-[#4E4B49] leading-relaxed flex flex-col gap-0.5">
                    <span className="font-medium text-[#2C2A29]">{address.phone}</span>
                    <span>{address.name}</span>
                    <span>{address.line1}</span>
                    <span>{address.cityState}</span>
                    <span>{address.postalCountry}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* NEW APPROACH: Clean Accordion Toggle Bar for View More / Less */}
          {addresses.length > 2 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full bg-[#FAF6F0] hover:bg-[#FAF4EB] border border-[#E6DDD0] py-2 px-4 rounded-md flex justify-center items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#4E4B49] transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Saved Addresses' : `Show All Addresses (${addresses.length})`}</span>
              <svg
                className={`w-3 h-3 text-[#A8793E] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Dotted Divider to separate structure from action */}
          <div
            className="w-full h-px my-2"
            style={{ background: "repeating-linear-gradient(to right, #E6DDD0 0 4px, transparent 4px 8px)" }}
          />

          {/* THE "ADD ADDRESS" ACTION: Retaining clean, crisp corporate text link accenting */}
          {isAdding == true ?

            <AddressForm onSave={(newAddress : any) => {
              const id = `addr-${Date.now()}`;
              const finalizedAddress = { id, ...newAddress };
    setAddresses((prev) => [...prev, finalizedAddress]);
          setSelectedId(id);
          setIsAdding(false);
  }}
          onCancel={() => setIsAdding(false)}/> : <button
            type="button"
            onClick={() => {
              setIsAdding(true)
            }
            }
            className="text-xs mb-2 uppercase tracking-wider text-[#A8793E] font-semibold hover:opacity-80 transition-opacity underline underline-offset-4 decoration-1 bg-transparent border-none p-0 cursor-pointer text-left self-start block"
          >
            + ADD NEW SHIPPING ADDRESS
          </button> }

          {/* Helper toggle block for dashboard testing simulation */}
          <button
            type="button"
            onClick={() => setIsManagingAll(false)}
            className="text-[10px] text-right uppercase tracking-widest text-[#2C2A29]/40 hover:text-[#2C2A29] mt-4 self-end"
          >
            Simulate Checkout Collapse Mode
          </button>
        </div>
      ) : (

        /* STATE 2: COLLAPSED CHECKOUT STATE VIEW */
        <div>
          <div
            onClick={() => setIsManagingAll(true)}
            className="bg-[#FAF4EB] border border-[#EBE3D5] rounded-lg p-5 flex gap-4 items-start shadow-sm mb-5 cursor-pointer"
          >
            <div className="mt-1 shrink-0">
              <div className="w-4 h-4 rounded-full border border-[#A8793E] flex items-center justify-center bg-white">
                <div className="w-2 h-2 rounded-full bg-[#A8793E]" />
              </div>
            </div>

            <div className="text-xs sm:text-sm text-[#4E4B49] leading-relaxed flex flex-col gap-0.5">
              <span className="font-medium text-[#2C2A29]">{selectedAddress.phone}</span>
              <span>{selectedAddress.name}</span>
              <span>{selectedAddress.line1}</span>
              <span>{selectedAddress.cityState}</span>
              <span>{selectedAddress.postalCountry}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsManagingAll(true)}
            className="text-xs mb-2 uppercase tracking-wider text-[#A8793E] font-medium hover:opacity-80 transition-opacity underline underline-offset-4 decoration-1 bg-transparent border-none p-0 cursor-pointer text-left block"
          >
            + Change / Manage Shipping Addresses
          </button>
        </div>
      )}
      <ShippingMethod />
    </div>
  )
}
