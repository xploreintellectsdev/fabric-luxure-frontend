"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BlogsHeroProps {
  previewConfig?: any;
}

export default function BlogsHero({ previewConfig }: BlogsHeroProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    eyebrow_text: "THE EDITORIAL",
    hero_title: "Journal & Stories",
    hero_description: "Discover craftsmanship, premium fabrics, styling inspiration, care guides, tailoring knowledge, and everything behind the world of Fabric Luxure.",
    background_image: "/images/blogs.webp",
    is_enabled: 1
  });

  useEffect(() => {
    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/blogs-page/blogs-hero`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCmsConfig(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching Blogs Hero CMS config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSConfig();
  }, [previewConfig]);

  if (loading) {
    return <div className="min-h-[80vh] md:min-h-screen bg-[#FDFBF7]"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;

  if (activeConfig.is_enabled === 0 && !previewConfig) {
    return null;
  }

  const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("/images/")) return path;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <section className={`relative min-h-[80vh] md:min-h-screen pt-32 pb-16 flex flex-col items-center justify-center overflow-hidden bg-white ${activeConfig.is_enabled === 0 ? 'opacity-50 grayscale' : ''}`}>


      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/70 z-10" />
        <img
          src={getMediaUrl(activeConfig.background_image)}
          alt="Journal Hero Background"
          className="w-full h-full object-cover opacity-50"
        />
      </motion.div>

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          <motion.p variants={fadeUp} className="text-[#D4AF37] tracking-[0.4em] text-sm md:text-base font-semibold uppercase mb-6">
            {activeConfig.eyebrow_text || "THE EDITORIAL"}
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#081B46] mb-8">
            {activeConfig.hero_title || "Journal & Stories"}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-600 text-lg md:text-xl font-light max-w-2xl mx-auto mb-12 leading-relaxed opacity-90">
            {activeConfig.hero_description || "Discover craftsmanship, premium fabrics, styling inspiration, care guides, tailoring knowledge, and everything behind the world of Fabric Luxure."}
          </motion.p>
          <motion.button
            onClick={() => document.getElementById('all-blogs')?.scrollIntoView({ behavior: 'smooth' })}
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-transparent border border-[#081B46] text-[#081B46] hover:bg-[#081B46] hover:text-white px-10 py-4 rounded-sm font-semibold tracking-widest uppercase transition-colors duration-300"
          >
            Read Latest Articles
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
