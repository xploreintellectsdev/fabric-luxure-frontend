"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { showAlert } from '../utils/modalUtils';

interface CorporateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CorporateOrderModal({ isOpen, onClose }: CorporateOrderModalProps) {
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company_name: '',
    message: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-prefill if user is logged in
  useEffect(() => {
    let isMounted = true;
    
    if (isOpen) {
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && isMounted) {
            setFormData(prev => ({
              ...prev,
              name: data.data.name || prev.name,
              email: data.data.email || prev.email,
              mobile: data.data.mobile_number || data.data.mobile || prev.mobile,
            }));
          }
        })
        .catch(err => console.error("Error fetching user profile:", err));
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobile || !formData.company_name || !formData.message || !formData.consent) {
      showAlert('error', 'Error', 'Please fill all required fields and accept the consent.');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/corporate-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        showAlert('error', 'Error', data.error || 'Failed to submit enquiry.');
      }
    } catch (error: any) {
      showAlert('error', 'Error', error.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div 
        className="absolute inset-0 z-0" 
        onClick={onClose} 
      />
      
      <div className="relative z-10 w-full max-w-lg bg-tertiary border border-[#A37646]/30 rounded-xl shadow-2xl overflow-hidden font-sans text-light animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#A37646]/20 bg-primary/40">
          <h2 className="text-xl md:text-2xl font-instrumentserif uppercase tracking-wider text-[#A37646]">
            Corporate Orders
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
              <CheckCircle2 size={64} className="text-green-500 mb-2" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Thank You</h3>
              <p className="text-sm text-Pinball max-w-sm">
                Your Corporate Order enquiry has been submitted successfully.<br/>
                Our Sales Team will contact you shortly.
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-[#A37646] hover:bg-[#8B653A] text-white text-xs font-semibold tracking-widest uppercase rounded transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-Pinball">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-primary/30 border border-white/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#A37646] transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-Pinball">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-primary/30 border border-white/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#A37646] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-Pinball">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-primary/30 border border-white/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#A37646] transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-Pinball">Phone Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-primary/30 border border-white/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#A37646] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-Pinball">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full bg-primary/30 border border-white/10 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#A37646] transition-colors resize-none"
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-4 h-4 bg-transparent border border-white/30 rounded focus:ring-[#A37646] accent-[#A37646]"
                />
                <label htmlFor="consent" className="text-xs text-Pinball leading-tight">
                  I agree to be contacted by Fabric Luxure via phone or email.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-bg-blue hover:bg-bg-blue/90 disabled:opacity-50 text-white text-xs font-semibold tracking-widest uppercase rounded transition-colors mt-6"
              >
                {loading ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
