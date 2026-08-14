import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export interface Address {
    addressId?: string | number
    fullName: string
    mobile: string
    alternateMobile?: string
    houseBuilding: string
    streetLocality: string
    landmark?: string
    city: string
    state: string
    country: string
    postalCode: string
    addressType: 'Home' | 'Office' | 'Other'
    isDefault: boolean
}

interface EditAddressModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (address: Address) => void
    initialAddress: Address | null
}

function EditAddressModal({ isOpen, onClose, onSave, initialAddress }: EditAddressModalProps) {
    const [fullName, setFullName] = useState('')
    const [mobile, setMobile] = useState('')
    const [alternateMobile, setAlternateMobile] = useState('')
    const [houseBuilding, setHouseBuilding] = useState('')
    const [streetLocality, setStreetLocality] = useState('')
    const [landmark, setLandmark] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [country, setCountry] = useState('India')
    const [postalCode, setPostalCode] = useState('')
    const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Other'>('Home')
    const [isDefault, setIsDefault] = useState(false)

    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)

    // Load initial values if editing
    useEffect(() => {
        if (initialAddress) {
            setFullName(initialAddress.fullName || '')
            setMobile(initialAddress.mobile || '')
            setAlternateMobile(initialAddress.alternateMobile || '')
            setHouseBuilding(initialAddress.houseBuilding || '')
            setStreetLocality(initialAddress.streetLocality || '')
            setLandmark(initialAddress.landmark || '')
            setCity(initialAddress.city || '')
            setState(initialAddress.state || '')
            setCountry(initialAddress.country || 'India')
            setPostalCode(initialAddress.postalCode || '')
            setAddressType(initialAddress.addressType || 'Home')
            setIsDefault(initialAddress.isDefault || false)
        } else {
            // Reset to defaults for addition
            setFullName('')
            setMobile('')
            setAlternateMobile('')
            setHouseBuilding('')
            setStreetLocality('')
            setLandmark('')
            setCity('')
            setState('')
            setCountry('India')
            setPostalCode('')
            setAddressType('Home')
            setIsDefault(false)
        }
        setErrors({})
        setSubmitted(false)
    }, [initialAddress, isOpen])

    const validate = () => {
        const tempErrors: Record<string, string> = {}
        if (!fullName.trim()) tempErrors.fullName = 'Full Name is required'
        if (!mobile.trim()) tempErrors.mobile = 'Mobile Number is required'
        if (!houseBuilding.trim()) tempErrors.houseBuilding = 'House / Flat / Building Name is required'
        if (!streetLocality.trim()) tempErrors.streetLocality = 'Area / Street / Locality is required'
        if (!city.trim()) tempErrors.city = 'City is required'
        if (!state.trim()) tempErrors.state = 'State is required'
        if (!postalCode.trim()) tempErrors.postalCode = 'Postal Code is required'
        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPostalCode(val);
        if (submitted && val.trim()) setErrors(prev => ({ ...prev, postalCode: '' }));

        if (/^\d{6}$/.test(val)) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
                const data = await res.json();
                if (data && data[0].Status === "Success") {
                    const postOffice = data[0].PostOffice[0];
                    setCity(postOffice.District);
                    setState(postOffice.State);
                    setCountry(postOffice.Country);
                    
                    if (submitted) {
                        setErrors(prev => ({ ...prev, city: '', state: '' }));
                    }
                }
            } catch (err) {
                console.error("Error fetching pincode details:", err);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        if (!validate()) return

        const savedAddress: Address = {
            addressId: initialAddress?.addressId,
            fullName,
            mobile,
            alternateMobile,
            houseBuilding,
            streetLocality,
            landmark,
            city,
            state,
            country,
            postalCode,
            addressType,
            isDefault
        }
        onSave(savedAddress)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ease-out"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div 
                className="relative bg-[#08142c] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl shadow-black text-light z-10 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="font-instrumentserif text-xl sm:text-2xl uppercase tracking-widest text-light leading-none">
                        {initialAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-Pinball hover:text-light transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Fields - scrollable content */}
                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-1 grow select-none scrollbar-thin">
                    
                    {/* Contact Info Section */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-bg-blue font-bold">Contact Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] uppercase tracking-wider text-Pinball">Full Name *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => {
                                        setFullName(e.target.value)
                                        if (submitted && e.target.value.trim()) setErrors(prev => ({ ...prev, fullName: '' }))
                                    }}
                                    placeholder="Rithish Kumar"
                                    className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                        errors.fullName ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                    }`}
                                />
                                {errors.fullName && <span className="text-[10px] text-red-400 block">{errors.fullName}</span>}
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] uppercase tracking-wider text-Pinball">Mobile Number *</label>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => {
                                        setMobile(e.target.value)
                                        if (submitted && e.target.value.trim()) setErrors(prev => ({ ...prev, mobile: '' }))
                                    }}
                                    placeholder="9876543210"
                                    className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                        errors.mobile ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                    }`}
                                />
                                {errors.mobile && <span className="text-[10px] text-red-400 block">{errors.mobile}</span>}
                            </div>
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase tracking-wider text-Pinball">Alternate Mobile Number (Optional)</label>
                            <input
                                type="tel"
                                value={alternateMobile}
                                onChange={(e) => setAlternateMobile(e.target.value)}
                                placeholder="Optional alternate number"
                                className="w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border border-white/10 bg-[#07122a] focus:outline-none focus:border-bg-blue transition-colors"
                            />
                        </div>
                    </div>

                    {/* Address details section */}
                    <div className="space-y-4 pt-2 border-t border-white/5">
                        <h4 className="text-[10px] uppercase tracking-wider text-bg-blue font-bold">Address</h4>
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase tracking-wider text-Pinball">House / Flat / Building Name *</label>
                            <input
                                type="text"
                                value={houseBuilding}
                                onChange={(e) => {
                                    setHouseBuilding(e.target.value)
                                    if (submitted && e.target.value.trim()) setErrors(prev => ({ ...prev, houseBuilding: '' }))
                                }}
                                placeholder="Flat / Building Name"
                                className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                    errors.houseBuilding ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                }}`}
                            />
                            {errors.houseBuilding && <span className="text-[10px] text-red-400 block">{errors.houseBuilding}</span>}
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase tracking-wider text-Pinball">Area / Street / Locality *</label>
                            <input
                                type="text"
                                value={streetLocality}
                                onChange={(e) => {
                                    setStreetLocality(e.target.value)
                                    if (submitted && e.target.value.trim()) setErrors(prev => ({ ...prev, streetLocality: '' }))
                                }}
                                placeholder="Locality, street address"
                                className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                    errors.streetLocality ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                }}`}
                            />
                            {errors.streetLocality && <span className="text-[10px] text-red-400 block">{errors.streetLocality}</span>}
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase tracking-wider text-Pinball">Landmark (Optional)</label>
                            <input
                                type="text"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                placeholder="E.g. Near Bus Stand"
                                className="w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border border-white/10 bg-[#07122a] focus:outline-none focus:border-bg-blue transition-colors"
                            />
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase tracking-wider text-Pinball">Postal Code *</label>
                            <input
                                type="text"
                                value={postalCode}
                                onChange={handlePostalCodeChange}
                                placeholder="641002"
                                maxLength={6}
                                className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                    errors.postalCode ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                }`}
                            />
                            {errors.postalCode && <span className="text-[10px] text-red-400 block">{errors.postalCode}</span>}
                        </div>
                    </div>

                    {/* Location details section */}
                    <div className="space-y-4 pt-2 border-t border-white/5">
                        <h4 className="text-[10px] uppercase tracking-wider text-bg-blue font-bold">Location</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] uppercase tracking-wider text-Pinball">City *</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => {
                                        setCity(e.target.value)
                                        if (submitted && e.target.value.trim()) setErrors(prev => ({ ...prev, city: '' }))
                                    }}
                                    placeholder="Coimbatore"
                                    className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                        errors.city ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                    }`}
                                />
                                {errors.city && <span className="text-[10px] text-red-400 block">{errors.city}</span>}
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] uppercase tracking-wider text-Pinball">State *</label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => {
                                        setState(e.target.value)
                                        if (submitted && e.target.value.trim()) setErrors(prev => ({ ...prev, state: '' }))
                                    }}
                                    placeholder="Tamil Nadu"
                                    className={`w-full px-4 py-3 text-sm placeholder:text-bg-blue/30 text-light rounded-md border bg-[#07122a] focus:outline-none transition-colors ${
                                        errors.state ? 'border-red-500/55 focus:border-red-500' : 'border-white/10 focus:border-bg-blue'
                                    }`}
                                />
                                {errors.state && <span className="text-[10px] text-red-400 block">{errors.state}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] uppercase tracking-wider text-Pinball">Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="India"
                                    disabled
                                    className="w-full px-4 py-3 text-sm text-light rounded-md border border-white/5 bg-[#07122a] opacity-50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Type Section */}
                    <div className="space-y-4 pt-2 border-t border-white/5 text-left">
                        <h4 className="text-[10px] uppercase tracking-wider text-bg-blue font-bold">Address Type</h4>
                        <div className="flex gap-6">
                            {(['Home', 'Office', 'Other'] as const).map((addrType) => (
                                <label key={addrType} className="flex items-center gap-2 cursor-pointer text-xs text-Pinball hover:text-light transition-colors">
                                    <input
                                        type="radio"
                                        name="addressType"
                                        value={addrType}
                                        checked={addressType === addrType}
                                        onChange={() => setAddressType(addrType)}
                                        className="accent-bg-blue w-4 h-4 bg-[#07122a] border-white/10"
                                    />
                                    {addrType}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Default Checkbox */}
                    <div className="pt-2 text-left">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-Pinball hover:text-light transition-colors">
                            <input
                                type="checkbox"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="accent-bg-blue w-4 h-4 rounded bg-[#07122a] border-white/10"
                            />
                            Make this my default address
                        </label>
                    </div>

                    {/* Buttons Footer */}
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 border border-white/10 hover:bg-white/5 text-Pinball hover:text-light text-xs uppercase tracking-widest rounded-md cursor-pointer transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 h-12 bg-bg-blue text-light text-xs uppercase tracking-widest rounded-md cursor-pointer font-semibold hover:opacity-90 transition-all shadow-lg shadow-black/20"
                        >
                            Save Address
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default EditAddressModal
