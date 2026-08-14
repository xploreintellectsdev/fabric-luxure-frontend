"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BlogsHeritageProps {
  previewConfig?: any;
}

export default function BlogsHeritage({ previewConfig }: BlogsHeritageProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    section_title: "Discover Our Heritage",
    section_description: "Uncover the legacy of Fabric Luxure. Learn about our master craftsmen, our dedication to premium materials, and the timeless tradition of true luxury fashion.",
    is_enabled: 1
  });

  useEffect(() => {
    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/blogs-page/heritage`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCmsConfig(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching Blogs Heritage CMS config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSConfig();
  }, [previewConfig]);

  if (loading) {
    return <div className="py-24 px-4 bg-[#081B46]"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;

  if (activeConfig.is_enabled === 0 && !previewConfig) {
    return null;
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <section className={`bg-[#081B46] py-24 px-4 md:px-8 text-center relative overflow-hidden ${activeConfig.is_enabled === 0 ? 'opacity-50 grayscale' : ''}`}>
      {/* Subtle background pattern/glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-full bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        className="max-w-3xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif text-white mb-6">
          {activeConfig.section_title || "Discover Our Heritage"}
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-300 text-lg font-light mb-12 max-w-xl mx-auto opacity-90 leading-relaxed">
          {activeConfig.section_description || "Uncover the legacy of Fabric Luxure. Learn about our master craftsmen, our dedication to premium materials, and the timeless tradition of true luxury fashion."}
        </motion.p>

        <motion.div variants={fadeUp} className="flex justify-center">
          <Link href="/about">
            <button className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#081B46] px-10 py-4 font-semibold uppercase tracking-widest transition-colors rounded-sm whitespace-nowrap">
              Discover More
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
