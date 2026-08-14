"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import EventsHero from "../../../pages/events/EventsHero";
import FeaturedEvent from "../../../pages/events/FeaturedEvent";

export default function EventsPage() {
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events?status=1&limit=100`);
        const data = await res.json();
        if (data.success && data.data) {
          setEventsData(data.data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventsData.length === 0) return;
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % eventsData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [eventsData.length]);

  const featuredEvent = eventsData[featuredIndex];

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <main className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <EventsHero />

      {/* EVENTS LISTING */}
      <section id="events-listing" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
        {eventsData.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-light text-xl">Loading events...</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {eventsData.map((event, index) => {
              const isOffset = index % 2 !== 0;
              const offsetClass = isOffset ? "lg:mt-12 md:mt-8" : "";

              return (
                <motion.div
                  key={event.event_id}
                  variants={fadeUp}
                  className={`group cursor-pointer flex flex-col bg-white border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] ${offsetClass}`}
                  whileHover={{ y: -10 }}
                >
                  {/* Image/Video Container */}
                  <div 
                    className="relative h-[400px] overflow-hidden bg-slate-100"
                    onMouseEnter={(e) => {
                      if (event.media_type === "Video") {
                        const vid = e.currentTarget.querySelector('video');
                        if (vid) vid.play();
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (event.media_type === "Video") {
                        const vid = e.currentTarget.querySelector('video');
                        if (vid) {
                          vid.pause();
                          vid.currentTime = 0;
                        }
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-[#081B46]/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    {event.media_type === "Video" ? (
                      <video
                        src={`${API_URL}${event.event_media}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={`${API_URL}${event.event_media}`}
                        alt={event.event_title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    )}
                    {/* Gold border glow on hover */}
                    <div className="absolute inset-0 border-[3px] border-transparent group-hover:border-[#D4AF37]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex-grow flex flex-col">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-serif text-[#081B46] mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {event.event_title}
                    </h3>

                    <p className="text-slate-600 text-sm line-clamp-3 font-light leading-relaxed flex-grow">
                      {event.short_description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* FEATURED EVENT */}
      <FeaturedEvent featuredEvent={featuredEvent} />

      {/* PAGINATION */}
      {eventsData.length > 0 && (
        <section className="py-16 md:py-24 flex justify-center items-center gap-2 md:gap-4">
          <button 
            onClick={() => setFeaturedIndex(prev => Math.max(0, prev - 1))}
            disabled={featuredIndex === 0}
            className="px-2 md:px-4 py-2 text-slate-500 hover:text-[#081B46] uppercase text-sm tracking-widest font-semibold transition-colors disabled:opacity-50"
          >
            <span className="hidden md:inline">Previous</span>
            <ChevronLeft className="w-5 h-5 md:hidden" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(3, eventsData.length) }).map((_, i) => {
              const totalPages = eventsData.length;
              let startPage = (featuredIndex + 1) - 1; 
              if (startPage < 1) startPage = 1;
              if (startPage + 2 > totalPages) startPage = Math.max(1, totalPages - 2);
              
              const page = startPage + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setFeaturedIndex(page - 1)}
                  className={`w-12 h-12 flex items-center justify-center border font-serif text-lg transition-colors duration-300 ${featuredIndex + 1 === page
                    ? 'border-[#081B46] bg-[#081B46] text-white'
                    : 'border-slate-200 text-slate-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setFeaturedIndex(prev => Math.min(eventsData.length - 1, prev + 1))}
            disabled={featuredIndex === eventsData.length - 1}
            className="px-2 md:px-4 py-2 text-[#081B46] hover:text-[#D4AF37] uppercase text-sm tracking-widest font-semibold transition-colors disabled:opacity-50"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="w-5 h-5 md:hidden" />
          </button>
        </section>
      )}
    </main>
  );
}
