"use client"
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import OrderScuredModal from './OrderScuredModal'

import { motion, Variants } from 'framer-motion'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ShopHeroProps {
    previewConfig?: any;
}

function ShopHero({ previewConfig }: ShopHeroProps = {}) {
    const [cmsConfig, setCmsConfig] = useState<any>({
        section_name: "SHOP HERO",
        background_image: "/images/about-us/about bg.webp",
        content: "Pure. Natural. Linen.",
        content_enabled: 1,
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/shop-page/shop-hero`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Shop Hero CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    const pathname = usePathname()
    const path = pathname?.split('/')[1];

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    let bgImage = activeConfig.background_image;
    if (bgImage && bgImage.startsWith('/uploads')) {
        bgImage = `${API_URL}${bgImage}`;
    }

    return (
        <div className='w-full min-h-screen overflow-hidden relative'>
            <Image
                src={bgImage}
                alt="Hero Background"
                fill
                priority
                unoptimized
                className='object-cover xl:object-top lg:object-center -z-10 select-none pointer-events-none'
            />
            {/* Top dark gradient overlay for menu visibility */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/60 to-transparent pointer-events-none -z-[5]" />
            {/* Path Text */}
            {!previewConfig && (
                <div className='z-10 text-center text-white px-0 mb-10 '>
                    <div className='w-full mx-auto px-6 sm:px-12 lg:px-16 pt-32 md:pt-36 flex justify-start items-center select-none'>
                        <div className='hidden sm:flex text-md md:text-md lg:text-lg tracking-widest capitalize font-sans font-medium items-center gap-1.5 text-white/70'>
                            <Link href='/'>
                                <span className='hover:text-white transition-colors cursor-pointer'>Home</span>
                            </Link>
                            <span className='text-white font-bold'>&gt;</span>
                            <span className='text-white font-semibold tracking-wide'>{path}</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Title */}
            {activeConfig.content_enabled === 1 && (
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className='w-full text-center px-6 mb-[15vh] mt-[30vh] lg:mt-[35vh] md:mb-[20vh] z-10'
                >
                    <motion.h1 
                        variants={fadeUp} 
                        className="font-instrumentserif text-5xl sm:text-5xl md:text-4xl lg:text-8xl font-normal tracking-tight leading-none text-light select-none transform scale-y-120 origin-bottom whitespace-pre-wrap"
                    >
                        {activeConfig.content}
                    </motion.h1>
                </motion.div>
            )}
            <OrderScuredModal isOpen={false} onClose={() => { }} />
        </div>
    )
}

export default ShopHero
