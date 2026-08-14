"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { motion, Variants } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface HeroContactProps {
    previewConfig?: any;
    previewMode?: boolean;
}

function HeroContact({ previewConfig, previewMode = false }: HeroContactProps) {
    const pathname = usePathname()
    const path = pathname?.split('/')[1] ?? ''

    const [dbConfig, setDbConfig] = useState<any>(null)
    const [loading, setLoading] = useState(!previewConfig)

    useEffect(() => {
        if (previewConfig) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/contact-page/hero?t=${Date.now()}`, { cache: 'no-store' });
                const json = await res.json();
                if (json.success && json.data) {
                    setDbConfig(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch Contact Us Hero:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [previewConfig]);

    const activeConfig = previewConfig || dbConfig;

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#EAE3D8] animate-pulse flex items-center justify-center">
                <div className="w-64 h-12 bg-gray-300 rounded"></div>
            </div>
        );
    }

    if (!activeConfig || (!previewMode && activeConfig.section_enabled !== 1)) {
        return null;
    }

    const getImageUrl = (path: string) => {
        if (!path) return "/images/contact/hero-contact.webp";
        if (path.startsWith("http")) return encodeURI(path);
        if (path.startsWith("/uploads")) return encodeURI(`${API_URL}${path}`);
        if (path.startsWith("blob:")) return path; // for local preview
        return encodeURI(path);
    };

    return (
        <div className={`w-full overflow-hidden relative z-0 ${previewMode ? 'h-full flex items-center justify-center' : 'min-h-screen block'}`}>
            <Image
                src={getImageUrl(activeConfig.background_image)}
                alt="Hero Background"
                fill
                priority
                className='object-cover xl:object-top lg:object-center -z-10 select-none pointer-events-none'
                unoptimized={getImageUrl(activeConfig.background_image).includes('localhost') || getImageUrl(activeConfig.background_image).includes('127.0.0.1')}
            />
            {/* Path Text */}
            {!previewMode && (
                <div className='z-1 text-center text-light px-0 mb-10'>
                    <div className='w-full mx-auto px-6 sm:px-12 lg:px-16 pt-32 md:pt-36 flex justify-start items-center select-none z-10'>
                        <div className='hidden sm:flex text-md md:text-md lg:text-lg tracking-widest capitalize font-sans font-medium items-center gap-1.5 text-light/70'>
                            <Link href='/'>
                                <span className='hover:text-light transition-colors cursor-pointer'>Home</span>
                            </Link>
                            <span className='text-light font-bold'>&gt;</span>
                            <span className='text-light font-semibold tracking-wide'>{path}</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Title */}
            {activeConfig.hero_content_enabled === 1 && (
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className={`w-full text-center px-6 z-10 relative ${previewMode ? '' : 'mb-[15vh] mt-[20vh] md:mb-[20vh]'}`}
                >
                    <motion.h1 
                        variants={fadeUp} 
                        className="font-instrumentserif text-5xl sm:text-5xl md:text-4xl lg:text-8xl font-normal tracking-tight leading-none text-light select-none transform scale-y-120 origin-bottom"
                    >
                        {activeConfig.hero_content || `We'd love to hear from you`}
                    </motion.h1>
                </motion.div>
            )}
        </div>
    )
}

export default HeroContact
