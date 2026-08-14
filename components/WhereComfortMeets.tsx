"use client";
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    if (!img) return "/images/home/wherecomfort.webp";
    if (img.startsWith("/uploads")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
        return `${baseUrl}${img}`;
    }
    return img;
};

interface WhereComfortMeetsProps {
    previewConfig?: any;
}

function WhereComfortMeets({ previewConfig }: WhereComfortMeetsProps = {}) {
    const [cmsConfig, setCmsConfig] = useState({
        heading_line_1: "Small",
        heading_line_1_enabled: 1,
        heading_highlight: "Change",
        heading_highlight_enabled: 1,
        heading_line_2: "Big Difference",
        heading_line_2_enabled: 1,
        description: "Every towel in our collection is chosen to deliver a soft touch, quick drying, and effective absorbency for your everyday routine.",
        description_enabled: 1,
        image: "/images/home/wherecomfort.webp",
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/where-comfort-meets`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Where Comfort Meets CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    return (
        <div className='w-full overflow-hidden'>
            {/* Main Container: Uses flex alignment to cleanly position content to the top-right on desktop */}
            <div className='relative w-full min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-start justify-center md:justify-end px-6 sm:px-12 lg:px-16 py-16 md:py-24  z-0'>

                {/* Background Image: Positioned 'object-center' or 'object-right-bottom' to keep the top-right clear for text */}
                <Image
                    src={resolveImageUrl(activeConfig.image)}
                    alt="Where Comfort Meets Background"
                    fill
                    priority
                    className='object-cover object-center md:object-bottom-right -z-10'
                    unoptimized
                />

                {/* Subtle dark tint for mobile devices to ensure text contrast over the image */}
                <div className='absolute inset-0 bg-black/10 md:bg-transparent -z-10' />

                {/* Content Container: Cleanly aligned to the right side */}
                <div className='flex flex-col justify-start items-center md:items-end text-center md:text-right max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl'>
                    <h1 className='capitalize text-tertiary font-instrumentserif text-3xl md:text-4xl lg:text-7xl transform scale-y-150 origin-center md:origin-right mb-6 md:mb-10 lg:mb-12'>
                        {activeConfig.heading_line_1_enabled === 1 && (
                            <>{activeConfig.heading_line_1}</>
                        )}
                        {activeConfig.heading_highlight_enabled === 1 && (
                            <span className='text-bg-blue italic'>{activeConfig.heading_highlight} </span>
                        )}
                        <br className='hidden md:block' />
                        {activeConfig.heading_line_2_enabled === 1 && (
                            <>{activeConfig.heading_line_2}</>
                        )}
                    </h1>
                    {activeConfig.description_enabled === 1 && (
                        <p className='text-black font-bold text-base sm:text-lg lg:text-xl tracking-wide leading-relaxed mb-6 sm:mb-8 max-w-[340px] sm:max-w-[420px] md:max-w-[480px]'>
                            {activeConfig.description}
                        </p>
                    )}
                    <Link href="/shop">
                        <button type='button' className='group bg-gradient-to-r from-[#D4AF37] to-[#E6C068] text-[#0C1A3F] rounded-[14px] px-6 py-3.5 uppercase font-medium tracking-[0.8px] flex items-center gap-2 cursor-pointer border-none shadow-md shadow-[#C89B2B]/20 transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:to-[#F7E08A] hover:shadow-lg hover:shadow-[#C89B2B]/40'>
                            shop now
                            <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default WhereComfortMeets
