import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

function EditProfileModal({ isOpen, onClose, user, onUpdateSuccess }: any) {
    const [shouldRender, setShouldRender] = useState(isOpen)
    const [isVisualOpen, setIsVisualOpen] = useState(false)
    
    // Form state
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            const frameTimer = setTimeout(() => setIsVisualOpen(true), 10)
            
            // Populate form fields
            if (user) {
                const nameParts = (user.name || '').split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                setPhone(user.mobile || '');
                setEmail(user.email || '');
            }
            setError('');
            setSuccessMsg('');
            
            return () => clearTimeout(frameTimer)
        } else {
            setIsVisualOpen(false)
            const unmountTimer = setTimeout(() => setShouldRender(false), 300)
            return () => clearTimeout(unmountTimer)
        }
    }, [isOpen, user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const token = localStorage.getItem("token");
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            
            const response = await fetch(`${backendUrl}/api/auth/profile/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ firstName, lastName, phone, email })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setSuccessMsg("Profile updated successfully!");
                if (onUpdateSuccess) onUpdateSuccess();
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(data.error || "Failed to update profile");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    }

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${isVisualOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div 
                className={`relative w-full max-w-xl bg-[#F6F5F2] border border-[#E0D9CF] rounded-2xl p-8 sm:p-10 shadow-2xl z-10 transition-all duration-300 ease-in-out ${isVisualOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
            >
                <div className="flex justify-between items-baseline mb-8">
                    <h2 className="uppercase font-instrumentserif text-lg md:text-2xl text-[#1E1E1E] leading-[1.1] transform scale-y-150 origin-center">
                        ( Profile Info )
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-xs font-mono tracking-wider font-semibold text-[#1E1E1E] hover:text-[#967144] uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        Close <X size={14} className="inline-block" />
                    </button>
                </div>

                {error && <div className="mb-4 text-red-500 text-sm font-semibold">{error}</div>}
                {successMsg && <div className="mb-4 text-green-600 text-sm font-semibold">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full bg-[#FAF0E4] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-[#1E1E1E] font-medium placeholder:text-[#1E1E1E]/50 focus:outline-none focus:border-[#967144] transition-colors"
                        />
                        <input 
                            type="text" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full bg-[#FAF0E4] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-[#1E1E1E] font-medium placeholder:text-[#1E1E1E]/50 focus:outline-none focus:border-[#967144] transition-colors"
                        />
                    </div>
                    <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full bg-[#FAF0E4] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-[#1E1E1E] font-medium placeholder:text-[#1E1E1E]/50 focus:outline-none focus:border-[#967144] transition-colors"
                    />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-[#FAF0E4] border border-[#E0D9CF]/80 rounded-xl px-5 py-4 text-sm text-[#1E1E1E] font-medium placeholder:text-[#1E1E1E]/50 focus:outline-none focus:border-[#967144] transition-colors"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#A37B4C] hover:bg-[#8E693E] text-white text-xs font-semibold tracking-widest uppercase py-4 rounded-xl mt-4 transition-colors shadow-md cursor-pointer disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditProfileModal
