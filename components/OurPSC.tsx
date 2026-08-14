"use client"
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string, fallback: string) => {
    if (!img) return fallback;
    if (img.startsWith("/uploads")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
        return `${baseUrl}${img}`;
    }
    return img;
};

interface OurPSCProps {
    previewConfig?: any;
}

function OurPSC({ previewConfig }: OurPSCProps = {}) {
    const textRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
    const cardRefs = useRef<{ [key: number]: HTMLAnchorElement | null }>({})
    
    // Store global screen-relative mouse coordinate
    const globalMouseY = useRef<number>(0)

    const animData = useRef<{
        [key: number]: {
            targetY: number;
            currentY: number;
            isHovered: boolean;
        }
    }>({
        1: { targetY: 0, currentY: 0, isHovered: false },
        2: { targetY: 0, currentY: 0, isHovered: false },
        3: { targetY: 0, currentY: 0, isHovered: false }
    })

    const [cmsConfig, setCmsConfig] = useState({
        section_name: "OUR PRODUCTS / OUR STORY / OUR COMMUNITY",
        card_1_title: "OUR PRODUCTS",
        card_1_image: "/images/home/products.webp",
        card_1_enabled: 1,
        card_2_title: "OUR STORY",
        card_2_image: "/images/home/story.webp",
        card_2_enabled: 1,
        card_3_title: "OUR COMMUNITY",
        card_3_image: "/images/home/community.webp",
        card_3_enabled: 1,
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/our-psc`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Our PSC CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    // Central calculation logic using global viewport coordinate vs current bounding box
    const calculateTargetY = (cardElement: HTMLAnchorElement, clientY: number) => {
        const rect = cardElement.getBoundingClientRect()
        const containerHeight = rect.height
        const relativeY = clientY - rect.top
        return relativeY - (containerHeight / 2)
    }

    const handleMouseEnter = (id: number) => {
        if (animData.current[id]) {
            animData.current[id].isHovered = true
        }
    }

    const handleMouseLeave = (id: number) => {
        if (animData.current[id]) {
            animData.current[id].targetY = 0
            animData.current[id].isHovered = false
        }
    }

    useEffect(() => {
        let animationFrameId: number;

        // 1. Global track window mouse movements
        const handleGlobalMouseMove = (e: MouseEvent) => {
            globalMouseY.current = e.clientY
        }
        window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })

        // 2. Clear out animation frames safely on load
        Object.keys(animData.current).forEach((stringId) => {
            const id = Number(stringId)
            animData.current[id] = { targetY: 0, currentY: 0, isHovered: false }
            const element = textRefs.current[id]
            if (element) element.style.transform = 'translateY(-50%)'
        })

        // 3. Core animation loop running at up to 120fps
        const updatePositions = () => {
            Object.keys(animData.current).forEach((stringId) => {
                const id = Number(stringId)
                const data = animData.current[id]
                const card = cardRefs.current[id]
                const element = textRefs.current[id]

                if (!data || !element || !card) return

                if (data.isHovered) {
                    // Instantly recalculate position relative to layout shifts/scrolls
                    data.targetY = calculateTargetY(card, globalMouseY.current)
                }

                // Snap/Interpolation math logic (0.25 easing constant)
                data.currentY += (data.targetY - data.currentY) * 0.25
                element.style.transform = `translateY(calc(-50% + ${data.currentY}px))`
            });

            animationFrameId = requestAnimationFrame(updatePositions)
        }

        animationFrameId = requestAnimationFrame(updatePositions)

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [])

    if (activeConfig.is_enabled === 0 && !previewConfig) return null;

    const pscData = [
        ...(activeConfig.card_1_enabled === 1 ? [{
            id: 1,
            label: activeConfig.card_1_title,
            imageSrc: resolveImageUrl(activeConfig.card_1_image, "/images/home/products.webp"),
            altText: "Premium collection",
            hasOverlayText: true,
            leftLinkText: "COLLECTIONS",
            rightLinkText: "( SHOP NOW )",
            href: "/shop"
        }] : []),
        ...(activeConfig.card_2_enabled === 1 ? [{
            id: 2,
            label: activeConfig.card_2_title,
            imageSrc: resolveImageUrl(activeConfig.card_2_image, "/images/home/story.webp"),
            altText: "Behind the scenes craftsmanship and heritage",
            hasOverlayText: true,
            leftLinkText: "About us",
            rightLinkText: "( Read More )",
            href: "/about"
        }] : []),
        ...(activeConfig.card_3_enabled === 1 ? [{
            id: 3,
            label: activeConfig.card_3_title,
            imageSrc: resolveImageUrl(activeConfig.card_3_image, "/images/home/community.webp"),
            altText: "Community",
            hasOverlayText: true,
            leftLinkText: "Contact",
            rightLinkText: "( Connect )",
            href: "/contact"
        }] : [])
    ];

    return (
        <section className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 md:py-24 w-full flex justify-center overflow-hidden border-t-2 border-bg-light-blue group/container'>
            <div className={`w-full grid grid-cols-1 ${pscData.length === 3 ? 'md:grid-cols-3' : pscData.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-10 md:gap-6 lg:gap-8`}>
                {pscData.map((item) => (
                    <div key={item.id} className='flex flex-col group/card w-full'>
                        
                        <h2 className='mb-6 uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center'>
                            {item.label}
                        </h2>

                        <Link 
                            href={item.href} 
                            ref={(el) => { cardRefs.current[item.id] = el }}
                            onMouseEnter={() => handleMouseEnter(item.id)}
                            onMouseLeave={() => handleMouseLeave(item.id)}
                            className='relative w-full aspect-4/5 overflow-hidden rounded-sm block cursor-pointer bg-[#F4EFEA] shadow-sm transform-gpu'
                        >
                            <Image
                                src={item.imageSrc}
                                alt={item.altText}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 33vw"
                                className='object-cover object-center transition-transform duration-700 ease-out lg:group-hover/card:scale-105 select-none pointer-events-none will-change-transform'
                                unoptimized
                            />

                            {item.hasOverlayText && (
                                <div 
                                    ref={(el) => { 
                                        if (el) {
                                            textRefs.current[item.id] = el
                                        } else {
                                            delete textRefs.current[item.id]
                                        }
                                    }}
                                    className="hidden lg:flex absolute inset-x-0 top-1/2 items-center justify-between px-4 w-full z-10 select-none
                                        pointer-events-none will-change-transform transition-opacity duration-400 ease-out
                                        opacity-0 group-hover/card:opacity-100"
                                    style={{
                                        transform: 'translateY(-50%)'
                                    }}
                                >
                                    <span className='text-light text-xs sm:text-sm font-semibold tracking-widest uppercase italic font-sans'>
                                        {item.leftLinkText}
                                    </span>
                                    <span className='text-light text-xs sm:text-sm font-medium tracking-wider uppercase font-sans'>
                                        {item.rightLinkText}
                                    </span>
                                </div>
                            )}

                            <div className="absolute inset-0 transition-colors duration-300 ease-out pointer-events-none bg-black/15 lg:bg-black/10 lg:group-hover/card:bg-black/30" />
                        </Link>

                        {item.hasOverlayText && (
                            <Link 
                                href={item.href}
                                className='flex lg:hidden justify-between items-center w-full mt-4 px-1 text-light/80 hover:text-bg-blue transition-colors'
                            >
                                <span className='text-xs font-bold tracking-widest uppercase italic font-sans border-b border-light/20 pb-0.5'>
                                    {item.leftLinkText}
                                </span>
                                <span className='text-xs font-bold tracking-wider uppercase font-sans text-bg-blue'>
                                    {item.rightLinkText}
                                </span>
                            </Link>
                        )}                      
                    </div>
                ))}
            </div>
        </section>
    )
}

export default OurPSC;
