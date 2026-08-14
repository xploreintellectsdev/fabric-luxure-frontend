"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const imageDeck = [
  {
    id: 1,
    src: "/images/about-us/img-1.webp",
    alt: "Linen Dining Scene",
    layoutClasses: `
    top-[16%] left-[8%] h-[60%] w-[90%]
    md:top-[15vh] md:left-[25%] md:h-[80%] object-top md:w-[68%] aspect-[4/3] z-40
    lg:top-[15vh] lg:left-[50vh] lg:h-[90%] lg:w-[70%]`,
  },
  {
    id: 2,
    src: "/images/about-us/img-3.webp",
    alt: "Right Window Framing",
    layoutClasses: `
    top-[18%] left-[6%] h-[60%] w-[90%]
    md:top-[32vh] md:left-[37%] md:h-[70%] md:w-[58%] aspect-[4/3] z-30
    lg:top-[30vh] lg:left-[27%] lg:h-[90%] lg:w-[70%]`,
  },
  {
    id: 3,
    src: "/images/about-us/img-2.webp",
    alt: "Linen Field Detail",
    layoutClasses: `
    top-[20%] left-[4%] h-[60%] w-[90%]
    md:top-[21vh] md:left-[12%] md:h-[70%] md:w-[58%] aspect-[4/3] z-20
    lg:top-[20vh] lg:left-[25vh] lg:h-[80%]`,
  },
  {
    id: 4,
    src: "/images/about-us/img-4.webp",
    alt: "Main Featured Linen Model",
    layoutClasses: `
    top-[22%] left-[2%] h-[60%] w-[90%]
    md:top-[15vh] md:left-[15%] md:h-[80%] object-cover md:w-[72%] aspect-[4/3] z-10
    lg:top-[16vh] lg:left-[25%] lg:h-[82vh] lg:w-[150vh]`,
  }
]

interface ExperienceTheLinenProps {
  previewConfig?: any;
  previewMode?: boolean;
}

