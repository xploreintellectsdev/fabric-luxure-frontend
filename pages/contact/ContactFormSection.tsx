"use client";

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast';

function ContactFormSection({ previewConfig, previewMode }: { previewConfig?: any, previewMode?: boolean }) {
    const [dbConfig, setDbConfig] = useState<any>(null);
    const [loadingConfig, setLoadingConfig] = useState(!previewMode);
    
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
    const [errors, setErrors] = useState({ name: '', phone: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            if (previewMode) return;
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                const res = await fetch(`${API_URL}/api/contact-page/form-config`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success && json.data) {
                    setDbConfig(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch contact form config:", err);
            } finally {
                setLoadingConfig(false);
            }
        };
        fetchConfig();
    }, [previewMode]);

    const activeConfig = previewConfig || dbConfig;

    if (loadingConfig && !previewMode) {
        return (
            <div className='w-full mt-16 bg-primary rounded-xl p-4 md:p-6 flex items-center justify-center min-h-[450px]'>
                <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!activeConfig || (!previewMode && activeConfig.is_enabled !== 1)) {
        return null;
    }

    const validateForm = () => {
        let valid = true;
        const newErrors = { name: '', phone: '', email: '', message: '' };

        if (!formData.name) {
            newErrors.name = 'Name is required';
            valid = false;
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Minimum 3 characters required';
            valid = false;
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
            valid = false;
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Exactly 10 digits required (numbers only)';
            valid = false;
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Valid email format required';
            valid = false;
        }

        if (!formData.message) {
            newErrors.message = 'Message is required';
            valid = false;
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Minimum 10 characters required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-bold">Message Sent</span>
                        <span className="text-sm">Thank you for contacting Fabric Luxure. Our team will reach you shortly.</span>
                    </div>,
                    { position: 'top-right', duration: 4000 }
                );
                setFormData({ name: '', phone: '', email: '', message: '' });
            } else {
                throw new Error(data.error || 'Failed to submit');
            }
        } catch (error) {
            toast.error(
                <div className="flex flex-col">
                    <span className="font-bold">Submission Failed</span>
                    <span className="text-sm">Unable to send your enquiry. Please try again later.</span>
                </div>,
                { position: 'top-right', duration: 4000 }
            );
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return "/images/home/community.webp";
        if (path.startsWith("http")) return encodeURI(path);
        if (path.startsWith("/uploads")) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            return encodeURI(`${API_URL}${path}`);
        }
        if (path.startsWith("blob:")) return path; // for local preview
        return encodeURI(path);
    };

    return (
        <div className='w-full mt-16 bg-primary rounded-xl p-4 md:p-6 flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch'>
            <div className="relative w-full lg:w-1/2 min-h-[350px] sm:min-h-[450px] rounded-lg overflow-hidden shrink-0">
                <Image
                    src={getImageUrl(activeConfig.section_image)}
                    alt="Linen Landscape Community Visual"
                    fill
                    priority
                    className="object-cover object-center"
                    unoptimized={getImageUrl(activeConfig.section_image).includes('localhost') || getImageUrl(activeConfig.section_image).includes('127.0.0.1')}
                />
            </div>
            <div className="w-full flex flex-col justify-center py-4 pr-0 lg:pr-4">
                <h2 
                    className='font-instrumentserif text-4xl sm:text-5xl lg:text-6xl text-light tracking-tight leading-[1.05] mb-8 scale-y-105 origin-left'
                    dangerouslySetInnerHTML={{ __html: (activeConfig.section_title || "Start Your <br />Linen Journey").replace(/\n/g, "<br />") }}
                />

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full text-light">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="name" className='text-Pinball font-medium text-xs tracking-wide uppercase'>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" id="name" className={`w-full bg-bg-light-blue text-sm text-light rounded-md px-4 py-3 border outline-none transition-all placeholder:text-light/30 ${errors.name ? 'border-red-500' : 'border-transparent focus:border-white/20'}`} />
                            {errors.name && <span className="text-red-500 text-xs mt-0.5">{errors.name}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="phone" className='text-Pinball font-medium text-xs tracking-wide uppercase'>Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" id="phone" className={`w-full bg-bg-light-blue text-sm text-light rounded-md px-4 py-3 border outline-none transition-all placeholder:text-light/30 ${errors.phone ? 'border-red-500' : 'border-transparent focus:border-white/20'}`} />
                            {errors.phone && <span className="text-red-500 text-xs mt-0.5">{errors.phone}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className='text-Pinball font-medium text-xs tracking-wide uppercase'>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email id" id="email" className={`w-full bg-bg-light-blue text-sm text-light rounded-md px-4 py-3 border outline-none transition-all placeholder:text-light/30 ${errors.email ? 'border-red-500' : 'border-transparent focus:border-white/20'}`} />
                        {errors.email && <span className="text-red-500 text-xs mt-0.5">{errors.email}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="message" className='text-Pinball font-medium text-xs tracking-wide uppercase'>Message</label>
                        <textarea placeholder="Type your message here..." name="message" value={formData.message} onChange={handleChange} id="message" rows={4} className={`w-full bg-bg-light-blue text-sm text-light rounded-md px-4 py-3 border outline-none resize-none transition-all placeholder:text-light/30 ${errors.message ? 'border-red-500' : 'border-transparent focus:border-white/20'}`}></textarea>
                        {errors.message && <span className="text-red-500 text-xs mt-0.5">{errors.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`group w-full mt-2 text-xs font-semibold tracking-widest uppercase py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.99] border-none
                            ${loading
                                ? 'bg-[#E6C068]/70 text-[#0C1A3F]/70 cursor-not-allowed'
                                : 'bg-gradient-to-b from-[#D4AF37] via-[#E6C068] to-[#C89B2A] text-[#0C1A3F] cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C89B2B]/40 hover:from-[#E6C068] hover:via-[#F7E08A] hover:to-[#D4AF37]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-[#0C1A3F]/20 border-t-[#0C1A3F] rounded-full animate-spin"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                Send <ArrowUpRight className="w-4 h-4 stroke-2 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ContactFormSection
