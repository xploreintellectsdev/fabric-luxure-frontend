"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

interface BreathData {
    heading_line_1: string;
    heading_line_1_enabled: number;
    heading_line_2: string;
    heading_line_2_enabled: number;
    heading_highlight: string;
    heading_highlight_enabled: number;
    heading_line_3: string;
    heading_line_3_enabled: number;
    description: string;
    description_enabled: number;
    image: string;
    is_enabled: number;
}

const fallbackBreath: BreathData = {
    heading_line_1: "Made",
    heading_line_1_enabled: 1,
    heading_line_2: "For",
    heading_line_2_enabled: 1,
    heading_highlight: "Men ,",
    heading_highlight_enabled: 1,
    heading_line_3: "Inspired by Nature",
    heading_line_3_enabled: 1,
    description: "The right fabric makes every shirt better. Soft, breathable, and comfortable materials designed for men who value quality and everyday style.",
    description_enabled: 1,
    image: "/images/home/breath.webp",
    is_enabled: 1
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

function Breath() {
    const [breathData, setBreathData] = useState<BreathData>(fallbackBreath);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreathData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/home-page/breath`);
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                
                if (data.success && data.breath) {
                    setBreathData(data.breath);
                }
            } catch (err) {
                console.error("Failed to fetch dynamic Breath, using fallback.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBreathData();
    }, []);

    if (!loading && breathData.is_enabled === 0) {
        return null;
    }

    let imageUrl = breathData.image;
    if (imageUrl && imageUrl.startsWith('/uploads')) {
        imageUrl = `${API_URL}${imageUrl}`;
    }

    return (
        <div className={`w-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
            <div className='bg-primary px-6 sm:px-12 lg:px-16 py-8 md:py-20 w-full flex justify-center'>
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className='w-full md:w-1/2 flex justify-center md:justify-end'>
                        {imageUrl && (
                            <img
                                src={imageUrl || "/images/home/breath.webp"}
                                alt="Made For Men"
                                width={500}
                                height={333}
                                className='rounded-md w-full h-auto object-cover'
                            />
                        )}
                    </div>
                    <div className='flex flex-col justify-center pb-3 md:w-2/5 text-center md:text-left'>
                        <h2 className='capitalize text-light font-instrumentserif text-3xl md:text-4xl lg:text-7xl transform scale-y-150 origin-center mb-6 md:mb-10 lg:mb-16'>
                            {breathData.heading_line_1_enabled === 1 && <>{breathData.heading_line_1}<br className='hidden md:block' /> </>}
                            {breathData.heading_line_2_enabled === 1 && <>{breathData.heading_line_2} <br className='block md:hidden' /> </>}
                            {breathData.heading_highlight_enabled === 1 && <span className='text-lightbrown italic'>{breathData.heading_highlight}</span>}
                            {breathData.heading_highlight_enabled === 1 && <br className='hidden md:block' />}
                            {breathData.heading_line_3_enabled === 1 && <>{breathData.heading_line_3} </>}
                        </h2>
                        {breathData.description_enabled === 1 && (
                            <p className='text-Pinball text-sm sm:text-base lg:text-lg tracking-wide leading-relaxed mt-4 md:mt-8'>
                                {breathData.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Breath
