"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WhereItBeginProps {
  previewConfig?: any;
}

function WhereItBegin({ previewConfig }: WhereItBeginProps) {
  const [loading, setLoading] = useState(!previewConfig);
  const [cmsConfig, setCmsConfig] = useState<any>({
    is_enabled: 1,
    image_path: "/images/about-us/where-it-begin.webp",
    heading: "WHERE IT BEGAN?",
    heading_enabled: 1,
    title: "Built On A Simple Belief",
    title_enabled: 1,
    quote: "\"Good clothing begins long before the first stitch . It begins with choosing the right fabric . That idea inspired everything we do at Fabric Luxure.\"",
    quote_enabled: 1,
    paragraph_1: "Fabric Luxure was created with one purpose : to make choosing fabric easier and more meaningful . We understand that every customer looks for something different , whether it's for work , family occasions , or everyday wear . That's why we focus on carefully selected collections that combine timeless style with dependable quality .",
    paragraph_1_enabled: 1,
    paragraph_2: "Every fabric we offer represents our commitment to thoughtful choices , honest work , and lasting relationships with the people who trust our brand.",
    paragraph_2_enabled: 1,
    paragraph_3: "From premium cotton and linen blends to modern printed collections, we ensure every fabric is selected for its comfort, durability, and refined finish.",
    paragraph_3_enabled: 1,
  });

  useEffect(() => {
    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/about-page/where-it-began`, { cache: 'no-store' });
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
        console.error("Error fetching Where It Began config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSConfig();
  }, [previewConfig]);

  if (loading) {
    return <div className="py-10 md:py-24 min-h-[50vh] bg-primary flex items-center justify-center"></div>;
  }

  const activeConfig = previewConfig || cmsConfig;

  if (activeConfig.is_enabled === 0 && !previewConfig) {
    return null;
  }

  const getImageUrl = (path: string) => {
    if (!path) return "/images/about-us/where-it-begin.webp";
    if (path.startsWith("http")) return encodeURI(path);
    if (path.startsWith("/uploads")) return encodeURI(`${API_URL}${path}`);
    return encodeURI(path);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-auto bg-primary md:items-stretch">
      <div className="w-full md:w-1/2 px-6 sm:px-12 lg:pl-16 lg:pr-12 py-10 md:py-24 flex flex-col justify-center gap-4 lg:gap-6">
        {activeConfig.heading_enabled === 1 && activeConfig.heading && (
          <h2 className="uppercase font-instrumentserif text-3xl md:text-4xl lg:text-5xl text-light leading-[1.1] transform scale-y-150 origin-center">
            {activeConfig.heading}
          </h2>
        )}
        {activeConfig.title_enabled === 1 && activeConfig.title && (
          <span className="font-instrumentserif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-light leading-[1.15] tracking-tight font-normal transform scale-y-130 origin-left my-2 md:my-1 text-balance">
            {activeConfig.title}
          </span>
        )}
        {activeConfig.quote_enabled === 1 && activeConfig.quote && (
          <p className="font-square-peg italic text-3xl sm:text-4xl md:text-4xl lg:text-6xl text-brown leading-tight ">
            {activeConfig.quote}
          </p>
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
      </div>
      <div className="w-full md:w-1/2 aspect-square relative min-h-87.5 md:min-h-0">
        <Image
          src={previewConfig?.image_path instanceof File 
                 ? URL.createObjectURL(previewConfig.image_path) 
                 : getImageUrl(activeConfig.image_path)}
          alt="Where It Began"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={true}
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}

export default WhereItBegin;
