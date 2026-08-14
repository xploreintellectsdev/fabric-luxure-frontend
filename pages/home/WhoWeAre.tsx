"use client";

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WhoWeAreProps {
    previewConfig?: any;
}

function WhoWeAre({ previewConfig }: WhoWeAreProps = {}) {
    const [cmsConfig, setCmsConfig] = useState({
        section_name: "Why Fabric Luxure ?",
        content_1: "Most men don't have the time to search through fabric options or choose what will last. They want fabrics that look good, wear well, and are worth their investment. That's exactly why Fabric Luxre exists.",
        content_1_enabled: 1,
        content_2: "I'm Vijay Balaji, founder of VL Global Companies. Fabric Luxure was created to make fabric selection simple and dependable. Every collection reflects our commitment to offering materials that meet the standards of modern men.",
        content_2_enabled: 1,
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/why-fabric-luxure`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Why Fabric Luxure CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    return (
        <section className='bg-tertiary px-6 sm:px-12 lg:px-16 py-12 md:py-20 lg:py-24 w-full flex flex-col items-center justify-center overflow-hidden'>
            <div className='max-w-5xl w-full flex flex-col items-center'>
                <h2 className='text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center'>
                    {activeConfig.section_name}
                </h2>

                <div className='relative mt-20 bg-primary w-full max-w-4xl rounded-xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center text-center shadow-sm'>
                    <p className='text-Pinball text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed tracking-wide max-w-3xl pb-6 md:pb-8 select-none'>
                        {activeConfig.content_1_enabled === 1 && (
                            <>
                                {activeConfig.content_1}
                                {activeConfig.content_2_enabled === 1 && <br />}
                            </>
                        )}
                        {activeConfig.content_2_enabled === 1 && (
                            <>{activeConfig.content_2}</>
                        )}
                    </p>

                    {/* Absolutely anchored bottom badge overlapping the card border */}
                    <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 w-16 h-16 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-[5px] border-[#8A6500] flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
                        style={{
                            background: "linear-gradient(135deg, #8B5E00 0%, #C89B2B 25%, #F7E08A 50%, #C89B2B 75%, #8B5E00 100%)",
                            boxShadow: "0 10px 25px -5px rgba(200, 155, 43, 0.4), 0 8px 10px -6px rgba(200, 155, 43, 0.4)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 35px 5px rgba(247, 224, 138, 0.65), 0 10px 25px -5px rgba(200, 155, 43, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(200, 155, 43, 0.4), 0 8px 10px -6px rgba(200, 155, 43, 0.4)";
                        }}
                    >
                        {/* Inner Circular Ring */}
                        <div className="absolute inset-1 rounded-full border border-white/25 z-0" />

                        <div className="relative w-[84%] h-[84%] z-10 flex items-center justify-center">
                            <Image
                                src="/images/FL New Logo Final.png"
                                alt="VL Global Premium Gold Seal Certification Badge"
                                width={160}
                                height={160}
                                priority
                                className="w-full h-full object-contain select-none pointer-events-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WhoWeAre
