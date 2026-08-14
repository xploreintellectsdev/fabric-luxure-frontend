"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface TheMakingProps {
  previewConfig?: any;
}

function TheMaking({ previewConfig }: TheMakingProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    section_enabled: 1,
    section_image: "/images/about-us/the.webp",
    title_line_1: "The Making !",
    title_line_1_enabled: 1,
    title_line_2: "Where Style Begins",
    title_line_2_enabled: 1,
    paragraph_1: "A well-made shirt begins long before it is stitched. It starts with choosing fabrics that suit different lifestyles, seasons, and occasions. From lightweight linen to soft cotton blends, every collection at Fabric Luxure is selected to help you dress with confidence, no matter where the day takes you.",
    paragraph_1_enabled: 1,
    paragraph_2: "We focus on fabrics that offer the right balance of comfort, durability, and style, ensuring they look great while feeling comfortable throughout the day.",
    paragraph_2_enabled: 1,
    paragraph_3: "Our carefully curated collections provide consistent quality, elegant finishes, and versatile designs to meet a wide range of fashion needs.",
    paragraph_3_enabled: 1,
    tags: [
      { text: "100% Linen", enabled: true },
      { text: "Linen Cotton", enabled: true },
      { text: "Pure Cotton", enabled: true },
      { text: "Cotton Blend", enabled: true },
      { text: "Everyday Wear", enabled: true },
      { text: "Formal Wear", enabled: true }
    ],
  });

  useEffect(() => {
    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/about-page/the-making`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.data) {
              // Parse tags if it comes as a string
              let parsedData = { ...data.data };
              if (typeof parsedData.tags === 'string') {
                try {
                  parsedData.tags = JSON.parse(parsedData.tags);
                } catch (e) {
                  parsedData.tags = [];
                }
              }
              setCmsConfig(parsedData);
            } else {
              setCmsConfig({ section_enabled: 0 });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching The Making config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSConfig();
  }, [previewConfig]);

  if (loading) {
    return <div className="bg-primary md:py-24 py-16 w-full flex items-center justify-center min-h-[50vh]"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;

  if (activeConfig.section_enabled === 0 && !previewConfig) {
    return null;
  }

  // Handle parsing tags if activeConfig receives raw tags from admin preview
  let activeTags = [];
  if (Array.isArray(activeConfig.tags)) {
    activeTags = activeConfig.tags;
  } else if (typeof activeConfig.tags === 'string') {
    try {
      activeTags = JSON.parse(activeConfig.tags);
    } catch (e) {
      activeTags = [];
    }
  }

  const enabledTags = activeTags.filter((t: any) => t.enabled);

  const getImageUrl = (path: string) => {
    if (!path) return "/images/about-us/the.webp";
    if (path.startsWith("http")) return encodeURI(path);
    if (path.startsWith("/uploads")) return encodeURI(`${API_URL}${path}`);
    return encodeURI(path);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-auto md:aspect-2/1 bg-primary md:items-stretch">
      <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative min-h-87.5 md:min-h-0">
        <Image
          src={getImageUrl(activeConfig.section_image)}
          alt="Where It Began - Pure Linen Craftsmanship"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center"
          priority
          unoptimized
        />
      </div>
      <div className="w-full md:w-1/2 px-6 sm:px-12 lg:pr-16 lg:pl-12 py-10 md:py-24 flex flex-col justify-center gap-4 lg:gap-6">
        {activeConfig.title_line_1_enabled === 1 && activeConfig.title_line_1 && (
          <span className="uppercase font-instrumentserif text-3xl md:text-4xl lg:text-5xl text-light leading-[1.1] transform scale-y-150 origin-center block">
            {activeConfig.title_line_1}
          </span>
        )}
        {activeConfig.title_line_2_enabled === 1 && activeConfig.title_line_2 && (
          <h2 className="font-instrumentserif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-light leading-[1.15] tracking-tight font-normal transform scale-y-130 origin-left my-2 md:my-1 text-balance">
            {activeConfig.title_line_2}
          </h2>
        )}
        <div className="flex flex-col gap-5 mt-3 text-base sm:text-lg lg:text-xl text-Pinball leading-relaxed font-light">
          {activeConfig.paragraph_1_enabled === 1 && activeConfig.paragraph_1 && (
            <p className="whitespace-pre-wrap">{activeConfig.paragraph_1}</p>
          )}
          {activeConfig.paragraph_2_enabled === 1 && activeConfig.paragraph_2 && (
            <p className="whitespace-pre-wrap">{activeConfig.paragraph_2}</p>
          )}
          {activeConfig.paragraph_3_enabled === 1 && activeConfig.paragraph_3 && (
            <p className="whitespace-pre-wrap">{activeConfig.paragraph_3}</p>
          )}
        </div>
        {enabledTags.length > 0 && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 mt-6">
            {enabledTags.map((t: any, i: number) => {
              return (
                <div
                  className="group flex items-center justify-center rounded-full gap-2 px-2 sm:px-5 py-2 text-[11px] sm:text-sm md:text-base font-medium uppercase tracking-wide 
                             bg-[#E6C068]/10 border border-[#E6C068]/30 text-[#E6C068] backdrop-blur-sm w-full sm:w-auto
                             transition-all duration-300 ease-in-out cursor-default
                             hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#C89B2B] hover:to-[#F7E08A] hover:text-[#0C1A3F] hover:shadow-[0_4px_15px_rgba(230,192,104,0.3)] hover:border-transparent"
                  key={i}
                >
                  <div className="w-1.5 h-1.5 bg-current rounded-full transition-colors duration-300 shrink-0"></div>
                  <span className="truncate">{t.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TheMaking;
