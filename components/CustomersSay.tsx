"use client"
import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

// Testimonials will be fetched dynamically

interface CustomersSayProps {
    previewConfig?: any;
}

export default function CustomersSay({ previewConfig }: CustomersSayProps = {}) {
    const API_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const [cmsConfig, setCmsConfig] = useState({
        section_name: "What Our Customers Say ?",
        is_enabled: 1
    });

    const [testimonials, setTestimonials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/customers-say`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Customers Say CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig, API_URL]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch(`${API_URL}/api/reviews/all`);
                const data = await res.json();
                if (data.success && data.reviews) {
                    setTestimonials(data.reviews);
                }
            } catch (err) {
                console.error("Failed to fetch testimonials", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, [API_URL]);

    const reviewCount = testimonials.length;

    // Pad base list to at least 4 items so that repeating it 3 times makes a smooth infinite loop
    let baseList = [...testimonials];
    while (baseList.length < 4 && baseList.length > 0) {
        baseList = [...baseList, ...testimonials];
    }
    const combinedList = reviewCount > 0 ? [...baseList, ...baseList, ...baseList] : [];

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null;
    }

    return (
        <section className='bg-white py-12 md:py-20 lg:py-24 w-full flex flex-col items-center justify-center font-sans overflow-hidden'>
            <div className='w-full flex flex-col items-center'>

                <h2 className='text-center uppercase font-instrumentserif text-[19px] sm:text-2xl md:text-3xl lg:text-4xl text-[#081B46] leading-[1.1] transform scale-y-150 origin-center mb-8 sm:mb-12 md:mb-20 px-2 sm:px-4 whitespace-nowrap'>
                    {activeConfig.section_name}
                </h2>

                {loading ? (
                    <div className='w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] flex justify-center items-center'>
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#081B46] rounded-full animate-spin"></div>
                    </div>
                ) : reviewCount === 0 ? (
                    <div className='w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] flex justify-center items-center flex-col gap-3 text-slate-500'>
                        <Star size={40} className="text-slate-300" />
                        <p className="font-medium text-lg">No customer reviews available yet.</p>
                    </div>
                ) : (
                    <div
                        className='w-full my-4 overflow-hidden relative'
                        style={{
                            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
                        }}
                    >
                        <div
                            className="flex gap-4 sm:gap-8 w-max py-8"
                            style={{
                                animationName: "marquee-reverse",
                                animationDuration: "230s",
                                animationTimingFunction: "linear",
                                animationIterationCount: "infinite",
                                animationPlayState: isPaused ? "paused" : "running",
                                willChange: "transform",
                            }}
                        >
                            {combinedList.map((item, index) => {
                                if (!item) return null;
                                return (
                                    <div
                                        key={`${item.review_id || item.id}-${index}`}
                                        onMouseEnter={() => setIsPaused(true)}
                                        onMouseLeave={() => setIsPaused(false)}
                                        className='group cursor-pointer shrink-0 w-[280px] sm:w-[320px] lg:w-[380px]'
                                    >
                                        <div className={`
                                            rounded-xl pt-6 sm:pt-8 lg:pt-10 px-0 pb-0
                                            flex flex-col justify-between relative overflow-hidden
                                            transition-all ease-in-out duration-300 select-none
                                            min-h-[260px] sm:min-h-[300px] lg:min-h-[360px] h-full
                                            bg-[#081B46] opacity-100 z-20 
                                            border border-transparent group-hover:border-[#D4AF37]/30
                                            group-hover:-translate-y-1 shadow-sm group-hover:shadow-[0_8px_30px_rgba(8,27,70,0.15)]
                                        `}>
                                            <div className='px-6 sm:px-8 lg:px-10'>
                                                <div className='flex items-center gap-1 mb-4 sm:mb-6'>
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={14} className={i < item.rating ? 'fill-[#F4C443] text-[#F4C443] transition-all duration-300 group-hover:fill-[#FFD700] group-hover:text-[#FFD700] group-hover:drop-shadow-[0_0_4px_rgba(255,215,0,0.4)]' : 'text-white/20 transition-all duration-300'} strokeWidth={1} />
                                                    ))}
                                                </div>
                                                <p className={`text-sm sm:text-base lg:text-lg leading-relaxed tracking-wide font-normal transition-colors duration-200 text-white font-medium whitespace-pre-wrap line-clamp-4`}>
                                                    "{item.review_message}"
                                                </p>
                                            </div>
                                            <div className='w-full mt-6 sm:mt-8 flex flex-col relative'>
                                                <div className={`w-full h-px transition-colors duration-500 bg-white/10`} />
                                                <div className='px-6 sm:px-8 lg:px-10 py-4 sm:py-5 mb-2 sm:mb-4 lg:mb-6'>
                                                    <span className={`text-xs sm:text-sm font-semibold tracking-widest uppercase block transition-colors duration-500 text-white`}>
                                                        {item.customer_name}
                                                    </span>
                                                    {item.product_name && (
                                                        <span className={`text-[10px] sm:text-xs tracking-wider block transition-colors duration-500 mt-1 text-white/60 line-clamp-1`}>
                                                            on {item.product_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes marquee-reverse {
                    0% {
                        transform: translateX(calc(-100% / 3));
                    }
                    100% {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </section>
    )
}
