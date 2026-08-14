"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AboutHeroProps {
  previewConfig?: any;
}

function AboutHero({ previewConfig }: AboutHeroProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    is_enabled: 1,
    hero_image: "/images/about-us/about1.webp",
    title_line_1: "Made To Be Worn, Remembered,",
    title_line_2: "And Chosen Again",
    section_description: "A well-chosen fabric stays with you through countless moments. Our collections are thoughtfully selected for men who appreciate refined dressing and lasting value in every wardrobe.",
  });

  useEffect(() => {
    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/about-page/about-hero`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.data) {
              setCmsConfig(data.data);
            } else {
              setCmsConfig({ is_enabled: 0 });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching About Hero config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSConfig();
  }, [previewConfig]);

  if (loading) {
    return <div className="py-24 min-h-[50vh] bg-milk-jug flex items-center justify-center"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;

  if (activeConfig.is_enabled === 0 && !previewConfig) {
    return null;
  }

  // Ensure image URL is absolute if it's from uploads
  const getImageUrl = (path: string) => {
    if (!path) return "/images/about-us/about1.webp";
    if (path.startsWith("http")) return encodeURI(path);
    if (path.startsWith("/uploads")) return encodeURI(`${API_URL}${path}`);
    return encodeURI(path);
  };

  return (
    <div className="w-full bg-milk-jug relative">
      <div className="relative w-full h-[90vh] overflow-hidden">
        <Image
          src={previewConfig?.hero_image instanceof File 
                 ? URL.createObjectURL(previewConfig.hero_image) 
                 : getImageUrl(activeConfig.hero_image)}
          alt="About Us Hero Image"
          fill
          sizes="100vw"
          unoptimized={true}
          className="object-cover object-top"
          priority
        />
        {/* Path Text Overlay */}
        {!previewConfig && (
          <div className="absolute top-0 left-0 w-full z-10 text-black px-0">
            <div className="w-full mx-auto px-6 sm:px-12 lg:px-16 pt-32 md:pt-36 flex justify-start items-center select-none">
              <div className="hidden sm:flex text-md md:text-md lg:text-lg tracking-widest capitalize font-sans font-medium items-center gap-1.5 text-black/70">
                <Link href="/">
                  <span className="hover:text-black transition-colors cursor-pointer">Home</span>
                </Link>
                <span className="text-black font-bold">&gt;</span>
                <span className="text-black font-semibold tracking-wide">about us</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-tertiary relative flex flex-col items-center text-center px-6 py-16 md:py-24">
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-[3px] sm:border-[5px] border-[#8A6500] flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
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

        <div className="mx-auto flex flex-col items-center gap-6 mt-14 sm:mt-20 md:mt-24">
          <h1 className="font-instrumentserif text-3xl md:text-5xl lg:text-6xl text-light tracking-wide leading-[1.15] text-balance transform scale-y-140">
            {activeConfig.title_line_1}
            <br className="hidden md:inline" /> {activeConfig.title_line_2}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-Pinball font-light leading-relaxed mt-2 max-w-4xl">
            {activeConfig.section_description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutHero;
