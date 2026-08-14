"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import HeroContact from "../../../../pages/contact/HeroContact";
import ContactInformationSection from "../../../../pages/contact/ContactInformationSection";
import ContactFormSection from "../../../../pages/contact/ContactFormSection";
import EveryConversationSection from "../../../../pages/contact/EveryConversationSection";
import Image from "next/image";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

export default function ContactPageAdmin() {
  const [loading, setLoading] = useState(true);

  // Contact Hero
  const [dbHeroConfig, setDbHeroConfig] = useState<any>({});
  const [heroConfig, setHeroConfig] = useState<any>({
    section_enabled: 1,
    background_image: "",
    hero_content: "",
    hero_content_enabled: 1,
  });
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [isHeroEditing, setIsHeroEditing] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  // Contact Info
  const [dbContactInfo, setDbContactInfo] = useState<any>({});
  const [contactInfoState, setContactInfoState] = useState<any>({
    is_enabled: 1,
    small_heading: "",
    main_heading: "",
    phone_number: "",
    email: "",
    address: "",
    map_url: ""
  });
  const [isContactInfoEditing, setIsContactInfoEditing] = useState(false);
  const [savingContactInfo, setSavingContactInfo] = useState(false);

  const [isContactFormEditing, setIsContactFormEditing] = useState(false);
  const [isEveryConversationEditing, setIsEveryConversationEditing] = useState(false);
  
  const [dbFormConfig, setDbFormConfig] = useState<any>(null);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formConfigState, setFormConfigState] = useState({
    is_enabled: 1,
    section_title: 'Start Your Linen Journey'
  });
  const [savingFormConfig, setSavingFormConfig] = useState(false);

  // Every Conversation Starts Here config
  const [dbConversationConfig, setDbConversationConfig] = useState<any>({});
  const [conversationConfig, setConversationConfig] = useState({
    is_enabled: 1,
    section_title: 'EVERY CONVERSATION STARTS HERE.',
    section_content: "Looking for the right fabric or need help choosing from our collection? Reach out to us. We'll guide you through every step with honest advice and reliable support."
  });
  const [savingConversationConfig, setSavingConversationConfig] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const heroRes = await fetch(`${rawApiUrl}/api/admin/contact-page/hero`);
      const formRes = await fetch(`${rawApiUrl}/api/admin/contact-page/form-config`);
      const infoRes = await fetch(`${rawApiUrl}/api/admin/contact-page/info`);
      const conversationRes = await fetch(`${rawApiUrl}/api/admin/contact-page/conversation-config`);
      
      const heroData = await heroRes.json();
      const formData = await formRes.json();
      const infoData = await infoRes.json();
      const conversationData = await conversationRes.json();

      if (heroData.success && heroData.data) {
        setDbHeroConfig(heroData.data);
        setHeroConfig(heroData.data);
      }

      if (formData.success && formData.data) {
        setDbFormConfig(formData.data);
        setFormConfigState({
          is_enabled: formData.data.is_enabled,
          section_title: formData.data.section_title
        });
      }

      if (infoData.success && infoData.data) {
        setDbContactInfo(infoData.data);
        setContactInfoState(infoData.data);
      }

      if (conversationData.success && conversationData.data) {
        setDbConversationConfig(conversationData.data);
        setConversationConfig(conversationData.data);
      }

    } catch (error) {
      console.error("Error fetching Contact Page CMS configuration:", error);
      toast.error("Failed to load Contact Page configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      setSavingContactInfo(true);
      const res = await fetch(`${API_URL}/api/admin/contact-page/info?t=${Date.now()}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(contactInfoState)
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Contact Information saved!");
        await fetchData();
        setIsContactInfoEditing(false);
      } else {
        toast.error(json.message || "Failed to save Contact Information.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving Contact Information.");
    } finally {
      setSavingContactInfo(false);
    }
  };

  const handleSaveFormConfig = async () => {
    try {
      setSavingFormConfig(true);
      const formData = new FormData();
      formData.append("is_enabled", formConfigState.is_enabled.toString());
      formData.append("section_title", formConfigState.section_title);
      
      if (formImage) {
        formData.append("section_image", formImage);
      }

      const res = await fetch(`${rawApiUrl}/api/admin/contact-page/form-config`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Form configuration updated successfully");
        setIsContactFormEditing(false);
        setFormImage(null);
        fetchData();
      } else {
        throw new Error(data.message || "Failed to update configuration");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSavingFormConfig(false);
    }
  };

  const handleSaveConversationConfig = async () => {
    try {
      setSavingConversationConfig(true);
      const res = await fetch(`${API_URL}/api/admin/contact-page/conversation-config?t=${Date.now()}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(conversationConfig)
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Every Conversation Starts Here configuration saved!");
        await fetchData();
        setIsEveryConversationEditing(false);
      } else {
        toast.error(json.message || "Failed to save configuration.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving configuration.");
    } finally {
      setSavingConversationConfig(false);
    }
  };

  const handleSaveHero = async () => {
    try {
      setSavingHero(true);
      const formData = new FormData();
      formData.append("section_enabled", heroConfig.section_enabled.toString());
      formData.append("hero_content", heroConfig.hero_content);
      formData.append("hero_content_enabled", heroConfig.hero_content_enabled.toString());
      if (heroImage) {
        formData.append("background_image", heroImage);
      }

      const res = await fetch(`${API_URL}/api/admin/contact-page/hero?t=${Date.now()}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Contact Hero configuration saved!");
        await fetchData();
        setIsHeroEditing(false);
        setHeroImage(null);
      } else {
        toast.error(json.message || "Failed to save Contact Hero.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving Contact Hero.");
    } finally {
      setSavingHero(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="text-[#D4AF37] text-xl font-instrumentserif animate-pulse">
          Loading CMS Configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-6 pb-24">
      {/* Page Header */}
      <div className="mb-10 border-b border-[#102554] pb-6">
        <h1 className="font-instrumentserif text-4xl text-[#D4AF37] uppercase tracking-widest mb-2">
          Contact Us Page
        </h1>
        <p className="text-[14px] text-[#D3D3D3]/80">Manage content displayed on the Contact Us page.</p>
      </div>

      <div className="space-y-12">
        {/* =========================================================================
            CONTACT US HERO SECTION
        ========================================================================= */}
        <div className="bg-[#0A1D4A]/50 border border-[#102554] rounded-2xl overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-wider">
              CONTACT US HERO
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
                  dbHeroConfig?.section_enabled === 1
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "bg-red-900/20 text-red-400 border border-red-900/50"
                }`}
              >
                Status: {dbHeroConfig?.section_enabled === 1 ? "ENABLED" : "DISABLED"}
              </span>
              <button
                onClick={() => {
                  setHeroConfig(dbHeroConfig || { section_enabled: 1, hero_content: "", hero_content_enabled: 1 });
                  setHeroImage(null);
                  setIsHeroEditing(true);
                }}
                className="bg-[#D4AF37] text-[#050505] px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="relative w-full aspect-[16/7] overflow-hidden rounded-xl border border-[#102554] pointer-events-none">
              <HeroContact previewConfig={dbHeroConfig} previewMode={true} />
            </div>
          </div>
        </div>

        {/* =========================================================================
            CONTACT INFORMATION SECTION
        ========================================================================= */}
        <div className="bg-[#0A1D4A]/50 border border-[#102554] rounded-2xl overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-wider">
              CONTACT INFORMATION
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
                  dbContactInfo?.is_enabled === 1
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "bg-red-900/20 text-red-400 border border-red-900/50"
                }`}
              >
                Status: {dbContactInfo?.is_enabled === 1 ? "ENABLED" : "DISABLED"}
              </span>
              <button
                onClick={() => {
                  setContactInfoState(dbContactInfo || {
                    is_enabled: 1,
                    small_heading: "CONTACT INFORMATION",
                    main_heading: "Let's Start A Conversation",
                    phone_number: "7305015970",
                    email: "support@fabricluxure.com",
                    address: "36/11, CHB Colony Street No-04, Tiruchengode, Namakkal-637211 Tamil Nadu.",
                    map_url: "https://maps.app.goo.gl/TDbC7gTuZhS57MxS6"
                  });
                  setIsContactInfoEditing(true);
                }}
                className="bg-[#D4AF37] text-[#050505] px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="relative w-full overflow-hidden rounded-xl border border-[#102554] pointer-events-none bg-tertiary px-6 sm:px-12 lg:px-16 py-16 font-sans text-charcoal">
              <ContactInformationSection activeConfig={dbContactInfo} />
            </div>
          </div>
        </div>

        {/* =========================================================================
            START YOUR LINEN JOURNEY SECTION
        ========================================================================= */}
        <div className="bg-[#0A1D4A]/50 border border-[#102554] rounded-2xl overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-wider">
              START YOUR LINEN JOURNEY
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
                  dbFormConfig?.is_enabled === 1
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "bg-red-900/20 text-red-400 border border-red-900/50"
                }`}
              >
                Status: {dbFormConfig?.is_enabled === 1 ? "ENABLED" : "DISABLED"}
              </span>
              <button
                onClick={() => setIsContactFormEditing(true)}
                className="bg-[#D4AF37] text-[#050505] px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="relative w-full overflow-hidden rounded-xl border border-[#102554] pointer-events-none bg-tertiary px-6 sm:px-12 lg:px-16 py-16 font-sans text-charcoal">
              <ContactFormSection previewConfig={dbFormConfig} previewMode={true} />
            </div>
          </div>
        </div>

        {/* =========================================================================
            EVERY CONVERSATION STARTS HERE SECTION
        ========================================================================= */}
        <div className="bg-[#0A1D4A]/50 border border-[#102554] rounded-2xl overflow-hidden shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-instrumentserif text-2xl text-[#D4AF37] uppercase tracking-wider">
              EVERY CONVERSATION STARTS HERE
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
                  dbConversationConfig.is_enabled === 1
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "bg-red-900/20 text-red-400 border border-red-900/50"
                }`}
              >
                Status: {dbConversationConfig.is_enabled === 1 ? "ENABLED" : "DISABLED"}
              </span>
              <button
                onClick={() => {
                  setConversationConfig(dbConversationConfig.section_title ? dbConversationConfig : {
                    is_enabled: 1,
                    section_title: 'EVERY CONVERSATION STARTS HERE.',
                    section_content: "Looking for the right fabric or need help choosing from our collection? Reach out to us. We'll guide you through every step with honest advice and reliable support."
                  });
                  setIsEveryConversationEditing(true);
                }}
                className="bg-[#D4AF37] text-[#050505] px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="relative w-full overflow-hidden rounded-xl border border-[#102554] pointer-events-none bg-tertiary px-6 sm:px-12 lg:px-16 py-16 font-sans text-charcoal">
              <EveryConversationSection previewConfig={dbConversationConfig} previewMode={true} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EDIT HERO MODAL
      ========================================================================= */}
      {isHeroEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#050505] border border-[#102554] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] flex justify-between items-center bg-[#0A1D4A]/30">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] uppercase tracking-widest mb-1">
                  Edit Contact Us Hero
                </h2>
                <p className="text-[13px] text-[#D3D3D3]/60 tracking-wide">
                  Configure section text, image, and status.
                </p>
              </div>
              <button
                onClick={() => setIsHeroEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#050505]">
              <div className="space-y-8">
                
                {/* Section Toggle */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">VISIBILITY</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={heroConfig.section_enabled === 1}
                        onChange={(e) => setHeroConfig({ ...heroConfig, section_enabled: e.target.checked ? 1 : 0 })}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${heroConfig.section_enabled === 1 ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${heroConfig.section_enabled === 1 ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <span className="text-[14px] font-bold uppercase tracking-wider text-white">
                      {heroConfig.section_enabled === 1 ? 'Section Enabled' : 'Section Disabled'}
                    </span>
                  </label>
                </div>

                {/* Content Settings */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">CONTENT</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={heroConfig.hero_content_enabled === 1}
                          onChange={(e) => setHeroConfig({ ...heroConfig, hero_content_enabled: e.target.checked ? 1 : 0 })}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${heroConfig.hero_content_enabled === 1 ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${heroConfig.hero_content_enabled === 1 ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-wider text-gray-300">Enable Title</span>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Heading Text</label>
                    <input
                      type="text"
                      value={heroConfig.hero_content}
                      onChange={(e) => setHeroConfig({ ...heroConfig, hero_content: e.target.value })}
                      className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="e.g. We'd love to hear from you"
                    />
                  </div>
                </div>

                {/* Background Image */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">BACKGROUND IMAGE</h3>
                  <div className="bg-[#0A1D4A] border border-[#102554] rounded-xl p-4">
                    <div className="relative w-full h-[300px] bg-[#050505] rounded-lg overflow-hidden border border-[#102554] mb-4">
                      {heroImage || heroConfig.background_image ? (
                        <Image 
                          src={heroImage ? URL.createObjectURL(heroImage) : (heroConfig.background_image as string)?.startsWith('/uploads') ? `${API_URL}${heroConfig.background_image}` : heroConfig.background_image}
                          alt="Hero Preview" 
                          fill 
                          className="object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Camera size={48} className="mb-2 opacity-50" />
                          <span className="text-sm font-bold uppercase tracking-widest">No Image Selected</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setHeroImage(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full bg-[#102554] text-white text-center py-3 rounded-lg font-bold uppercase tracking-widest text-[12px] hover:bg-[#1a3675] transition-colors flex items-center justify-center gap-2">
                        <Camera size={16} />
                        {heroImage || heroConfig.background_image ? 'Change Background Image' : 'Upload Background Image'}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-3 text-center">
                      Recommended size: 1920x1080px. Image will automatically stretch to cover the area.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A]/30 flex justify-end gap-4">
              <button
                onClick={() => setIsHeroEditing(false)}
                className="px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                disabled={savingHero}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHero}
                disabled={savingHero}
                className="bg-[#D4AF37] text-[#050505] px-8 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors disabled:opacity-50"
              >
                {savingHero ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT CONTACT INFO MODAL
      ========================================================================= */}
      {isContactInfoEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#050505] border border-[#102554] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102554] flex justify-between items-center bg-[#0A1D4A]/30">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] uppercase tracking-widest mb-1">
                  Edit Contact Information
                </h2>
                <p className="text-[13px] text-[#D3D3D3]/60 tracking-wide">
                  Configure section text, contact details, and status.
                </p>
              </div>
              <button
                onClick={() => setIsContactInfoEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#050505]">
              <div className="space-y-8">
                
                {/* Section Toggle */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">VISIBILITY</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={contactInfoState.is_enabled === 1}
                        onChange={(e) => setContactInfoState({ ...contactInfoState, is_enabled: e.target.checked ? 1 : 0 })}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${contactInfoState.is_enabled === 1 ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${contactInfoState.is_enabled === 1 ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div>
                      <span className="block font-bold uppercase tracking-wider text-white">Enable Section</span>
                      <span className="block text-xs text-gray-400 mt-1">Show this section on the public Contact Us page.</span>
                    </div>
                  </label>
                </div>

                {/* Content Settings */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">TEXT CONTENT</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
                      <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">Small Heading</label>
                      <input
                        type="text"
                        value={contactInfoState.small_heading}
                        onChange={(e) => setContactInfoState({ ...contactInfoState, small_heading: e.target.value })}
                        className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="e.g. CONTACT INFORMATION"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">Main Heading</label>
                      <input
                        type="text"
                        value={contactInfoState.main_heading}
                        onChange={(e) => setContactInfoState({ ...contactInfoState, main_heading: e.target.value })}
                        className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="e.g. Let's Start A Conversation"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">CONTACT DETAILS</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="mb-4">
                      <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={contactInfoState.phone_number}
                        onChange={(e) => setContactInfoState({ ...contactInfoState, phone_number: e.target.value })}
                        className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="e.g. 7305015970"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={contactInfoState.email}
                        onChange={(e) => setContactInfoState({ ...contactInfoState, email: e.target.value })}
                        className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="e.g. support@fabricluxure.com"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">Physical Address</label>
                    <textarea
                      value={contactInfoState.address}
                      onChange={(e) => setContactInfoState({ ...contactInfoState, address: e.target.value })}
                      className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      placeholder="e.g. 36/11, CHB Colony Street No-04, Tiruchengode, Namakkal-637211 Tamil Nadu."
                      rows={2}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">Google Maps URL</label>
                    <input
                      type="url"
                      value={contactInfoState.map_url}
                      onChange={(e) => setContactInfoState({ ...contactInfoState, map_url: e.target.value })}
                      className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="e.g. https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A]/30 flex justify-end gap-4">
              <button
                onClick={() => setIsContactInfoEditing(false)}
                className="px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                disabled={savingContactInfo}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContactInfo}
                disabled={savingContactInfo}
                className="bg-[#D4AF37] text-[#050505] px-8 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors disabled:opacity-50"
              >
                {savingContactInfo ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT CONTACT FORM MODAL
      ========================================================================= */}
      {isContactFormEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#050505] border border-[#102554] rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#102554] flex justify-between items-center bg-[#0A1D4A]/30">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] uppercase tracking-widest mb-1">
                  Edit Start Your Linen Journey
                </h2>
                <p className="text-[13px] text-[#D3D3D3]/60 tracking-wide">
                  Configure section visibility.
                </p>
              </div>
              <button
                onClick={() => setIsContactFormEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 bg-[#050505]">
              <div>
                <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">VISIBILITY</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formConfigState.is_enabled === 1}
                      onChange={(e) => setFormConfigState({ ...formConfigState, is_enabled: e.target.checked ? 1 : 0 })}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${formConfigState.is_enabled === 1 ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formConfigState.is_enabled === 1 ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div>
                    <span className="block font-bold uppercase tracking-wider text-white">Enable Section</span>
                    <span className="block text-xs text-gray-400 mt-1">Show this section on the public Contact Us page.</span>
                  </div>
                </label>
              </div>

              <div className="mt-8">
                <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">CONTENT</h3>
                <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Section Title</label>
                    <textarea 
                        className="w-full bg-[#0A1D4A]/20 border border-[#102554] rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none" 
                        rows={2}
                        value={formConfigState.section_title}
                        onChange={(e) => setFormConfigState({ ...formConfigState, section_title: e.target.value })}
                        placeholder="Enter section title"
                    />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">SECTION IMAGE</h3>
                <label className="relative block w-full max-w-sm h-48 rounded-xl overflow-hidden cursor-pointer group border-2 border-dashed border-[#102554] hover:border-[#D4AF37]/50 transition-colors bg-[#0A1D4A]/20">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setFormImage(e.target.files[0]);
                            }
                        }}
                    />
                    {formImage ? (
                        <Image src={URL.createObjectURL(formImage)} alt="Preview" fill className="object-cover" />
                    ) : dbFormConfig?.section_image ? (
                        <Image 
                            src={dbFormConfig.section_image.startsWith('/uploads') ? `${rawApiUrl}${dbFormConfig.section_image}` : dbFormConfig.section_image} 
                            alt="Current" 
                            fill 
                            className="object-cover" 
                            unoptimized={dbFormConfig.section_image.startsWith('/uploads')}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                            <Camera className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-sm">Click to upload</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white mb-2" />
                        <span className="text-white font-medium text-sm">Change Image</span>
                    </div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A]/30 flex justify-end gap-4">
              <button
                onClick={() => setIsContactFormEditing(false)}
                className="text-gray-400 hover:text-white px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFormConfig}
                disabled={savingFormConfig}
                className={`bg-[#D4AF37] text-[#050505] px-8 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors ${savingFormConfig ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {savingFormConfig ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT CONVERSATION MODAL
      ========================================================================= */}
      {isEveryConversationEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#050505] border border-[#102554] rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#102554] flex justify-between items-center bg-[#0A1D4A]/30">
              <div>
                <h2 className="font-instrumentserif text-3xl text-[#D4AF37] uppercase tracking-widest mb-1">
                  Edit Every Conversation Starts Here
                </h2>
                <p className="text-[13px] text-[#D3D3D3]/60 tracking-wide">
                  Configure section visibility.
                </p>
              </div>
              <button
                onClick={() => setIsEveryConversationEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 bg-[#050505]">
              <div className="space-y-8">
                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">VISIBILITY</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={conversationConfig.is_enabled === 1}
                        onChange={(e) => setConversationConfig({ ...conversationConfig, is_enabled: e.target.checked ? 1 : 0 })}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${conversationConfig.is_enabled === 1 ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${conversationConfig.is_enabled === 1 ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div>
                      <span className="block font-bold uppercase tracking-wider text-white">Enable Section</span>
                      <span className="block text-xs text-gray-400 mt-1">Show this section on the public Contact Us page.</span>
                    </div>
                  </label>
                </div>

                <div>
                  <h3 className="font-instrumentserif text-xl text-[#D4AF37] uppercase tracking-widest border-b border-[#102554] pb-2 mb-4">SECTION CONTENT</h3>
                  
                  <div className="mb-4">
                    <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">SECTION TITLE</label>
                    <input
                      type="text"
                      value={conversationConfig.section_title}
                      onChange={(e) => setConversationConfig({ ...conversationConfig, section_title: e.target.value })}
                      className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="e.g. EVERY CONVERSATION STARTS HERE."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#D3D3D3] text-xs font-bold mb-2 uppercase tracking-wider">SECTION CONTENT</label>
                    <textarea
                      value={conversationConfig.section_content}
                      onChange={(e) => setConversationConfig({ ...conversationConfig, section_content: e.target.value })}
                      className="w-full bg-[#0A1D4A]/50 border border-[#102554] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      placeholder="e.g. Looking for the right fabric..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#102554] bg-[#0A1D4A]/30 flex justify-end gap-4">
              <button
                onClick={() => setIsEveryConversationEditing(false)}
                className="px-6 py-2 rounded font-bold uppercase tracking-wider text-[12px] border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                disabled={savingConversationConfig}
              >
                Cancel / Close
              </button>
              <button
                onClick={handleSaveConversationConfig}
                disabled={savingConversationConfig}
                className="bg-[#D4AF37] text-[#050505] px-8 py-2 rounded font-bold uppercase tracking-wider text-[12px] hover:bg-[#F0C850] transition-colors disabled:opacity-50"
              >
                {savingConversationConfig ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
