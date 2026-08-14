"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FeaturedEventProps {
  featuredEvent?: any;
  previewConfig?: any;
}

export default function FeaturedEvent({ featuredEvent, previewConfig }: FeaturedEventProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    section_title: "FEATURED EVENT",
    is_enabled: 1
  });

  useEffect(() => {
    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/events-page/featured-event`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCmsConfig(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching Featured Event CMS config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSConfig();
  }, [previewConfig]);

  if (loading) {
    return <div className="py-24 bg-[#081B46]"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;

  // Don"t render if disabled (unless in preview)
  if (activeConfig.is_enabled === 0 && !previewConfig) {
    return null;
  }

  // We need a featured event to render something.
  // In preview, we might be passed a mock featuredEvent if real one is null
  if (!featuredEvent) {
    return null;
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("/images/")) return path;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };


  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <section className="bg-[#081B46] py-24 px-4 md:px-8 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="flex flex-col lg:flex-row items-stretch gap-0 border border-[#D4AF37]/30 group"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Left Image / Video */}
          <motion.div variants={fadeUp} className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-[500px] overflow-hidden">
            {featuredEvent.media_type === "Video" ? (
              <video
                src={getMediaUrl(featuredEvent.event_media)}
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={getMediaUrl(featuredEvent.event_media)}
                alt="Featured Event"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            )}
            <div className="absolute inset-0 bg-[#081B46]/10 group-hover:bg-transparent transition-colors duration-700" />
          </motion.div>

          {/* Right Content */}
          <motion.div variants={fadeUp} className="w-full lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-[#05112E]">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-[#D4AF37] uppercase tracking-[0.2em] text-xs font-semibold">{activeConfig.section_title || "FEATURED EVENT"}</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              {featuredEvent.event_title}
            </h2>

            <div className="flex flex-col md:flex-row md:items-center gap-4 text-slate-400 mb-8 font-mono text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>{new Date(featuredEvent.event_date).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-slate-300 font-light leading-relaxed mb-10 text-lg opacity-90">
              {featuredEvent.short_description}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
