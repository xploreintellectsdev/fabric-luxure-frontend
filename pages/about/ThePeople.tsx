"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ThePeopleProps {
  previewConfig?: any;
}

function ThePeople({ previewConfig }: ThePeopleProps) {
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [loading, setLoading] = useState(!previewConfig);

  useEffect(() => {
    if (previewConfig) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/about-page/the-people`);
        const json = await res.json();
        if (json.success && json.data) {
          setDbConfig(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch The People config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [previewConfig]);

  const activeConfig = previewConfig || dbConfig;

  if (loading) {
    return (
      <div className="w-full bg-tertiary px-4 sm:px-8 md:px-16 lg:px-16 py-16 md:py-24 border-b-2 border-bg-light-blue animate-pulse">
        <div className="h-[600px] bg-gray-800 rounded-xl max-w-6xl mx-auto"></div>
      </div>
    );
  }

  if (!activeConfig || (!previewConfig && activeConfig.is_enabled !== 1)) {
    return null;
  }

  const getImageUrl = (path: string) => {
    if (!path) return "/images/about-us/thepeople.webp";
    if (path.startsWith("http")) return encodeURI(path);
    if (path.startsWith("/uploads")) return encodeURI(`${API_URL}${path}`);
    return encodeURI(path);
  };

  return (
    <div className="w-full bg-tertiary px-4 sm:px-8 md:px-16 lg:px-16 py-16 md:py-24 border-b-2 border-bg-light-blue">
      <div className="w-full mx-auto flex flex-col items-center text-center">
        {activeConfig.title_line_1_enabled === 1 && activeConfig.title_line_1 && (
          <h2 className="uppercase font-instrumentserif text-3xl md:text-4xl lg:text-5xl text-light leading-[1.1] transform scale-y-150 origin-center mb-5">
            {activeConfig.title_line_1}
          </h2>
        )}
        
        {activeConfig.title_line_2_enabled === 1 && activeConfig.title_line_2 && (
          <span className="mt-4 font-instrumentserif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-light leading-[1.15] tracking-tight font-normal transform scale-y-130 origin-left my-2 md:my-1 text-balance">
            {activeConfig.title_line_2}
          </span>
        )}
        
        <div className="w-full rounded-xl mt-10 overflow-hidden shadow-sm bg-footers">
          <div className="w-full relative aspect-video md:aspect-21/9 lg:aspect-16/7">
            <Image
              src={getImageUrl(activeConfig.section_image)}
              alt="The VL Global Craftsmanship Team"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
              unoptimized
            />
          </div>
          
          {(activeConfig.content_paragraph_1_enabled === 1 || activeConfig.content_paragraph_2_enabled === 1) && (
            <div className="bg-black-wash px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 text-left">
              <p className="text-Pinball font-light text-base sm:text-lg lg:text-xl tracking-wide leading-relaxed">
                {activeConfig.content_paragraph_1_enabled === 1 && activeConfig.content_paragraph_1 && (
                  <span>{activeConfig.content_paragraph_1}</span>
                )}
                
                {activeConfig.content_paragraph_1_enabled === 1 && activeConfig.content_paragraph_2_enabled === 1 && activeConfig.content_paragraph_1 && activeConfig.content_paragraph_2 && (
                  <br />
                )}
                
                {activeConfig.content_paragraph_2_enabled === 1 && activeConfig.content_paragraph_2 && (
                  <span>{activeConfig.content_paragraph_2}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThePeople;
