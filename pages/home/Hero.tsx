"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import MarqueeList from '../../components/MarqueeList'

interface HeroData {
    heading: string;
    heading_enabled: number;
    sub_heading: string;
    sub_heading_enabled: number;
    description_line_1: string;
    description_line_1_enabled: number;
    description_line_2: string;
    description_line_2_enabled: number;
    background_image: string;
    is_enabled: number;
}

interface MarqueeItem {
    marquee_text: string;
    item_order: number;
    is_enabled: number;
}

// Fallback Hardcoded Data
const fallbackHero: HeroData = {
    heading: "Character",
    heading_enabled: 1,
    sub_heading: "In Every Thread",
    sub_heading_enabled: 1,
    description_line_1: "Premium European Linen",
    description_line_1_enabled: 1,
    description_line_2: "For The Modern Man",
    description_line_2_enabled: 1,
    background_image: "/images/home/home hero banner.webp",
    is_enabled: 1
};

const fallbackMarquee: MarqueeItem[] = [
    { marquee_text: "100% Pure European Linen", item_order: 1, is_enabled: 1 },
    { marquee_text: "Free Swatch Samples", item_order: 2, is_enabled: 1 },
    { marquee_text: "Sustainable & Conscious", item_order: 3, is_enabled: 1 },
    { marquee_text: "Secure Checkout", item_order: 4, is_enabled: 1 }
];

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

function Hero() {
    const [heroData, setHeroData] = useState<HeroData>(fallbackHero);
    const [marqueeData, setMarqueeData] = useState<MarqueeItem[]>(fallbackMarquee);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/home-page/hero`);
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                
                if (data.success && data.hero) {
                    setHeroData(data.hero);
                    setMarqueeData(data.marquee || []);
                }
            } catch (err) {
                console.error("Failed to fetch dynamic Hero, using fallback.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroData();
    }, []);

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    if (!loading && heroData.is_enabled === 0) {
        return null;
    }

    // Process Marquee
    const activeMarquees = marqueeData
        .filter(m => m.is_enabled === 1)
        .sort((a, b) => a.item_order - b.item_order)
        .map(m => m.marquee_text);

    // If no marquees are active, maybe fallback? No, user says respect DB.
    // If we use fallback in catch, then if DB has 0 marquees, we show 0 marquees.
    // MarqueeList requires at least some items to scroll properly, so we will pass an array.
    const combinedMarquee = activeMarquees.length > 0 ? [...activeMarquees, ...activeMarquees, ...activeMarquees, ...activeMarquees, ...activeMarquees] : [];

    // Process Image URL
    let bgImageUrl = heroData.background_image;
    if (bgImageUrl && bgImageUrl.startsWith('/uploads')) {
        bgImageUrl = `${API_URL}${bgImageUrl}`;
    }

    return (
        <div className={`relative w-full min-h-screen overflow-hidden ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
            <div className='relative w-full min-h-screen flex items-center overflow-hidden px-6 md:px-16 lg:px-24'>
                <img
                    src={bgImageUrl || "/images/home/home hero banner.webp"}
                    alt="Hero Background"
                    className='absolute inset-0 w-full h-full object-cover object-center -z-10'
                />

                <div className="absolute inset-0 bg-black/20 -z-10" />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className='relative z-10 flex flex-col items-center text-center gap-4 max-w-lg md:ml-12 lg:ml-24'
                >
                    <motion.div variants={fadeUp} className="flex flex-col items-center w-full px-2">
                        {heroData.heading_enabled === 1 && (
                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-widest text-[#F9F6EE] mb-1 sm:mb-2 uppercase">
                                {heroData.heading}
                            </h1>
                        )}
                        {heroData.sub_heading_enabled === 1 && (
                            <h2 className="text-[13px] sm:text-xl md:text-2xl font-serif tracking-[0.2em] sm:tracking-[0.25em] text-[#F9F6EE] uppercase mb-4 text-center">
                                {heroData.sub_heading}
                            </h2>
                        )}
                        
                        {(heroData.heading_enabled === 1 || heroData.sub_heading_enabled === 1) && (
                            <div className="w-16 h-[1px] bg-[#F9F6EE]/60 my-3 sm:my-4"></div>
                        )}
                        
                        <div className="flex flex-col items-center mt-2 gap-1 text-center">
                            {heroData.description_line_1_enabled === 1 && (
                                <p className="text-[9px] sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] font-medium text-[#F9F6EE]/90 uppercase">
                                    {heroData.description_line_1}
                                </p>
                            )}
                            {heroData.description_line_2_enabled === 1 && (
                                <p className="text-[9px] sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] font-medium text-[#F9F6EE]/90 uppercase">
                                    {heroData.description_line_2}
                                </p>
                            )}
                        </div>
                    </motion.div>
                    
                    <Link href="/shop" className="mt-8">
                        <motion.button
                            variants={fadeUp}
                            type='button'
                            className='group bg-transparent border border-[#F9F6EE] text-[#F9F6EE] rounded-sm px-8 py-3.5 uppercase font-medium tracking-[0.8px] flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:bg-[#F9F6EE] hover:text-[#081B46] hover:border-transparent hover:shadow-lg hover:shadow-black/20'
                        >
                            shop now
                            <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
            {combinedMarquee.length > 0 && (
                <MarqueeList lists={combinedMarquee as any} />
            )}
        </div>
    )
}

export default Hero
