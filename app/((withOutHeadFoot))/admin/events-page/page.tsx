"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import Image from "next/image";
import EventsHero from "../../../../pages/events/EventsHero";
import FeaturedEvent from "../../../../pages/events/FeaturedEvent";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

const ScaledPreview = ({ children, bg = "bg-[#111111]" }: { children: React.ReactNode, bg?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(200);
  const [contentWidth, setContentWidth] = useState(1440);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        const dynamicTargetWidth = Math.max(1440, availableWidth);
        const newScale = availableWidth / dynamicTargetWidth;
        
        setContentWidth(dynamicTargetWidth);
        setScale(newScale);
        setHeight(contentRef.current.offsetHeight * newScale);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDimensions, 100);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
      Array.from(contentRef.current.children).forEach(child => {
          resizeObserver.observe(child);
      });
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full relative overflow-hidden rounded border border-gray-800 shadow-2xl transition-all duration-300 ${bg}`}
      style={{ height: `${height}px` }}
    >
      <div 
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left pointer-events-none" 
        style={{ 
          width: `${contentWidth}px`, 
          transform: `scale(${scale})` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default function EventsPageAdmin() {
  const [loading, setLoading] = useState(true);

  // Events Hero
  const [dbEventsHero, setDbEventsHero] = useState<any>({});
  const [eventsHero, setEventsHero] = useState<any>({
    section_name: "",
    eyebrow_text: "",
    hero_title: "",
    hero_description: "",
    hero_image: "",
    content_enabled: 1,
    is_enabled: 1,
  });
  const [eventsHeroImage, setEventsHeroImage] = useState<File | null>(null);
  const [isEventsHeroEditing, setIsEventsHeroEditing] = useState(false);
  const [savingEventsHero, setSavingEventsHero] = useState(false);

  // Featured Event
  const [dbFeaturedEvent, setDbFeaturedEvent] = useState<any>({});
  const [featuredEventConfig, setFeaturedEventConfig] = useState<any>({
    section_title: "FEATURED EVENT",
    is_enabled: 1
  });
  const [isFeaturedEventEditing, setIsFeaturedEventEditing] = useState(false);
  const [savingFeaturedEvent, setSavingFeaturedEvent] = useState(false);

  const [realFeaturedEventData, setRealFeaturedEventData] = useState<any>(null);

  // Fallback mock featured event data if no events exist
  const mockFeaturedEventData = {
    event_id: "mock",
    event_title: "Luxury Gala Night 2026",
    event_date: "2026-07-24",
    short_description: "Join us for an exclusive evening celebrating the finest craftsmanship in modern luxury textiles.",
    event_media: "/images/events.webp",
    media_type: "Image"
  };

  const heroImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");

      const resEventsHero = await fetch(`${API_URL}/api/admin/events-page/events-hero`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resEventsHero.ok) {
        const dataEventsHero = await resEventsHero.json();
        if (dataEventsHero.success && dataEventsHero.data) {
          setDbEventsHero(dataEventsHero.data);
          setEventsHero(dataEventsHero.data);
        }
      }

      const resFeaturedEvent = await fetch(`${API_URL}/api/admin/events-page/featured-event`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resFeaturedEvent.ok) {
        const dataFeaturedEvent = await resFeaturedEvent.json();
        if (dataFeaturedEvent.success && dataFeaturedEvent.data) {
          setDbFeaturedEvent(dataFeaturedEvent.data);
          setFeaturedEventConfig(dataFeaturedEvent.data);
        }
      }

      // Fetch the actual current featured event from the active events pool
      const resEvents = await fetch(`${API_URL}/api/events?status=1&limit=1`);
      if (resEvents.ok) {
        const dataEvents = await resEvents.json();
        if (dataEvents.success && dataEvents.data && dataEvents.data.length > 0) {
          setRealFeaturedEventData(dataEvents.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching Events Page CMS config:", error);
      toast.error("Failed to load Events Page configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventsHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEventsHeroImage(file);
      setEventsHero({ ...eventsHero, hero_image: URL.createObjectURL(file) });
    }
  };

  const handleEventsHeroCancel = () => {
    setEventsHero(dbEventsHero);
    setEventsHeroImage(null);
    setIsEventsHeroEditing(false);
    if (heroImageInputRef.current) heroImageInputRef.current.value = "";
  };

  const handleEventsHeroSave = async () => {
    try {
      setSavingEventsHero(true);
      const token = localStorage.getItem("admin_token");

      const formData = new FormData();
      formData.append("eyebrow_text", eventsHero.eyebrow_text || "");
      formData.append("hero_title", eventsHero.hero_title || "");
      formData.append("hero_description", eventsHero.hero_description || "");
      formData.append("content_enabled", eventsHero.content_enabled?.toString() || "0");
      formData.append("is_enabled", eventsHero.is_enabled?.toString() || "0");

      if (eventsHeroImage) {
        formData.append("hero_image", eventsHeroImage);
      } else {
        formData.append("hero_image", eventsHero.hero_image);
      }

      const res = await fetch(`${API_URL}/api/admin/events-page/events-hero`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Events Hero section updated successfully.");
        await fetchData();
        setIsEventsHeroEditing(false);
        setEventsHeroImage(null);
        if (heroImageInputRef.current) heroImageInputRef.current.value = "";
      } else {
        toast.error(data.message || "Error saving Events Hero");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Events Hero");
    } finally {
      setSavingEventsHero(false);
    }
  };

  const handleFeaturedEventCancel = () => {
    setFeaturedEventConfig(dbFeaturedEvent);
    setIsFeaturedEventEditing(false);
  };

  const handleFeaturedEventSave = async () => {
    try {
      setSavingFeaturedEvent(true);
      const token = localStorage.getItem("admin_token");

      const res = await fetch(`${API_URL}/api/admin/events-page/featured-event`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_enabled: featuredEventConfig.is_enabled,
          section_title: featuredEventConfig.section_title
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Featured Event section updated successfully.");
        await fetchData();
        setIsFeaturedEventEditing(false);
      } else {
        toast.error(data.message || "Error saving Featured Event");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Featured Event");
    } finally {
      setSavingFeaturedEvent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-[#050505]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#050505]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-serif tracking-widest text-[#D4AF37] uppercase">
          Events Page
        </h1>
      </div>

      <div className="flex flex-col gap-12">
        {/* ======================= EVENTS HERO SECTION ======================= */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-widest text-[#D4AF37] uppercase">{eventsHero.section_name || "EVENTS HERO"}</h2>
            {!isEventsHeroEditing && (
              <button onClick={() => setIsEventsHeroEditing(true)} className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:bg-yellow-600 transition-colors">
                EDIT
              </button>
            )}
          </div>
          
          <div className="w-full mb-8">
             <ScaledPreview>
               <EventsHero previewConfig={eventsHero} />
             </ScaledPreview>
          </div>

          {isEventsHeroEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={eventsHero.is_enabled === 1} onChange={(e) => setEventsHero({ ...eventsHero, is_enabled: e.target.checked ? 1 : 0 })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-gray-400 font-medium">CONTENT ENABLED:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={eventsHero.content_enabled === 1} onChange={(e) => setEventsHero({ ...eventsHero, content_enabled: e.target.checked ? 1 : 0 })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Eyebrow Text</label>
                      <input type="text" value={eventsHero.eyebrow_text} onChange={(e) => setEventsHero({ ...eventsHero, eyebrow_text: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. Fabric Luxure" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Hero Title</label>
                      <input type="text" value={eventsHero.hero_title} onChange={(e) => setEventsHero({ ...eventsHero, hero_title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. Events & Experiences" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Hero Description</label>
                      <textarea value={eventsHero.hero_description} onChange={(e) => setEventsHero({ ...eventsHero, hero_description: e.target.value })} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. Experience Fabric Luxure..." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Background Image</label>
                    <div className="relative group cursor-pointer w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-[#D4AF37] transition-colors" onClick={() => heroImageInputRef.current?.click()}>
                      {eventsHero.hero_image ? (
                        <>
                          <Image 
                            src={eventsHero.hero_image.startsWith("blob:") ? eventsHero.hero_image : (eventsHero.hero_image.startsWith("/uploads") ? `${API_URL}${eventsHero.hero_image}` : eventsHero.hero_image)} 
                            alt="Background preview" 
                            fill 
                            unoptimized 
                            className="object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-12 h-12 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                          <Camera className="w-12 h-12 mb-2" />
                          <span className="text-sm font-medium">Click to upload</span>
                        </div>
                      )}
                      <input type="file" ref={heroImageInputRef} onChange={handleEventsHeroImageChange} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={handleEventsHeroCancel} disabled={savingEventsHero} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-3 rounded font-medium tracking-wide hover:bg-gray-800 hover:text-white transition-colors">
                  CANCEL
                </button>
                <button onClick={handleEventsHeroSave} disabled={savingEventsHero} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingEventsHero ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ======================= FEATURED EVENT SECTION ======================= */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-widest text-[#D4AF37] uppercase">FEATURED EVENT</h2>
            {!isFeaturedEventEditing && (
              <button onClick={() => setIsFeaturedEventEditing(true)} className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:bg-yellow-600 transition-colors">
                EDIT
              </button>
            )}
          </div>
          
          <div className="w-full mb-8 relative">
             {featuredEventConfig.is_enabled === 0 && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded border border-red-500/50">
                 <span className="text-red-400 font-bold tracking-widest text-2xl uppercase border-2 border-red-400 px-6 py-2 rounded">SECTION DISABLED</span>
                 <p className="text-gray-300 mt-2">This section will not appear on the public Events page.</p>
               </div>
             )}
             <ScaledPreview>
               <FeaturedEvent previewConfig={featuredEventConfig} featuredEvent={realFeaturedEventData || mockFeaturedEventData} />
             </ScaledPreview>
          </div>

          {isFeaturedEventEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={featuredEventConfig.is_enabled === 1} onChange={(e) => setFeaturedEventConfig({ ...featuredEventConfig, is_enabled: e.target.checked ? 1 : 0 })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" value={featuredEventConfig.section_title} onChange={(e) => setFeaturedEventConfig({ ...featuredEventConfig, section_title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. FEATURED EVENT" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-800/50 rounded p-6 border border-gray-700/50">
                    <span className="text-gray-400 text-sm italic text-center">Note: The event image, title, date, and description are dynamically loaded from your active Events listing and cannot be edited here.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={handleFeaturedEventCancel} disabled={savingFeaturedEvent} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-3 rounded font-medium tracking-wide hover:bg-gray-800 hover:text-white transition-colors">
                  CANCEL
                </button>
                <button onClick={handleFeaturedEventSave} disabled={savingFeaturedEvent} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingFeaturedEvent ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
