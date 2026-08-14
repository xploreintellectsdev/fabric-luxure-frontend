"use client";
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Wind, Feather, Leaf } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    if (!img) return "/images/home/whylinen.webp";
    if (img.startsWith("/uploads")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
        return `${baseUrl}${img}`;
    }
    return img;
};

interface WhyLinenProps {
    previewConfig?: any;
}

function WhyLinen({ previewConfig }: WhyLinenProps = {}) {
    const [cmsConfig, setCmsConfig] = useState({
        section_name: "WHY LINEN",
        background_image: "/images/home/whylinen.webp",
        feature_1_title: "Comfort That Lasts",
        feature_1_description: "True comfort is something you notice from the moment you wear it. Our fabrics are chosen to feel light, breathable, and comfortable throughout the day, helping you stay at ease wherever life takes you.",
        feature_2_title: "Your Identity, Your Style",
        feature_2_description: "Every man has his own way of dressing. Whether your style is classic, modern, or understated, our fabric collections help you express your personality with confidence.",
        feature_3_title: "Character In Every Thread",
        feature_3_description: "Character is built through the choices you make, and what you wear is one of them. Every fabric is selected with care to create shirts that reflect confidence, purpose, and timeless style.",
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/why-linen`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Why Linen CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    const featuresData = [
        {
            id: 1,
            icon: <Wind className="w-5 h-5 text-[#C49A6C]" strokeWidth={1.5} />,
            title: activeConfig.feature_1_title,
            description: activeConfig.feature_1_description
        },
        {
            id: 2,
            icon: <Feather className="w-5 h-5 text-[#C49A6C]" strokeWidth={1.5} />,
            title: activeConfig.feature_2_title,
            description: activeConfig.feature_2_description
        },
        {
            id: 3,
            icon: <Leaf className="w-5 h-5 text-[#C49A6C]" strokeWidth={1.5} />,
            title: activeConfig.feature_3_title,
            description: activeConfig.feature_3_description
        }
    ];

    return (
        <section className='w-full flex flex-col'>
            {/* Top Showcase Banner with Tint Overlay */}
            <div className='relative w-full aspect-[21/9] min-h-[360px] sm:min-h-[450px] md:min-h-[520px] flex items-center justify-center overflow-hidden px-4'>
                <Image
                    src={resolveImageUrl(activeConfig.background_image)}
                    alt="Why Linen Showcase Background"
                    fill
                    priority
                    className='object-cover object-top -z-20 select-none pointer-events-none'
                    unoptimized
                />
                {/* Visual Matching Overlay Tint */}
                <div className='absolute inset-0 bg-[#0000008C] -z-10' />

                <span className='text-light font-instrumentserif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider uppercase transform scale-y-150 origin-center text-center select-none'>
                    {activeConfig.section_name}
                </span>
            </div>
            <div className='w-full bg-black-wash text-light px-6 sm:px-12 lg:px-16 py-20 md:py-24 flex justify-center border-t border-white/5'>
                <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16'>
                    {featuresData.map((item) => (
                        <div key={item.id} className='flex flex-1 flex-col items-center text-center group select-none'>
                            <div className='w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-inner mb-6 transition-transform duration-300 group-hover:scale-105'>
                                {item.icon}
                            </div>

                            <h3 className='text-2xl sm:text-3xl font-medium tracking-wide text-light mb-3 opacity-95'>
                                {item.title}
                            </h3>

                            <p className='text-Pinball text-base sm:text-lg font-normal leading-relaxed tracking-wide max-w-sm opacity-80 mt-4'>
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyLinen

