"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WeBelieveProps {
    previewConfig?: any;
}

function WeBelieve({ previewConfig }: WeBelieveProps = {}) {
    const [cmsConfig, setCmsConfig] = useState<any>({
        section_name: "WE BELIEVE",
        content_1: "Style isn't about following trends. It's about wearing what feels right.",
        content_1_enabled: 1,
        content_2: "— VIJAY BALAJI — FOUNDER OF (VL GLOBAL COMPANIES)",
        content_2_enabled: 1,
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/we-believe`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching We Believe CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    return (
        <section className='bg-tertiary w-full pb-16 md:pb-24 flex flex-col items-center overflow-hidden border-b-2 border-bg-light-blue'>
            <div className='relative w-full aspect-4/3 sm:aspect-16/10 md:aspect-21/10 max-h-160 overflow-hidden'>
                <Image
                    src="/images/home/webelieve.webp"
                    alt="Behind the scenes craftsmanship preview"
                    fill
                    priority
                    className='object-cover object-top select-none'
                />
            </div>

            {(activeConfig.content_1_enabled === 1 || activeConfig.content_2_enabled === 1) && (
                <div className='relative w-[90%] max-w-4xl bg-light border border-[#EBE5DC] rounded-xl p-6 sm:p-10 md:p-14 shadow-sm -mt-16 sm:-mt-24 md:-mt-28 z-10 select-none'>
                    
                    {activeConfig.content_1_enabled === 1 && (
                        <p className='text-scroll-text text-left text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed tracking-wide max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10'>
                            {activeConfig.content_1}
                        </p>
                    )}

                    {activeConfig.content_2_enabled === 1 && (
                        <div className={`w-full ${activeConfig.content_1_enabled === 1 ? 'mt-4' : ''} flex justify-between items-center sm:items-end gap-2 sm:gap-0`}>
                            <Image
                                src="/images/FL New Logo Final.png"
                                alt="VL Global Premium Gold Seal Certification Badge"
                                width={150}
                                height={150}
                                priority
                                className="w-16 h-16 sm:w-[150px] sm:h-[150px] object-contain select-none pointer-events-none shrink-0"
                            />
                            <p className='text-xs sm:text-base md:text-lg lg:text-xl font-medium tracking-wider text-bg-blue leading-relaxed text-right sm:text-left flex-1 sm:flex-none whitespace-pre-wrap'>
                                {activeConfig.content_2}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default WeBelieve
