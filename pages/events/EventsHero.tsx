"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface EventsHeroProps {
    previewConfig?: any;
}

export default function EventsHero({ previewConfig }: EventsHeroProps = {}) {
    const [loading, setLoading] = useState(!previewConfig);
    const [cmsConfig, setCmsConfig] = useState<any>({
        section_name: "EVENTS HERO",
        eyebrow_text: "Fabric Luxure",
        hero_title: "Events & Experiences",
        hero_description: "Experience Fabric Luxure beyond fashion. Explore our exhibitions, launches, craftsmanship showcases, design workshops, luxury collaborations, and exclusive events.",
        background_image: "/images/events.webp",
        content_enabled: 1,
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/events-page/events-hero`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setCmsConfig({
                            ...data.data,
                            background_image: data.data.hero_image
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching Events Hero CMS config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    if (loading) {
        return <div className="min-h-[80vh] md:min-h-screen bg-white"></div>;
    }

    const activeConfig = previewConfig || cmsConfig;

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    const heroImageRaw = activeConfig.hero_image || activeConfig.background_image;
    let bgImage = heroImageRaw;
    if (bgImage && bgImage.startsWith("/uploads")) {
        bgImage = `${API_URL}${bgImage}`;
    }

    return (
        <section className="relative min-h-[80vh] md:min-h-screen pt-32 pb-16 flex flex-col items-center justify-center overflow-hidden bg-white">
            {/* Path Text Overlay - hide in preview */}
            {!previewConfig && (
                <div className="absolute top-0 left-0 w-full z-20 text-black px-0">
                    <div className="w-full mx-auto px-6 sm:px-12 lg:px-16 pt-32 md:pt-36 flex justify-start items-center select-none">
                        <div className="hidden sm:flex text-md md:text-md lg:text-lg tracking-widest capitalize font-sans font-medium items-center gap-1.5 text-black/70">
                            <a href="/">
                                <span className="hover:text-black transition-colors cursor-pointer">Home</span>
                            </a>
                            <span className="text-black font-bold">&gt;</span>
                            <span className="text-black font-semibold tracking-wide">events</span>
                        </div>
                    </div>
                </div>
            )}

            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-white/40 z-10" />
                <Image
                    src={bgImage}
                    alt="Hero Background"
                    fill
                    priority
                    unoptimized
                    className="object-cover opacity-60"
                />
            </motion.div>

            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="flex flex-col items-center"
                >
                    {activeConfig.content_enabled === 1 && (
                        <>
                            <motion.p variants={fadeUp} className="text-[#D4AF37] tracking-[0.3em] text-sm md:text-base font-semibold uppercase mb-4">
                                {activeConfig.eyebrow_text}
                            </motion.p>
                            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#081B46] mb-6">
                                {activeConfig.hero_title}
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-slate-600 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed whitespace-pre-wrap">
                                {activeConfig.hero_description}
                            </motion.p>
                        </>
                    )}
                    <motion.button 
                        onClick={() => {
                            if (!previewConfig) {
                                document.getElementById("events-listing")?.scrollIntoView({ behavior: "smooth" })
                            }
                        }}
                        variants={fadeUp}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#D4AF37] hover:bg-[#c29f30] text-white px-8 py-4 rounded-sm font-semibold tracking-wider uppercase transition-colors duration-300"
                    >
                        Explore Events
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
