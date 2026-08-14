"use client";

import React, { useState, useEffect } from 'react';
import { Star, Shirt, User, Leaf, ShieldCheck, Heart } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WhatWeStandForProps {
  previewConfig?: any;
}

function Whatwestandfor({ previewConfig }: WhatWeStandForProps) {
    const [loading, setLoading] = useState(!previewConfig);
    const [cmsConfig, setCmsConfig] = useState<any>({
        section_enabled: 1,
        heading_line_1: "WHAT WE STAND FOR",
        heading_line_1_enabled: 1,
        heading_line_2: "Six Things We Will Never Compromise On",
        heading_line_2_enabled: 1,
        card_1_enabled: 1,
        card_1_title: "Carefully Chosen Fabrics",
        card_1_content: "We believe a great shirt starts with the right fabric . Every collection is selected for its look , feel , and everyday performance , helping you choose with confidence .",
        card_2_enabled: 1,
        card_2_title: "Timeless Style",
        card_2_content: "Trends come and go , but good style always stays . Our fabrics are chosen to suit every occasion , making them easy to wear today and for years to come .",
        card_3_enabled: 1,
        card_3_title: "Attention To Every Detail",
        card_3_content: "From fabric selection to the final finish , every detail matters . We believe small details create a better experience every time you wear our fabrics .",
        card_4_enabled: 1,
        card_4_title: "Made For Everyday Wear",
        card_4_content: "Your shirt should never stay in the wardrobe . Our fabrics are selected to suit everyday life , offering a balance of appearance , ease , and reliability .",
        card_5_enabled: 1,
        card_5_title: "Honest Fabric Selection",
        card_5_content: "We don't believe in confusing choices or unnecessary claims . We focus on offering fabrics that are carefully selected , clearly presented , and worth your trust .",
        card_6_enabled: 1,
        card_6_title: "Relationships Before Sales",
        card_6_content: "Every order is the beginning of a relationship . We value every customer by offering honest guidance , dependable service , and fabrics you can confidently choose again .",
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/about-page/what-we-stand-for`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        if (data.data) {
                            setCmsConfig(data.data);
                        } else {
                            setCmsConfig({ section_enabled: 0 });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching What We Stand For config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    if (loading) {
        return <div className="bg-footers md:py-24 py-16 w-full flex items-center justify-center min-h-[50vh]"></div>;
    }

    const activeConfig = previewConfig || cmsConfig;

    if (activeConfig.section_enabled === 0 && !previewConfig) {
        return null;
    }

    const allPillars = [
        {
            enabled: activeConfig.card_1_enabled,
            icon: <Star className="w-5 h-5 text-secondary" />,
            title: activeConfig.card_1_title,
            description: activeConfig.card_1_content
        },
        {
            enabled: activeConfig.card_2_enabled,
            icon: <Shirt className="w-5 h-5 text-secondary" />,
            title: activeConfig.card_2_title,
            description: activeConfig.card_2_content
        },
        {
            enabled: activeConfig.card_3_enabled,
            icon: <User className="w-5 h-5 text-secondary" />,
            title: activeConfig.card_3_title,
            description: activeConfig.card_3_content
        },
        {
            enabled: activeConfig.card_4_enabled,
            icon: <Leaf className="w-5 h-5 text-secondary" />,
            title: activeConfig.card_4_title,
            description: activeConfig.card_4_content
        },
        {
            enabled: activeConfig.card_5_enabled,
            icon: <ShieldCheck className="w-5 h-5 text-secondary" />,
            title: activeConfig.card_5_title,
            description: activeConfig.card_5_content
        },
        {
            enabled: activeConfig.card_6_enabled,
            icon: <Heart className="w-5 h-5 text-secondary" />,
            title: activeConfig.card_6_title,
            description: activeConfig.card_6_content
        }
    ];

    const activePillars = allPillars.filter(p => p.enabled === 1);

    return (
        <div className="bg-footers md:py-24 px-6 sm:px-12 lg:px-16 py-16 w-full flex flex-col font-sans">
            <div className="w-full mb-12 md:mb-16">
                {activeConfig.heading_line_1_enabled === 1 && activeConfig.heading_line_1 && (
                    <h2 className="mb-8 uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-secondary leading-[1.1] transform scale-y-150 origin-center">
                        {activeConfig.heading_line_1}
                    </h2>
                )}
                {activeConfig.heading_line_2_enabled === 1 && activeConfig.heading_line_2 && (
                    <h1 className="text-secondary font-instrumentserif text-3xl sm:text-3xl md:text-4xl lg:text-5xl transform scale-y-160 origin-left tracking-tight">
                        {activeConfig.heading_line_2}
                    </h1>
                )}
            </div>

            {activePillars.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
                    {activePillars.map((pillar, index) => (
                        <div
                            key={index}
                            className="border border-secondary/15 rounded-xl p-6 md:p-8 flex flex-col gap-4 bg-white/1 transition-all duration-300 ease-out hover:bg-[#373737] hover:border-secondary hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                        >
                            <div className="flex items-center gap-3">
                                {pillar.icon}
                                <h3 className="text-secondary font-medium text-lg md:text-xl font-sans tracking-wide">
                                    {pillar.title}
                                </h3>
                            </div>

                            <p className="text-secondary/70 text-sm md:text-base font-normal leading-relaxed whitespace-pre-wrap">
                                {pillar.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Whatwestandfor;