function ExperienceTheLinen({ previewConfig, previewMode = false }: ExperienceTheLinenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [dbConfig, setDbConfig] = useState<any>(null)
  const [loading, setLoading] = useState(!previewConfig)

  useEffect(() => {
    if (previewConfig) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/about-page/experience-linen`);
        const json = await res.json();
        if (json.success && json.data) {
          setDbConfig(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch Experience The Linen:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [previewConfig]);

  const activeConfig = previewConfig || dbConfig;

  const isPreview = previewMode;

  useEffect(() => {
    if (isPreview) return;

    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const totalScrollable = rect.height - windowHeight
      const scrolled = -rect.top

      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isPreview])

  // Admin Preview isolated scroll handler
  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;

    const progress = maxScroll > 0
      ? target.scrollTop / maxScroll
      : 0;

    setScrollProgress(Math.max(0, Math.min(1, progress)));
  };

  if (loading) {
    return (
      <div className="w-full bg-light py-24 animate-pulse min-h-screen flex items-center justify-center">
        <div className="h-[400px] w-full max-w-4xl bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!activeConfig || (!previewConfig && activeConfig.is_enabled !== 1)) {
    return null;
  }

  const getImageUrl = (path: string, fallbackId: number) => {
    if (!path) return `/images/about-us/img-${fallbackId === 2 ? 3 : fallbackId === 3 ? 2 : fallbackId}.webp`;
    if (path.startsWith("http")) return encodeURI(path);
    if (path.startsWith("/uploads")) return encodeURI(`${API_URL}${path}`);
    if (path.startsWith("blob:")) return path; // for local preview
    return encodeURI(path);
  };

  const previewHeightClass = "h-[70vh] lg:h-[80vh]";

  const innerContent = (
    <>
    <div className="relative w-full h-full max-w-7xl mx-auto ">
        <div className="absolute inset-0 flex flex-col items-center pb-10 justify-center text-center px-6 z-0">
          <div className="max-w-4xl mx-auto flex flex-col items-center pt-10">
            <div className='w-full'>
              <div
                className="m-auto z-20 w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-[3px] sm:border-[5px] border-[#8A6500] relative flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
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
            {activeConfig.title_line_1_enabled === 1 && (
              <h2 className="font-instrumentserif mt-10 text-3xl md:text-5xl lg:text-7xl text-scroll-text tracking-wide leading-[1.15] text-balance transform scale-y-140">
                {activeConfig.title_line_1}
                {activeConfig.title_line_2_enabled === 1 && (
                  <>
                    <br />{activeConfig.title_line_2}
                  </>
                )}
              </h2>
            )}
            {activeConfig.title_line_1_enabled !== 1 && activeConfig.title_line_2_enabled === 1 && (
              <h2 className="font-instrumentserif mt-10 text-3xl md:text-5xl lg:text-7xl text-scroll-text tracking-wide leading-[1.15] text-balance transform scale-y-140">
                {activeConfig.title_line_2}
              </h2>
            )}
            {activeConfig.section_description_enabled === 1 && (
              <p className="text-primary mt-10 text-base sm:text-lg lg:text-xl font-light max-w-2xl leading-relaxed tracking-wide mb-10 antialiased text-balance">
                {activeConfig.section_description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto mt-2">
              <Link 
                href="/shop" 
                className="group bg-gradient-to-r from-[#C89B2B] to-[#E6C068] border border-[#E6C068]/50 rounded-[14px] px-6 py-3.5 uppercase flex items-center gap-2 cursor-pointer text-[#0C1A3F] font-medium tracking-wide shadow-md shadow-[#C89B2B]/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:to-[#F7E08A] hover:shadow-lg hover:shadow-[#C89B2B]/40"
              >
                Explore Collection <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/contact" 
                className="group bg-transparent border border-[#C89B2B] rounded-[14px] px-6 py-3.5 uppercase flex items-center gap-2 cursor-pointer text-[#0C1A3F] font-medium tracking-wide transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#C89B2B] hover:to-[#E6C068] hover:border-transparent hover:shadow-lg hover:shadow-[#C89B2B]/40"
              >
                Contact Us <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
        {imageDeck.map((image, index) => {
          const startThreshold = index * 0.22
          const endThreshold = startThreshold + 0.22

          let yTranslation = 0
          if (scrollProgress > startThreshold) {
            const itemProgress = Math.min(1, (scrollProgress - startThreshold) / (endThreshold - startThreshold))
            yTranslation = itemProgress * -120
          }

          const dbImageKey = `image_${image.id}` as keyof typeof activeConfig;
          const currentImgPath = activeConfig[dbImageKey] as string;

          return (
            <div
              key={image.id}
              style={{ transform: `translateY(${yTranslation}vh)` }}
              className={`absolute rounded-2xl overflow-hidden border border-[#EAE3D8]/60 bg-milk-jug shadow-2xl transition-transform duration-75 ease-out ${image.layoutClasses}`}
            >
              <div className="w-full h-full relative">
                <Image
                  src={getImageUrl(currentImgPath, image.id)}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 45vw"
                  className="object-cover object-center"
                  priority={index === 0}
                  unoptimized={getImageUrl(currentImgPath, image.id).includes('localhost') || getImageUrl(currentImgPath, image.id).includes('127.0.0.1')}
                />
              </div>
            </div>
          )
        })}

          </div>
    </>
  );

  return (
    <div className={isPreview ? "admin-experience-preview h-[650px] overflow-y-auto overflow-x-hidden custom-scrollbar" : ""} onScroll={isPreview ? handlePreviewScroll : undefined}>
      {isPreview ? (
        <div className="experience-scroll-content relative w-full h-[300vh] bg-light pb-10">
          <div className="experience-sticky-viewport sticky top-0 h-[650px] w-full overflow-hidden">
            {innerContent}
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="relative w-full bg-light pb-10 h-[300vh]">
          <div className="w-full overflow-hidden sticky top-0 h-screen">
            {innerContent}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExperienceTheLinen
