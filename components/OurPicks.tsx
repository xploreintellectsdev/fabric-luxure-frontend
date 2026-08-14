"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image'
import { useWishlist } from '../context/wishlistContext'
import { useCart } from '../context/cartContext'
import QuickAddModal from './QuickAddModal';

interface Product {
    pro_id: number;
    cat_id: number;
    pro_name: string;
    price: number;
    pro_img: string;
    cover_description?: string;
    is_top_pics: number | boolean;
    is_exclusive: number | boolean;
    category_name: string;
    product_type_name: string;
    descriptions?: { title?: string | null; text: string; number: number }[];
    specifications?: { key: string; value: string }[];
    additionalImages?: string[];
    standard_size?: string;
    stitching_price?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    
    if (!img) return "/images/home/cat-01.webp";
    if (img.startsWith("/uploads")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
        return `${baseUrl}${img}`;
    }
    return img;
};

interface OurPicksProps {
    previewConfig?: { section_name: string; is_enabled: number };
}

function OurPicks({ previewConfig }: OurPicksProps = {}) {
    const router = useRouter();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [isPaused, setIsPaused] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cmsConfig, setCmsConfig] = useState({ section_name: "OUR TOP PICKS", is_enabled: 1 });

    // Selection popup states
    const [showQuickAddPopup, setShowQuickAddPopup] = useState(false);
    const [activeItem, setActiveItem] = useState<Product | null>(null);

    const handleAddToCartClick = async (item: Product) => {
        setActiveItem(item);
        const pType = (item.product_type_name || "").toLowerCase();
        const isTowel = pType === "towel" || pType === "towels" || item.pro_name.toLowerCase().includes("towel");

        if (isTowel) {
            // Directly add towel to cart with standard size
            await addToCart({
                pro_id: item.pro_id,
                quantity: 1,
                selected_meter: item.standard_size || null,
                is_custom: 0,
                pro_name: item.pro_name,
                price: item.price,
                pro_img: item.pro_img,
                cover_description: item.cover_description,
                pro_type_name: item.product_type_name,
      stitching_price: item.stitching_price
            });
            setActiveItem(null);
        } else {
            setShowQuickAddPopup(true);
        }
    };

    useEffect(() => {
        const fetchTopPicks = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                const resData = await res.json();
                if (res.ok && resData.success) {
                    const topPicks = (resData.data || []).filter(
                        (p: any) => (p.is_top_pics === 1 || p.is_top_pics === true) && p.is_active !== 0
                    );
                    setProducts(topPicks);
                } else {
                    setError(resData.error || "Failed to load products.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to connect to backend server.");
            } finally {
                setLoading(false);
            }
        };

        const fetchCMSConfig = async () => {
            if (previewConfig) return; // Skip fetch if in preview mode
            try {
                const res = await fetch(`${API_URL}/api/home-page/top-picks`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Top Picks CMS config:", error);
            }
        };

        fetchTopPicks();
        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    if (error) {
        return (
            <div className='bg-tertiary py-8 md:py-15 w-full flex flex-col justify-center items-center overflow-hidden min-h-[300px]'>
                <h2 className='text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center mb-8'>
                    {activeConfig.section_name}
                </h2>
                <div className="text-red-400 font-sans text-xs tracking-wider uppercase">
                    Failed to load Top Picks: {error}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Hide the carousel gracefully if no Top Picks are available
    }

    // Pad base list to at least 4 items so that repeating it 3 times makes a smooth infinite loop
    let baseList = [...products];
    while (baseList.length < 4 && baseList.length > 0) {
        baseList = [...baseList, ...products];
    }
    const combinedList = [...baseList, ...baseList, ...baseList];

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null; // Hide if disabled and not in preview mode
    }

    return (
        <>
            <div className='bg-tertiary py-16 md:py-24 lg:py-28 w-full flex flex-col justify-center overflow-hidden'>
                <div>
                    <h2 className='text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center'>
                        {activeConfig.section_name}
                    </h2>
                    <div className='w-full my-14 overflow-hidden relative'>
                        <div
                            className="flex gap-4 sm:gap-8 w-max py-4"
                            style={{
                                animation: "marquee-reverse 25s linear infinite",
                                animationPlayState: isPaused ? "paused" : "running",
                                willChange: "transform",
                            }}
                        >
                            {combinedList.map((d, index) => {
                                return (
                                    <div
                                        key={`${d.pro_id}-${index}`}
                                        className="relative group shrink-0 overflow-hidden rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer flex flex-col sm:block bg-[#081529]/60 border border-white/5 sm:bg-transparent sm:border-none w-[240px] sm:w-auto"
                                        onMouseEnter={() => setIsPaused(true)}
                                        onMouseLeave={() => setIsPaused(false)}
                                        onClick={() => { router.push(`/productdetailviewpage?id=${d.pro_id}`) }}
                                    >
                                        {/* Image Wrapper - Restored previous taller aspect height */}
                                        <div className="relative w-full h-[280px] sm:w-[320px] sm:h-[420px] overflow-hidden sm:rounded-xl">
                                            <Image
                                                src={resolveImageUrl(d.pro_img)}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 320px"
                                                alt={d.pro_name}
                                                className="object-cover rounded-xl"
                                                unoptimized
                                            />
                                        </div>

                                        {/* Expanded Info Overlay with luxury dark navy gold styling */}
                                        <div className="relative p-4 font-sans opacity-100 transition-all duration-300 ease-in-out z-10 sm:absolute sm:bottom-5 sm:left-5 sm:right-5 sm:bg-[#081529]/95 sm:backdrop-blur-md sm:p-6 sm:rounded-xl sm:border sm:border-white/10 sm:shadow-lg sm:max-w-[280px] sm:opacity-0 sm:group-hover:opacity-100">
                                            <div className="flex justify-between items-start gap-3">
                                                <div>
                                                    <h2 className="text-[16px] sm:text-[18px] font-semibold text-white leading-snug tracking-wide">
                                                        {d.pro_name}
                                                    </h2>
                                                    <p className="hidden sm:block mt-3 text-[14px] text-white/70 font-light leading-relaxed max-w-62.5 line-clamp-3">
                                                        {d.cover_description || (d.descriptions && d.descriptions[0]?.text) || ""}
                                                    </p>
                                                </div>

                                                <button className="text-white/60 hover:text-white transition-colors p-0.5 shrink-0" aria-label="View Product">
                                                    <ArrowUpRight className="w-5 h-5 stroke-[1.5]" />
                                                </button>
                                            </div>

                                            <div className="mt-3 sm:mt-5 flex justify-between items-center border-t border-white/5 pt-3 sm:pt-4">
                                                <span className="text-[20px] sm:text-[24px] font-bold text-[#D4AF37] whitespace-nowrap">
                                                    Rs. {d.price}/-
                                                </span>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleWishlist(d.pro_id);
                                                        }}
                                                        className={`w-9 h-9 border rounded-full flex items-center justify-center transition-colors bg-white/5 cursor-pointer ${isWishlisted(d.pro_id)
                                                            ? 'border-red-500 text-red-500 bg-red-500/10'
                                                            : 'border-white/10 text-white/80 hover:bg-white hover:text-black hover:border-white'
                                                            }`}
                                                        aria-label="Save to Wishlist"
                                                    >
                                                        <Heart
                                                            className="w-4.5 h-4.5 stroke-[1.5]"
                                                            fill={isWishlisted(d.pro_id) ? "currentColor" : "none"}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCartClick(d);
                                                        }}
                                                        className="w-9 h-9 border border-white/10 rounded-full bg-white/5 text-white/80 hover:bg-white hover:text-black hover:border-white cursor-pointer flex items-center justify-center transition-colors"
                                                        aria-label="Add to Cart"
                                                    >
                                                        <ShoppingCart className="w-4.5 h-4.5 stroke-[1.5]" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <Link href="/shop" className="block w-max mx-auto mt-6">
                        <button type='button' className='bg-gradient-to-r from-[#D4AF37] to-[#E6C068] text-[#0C1A3F] font-semibold tracking-wider text-xs md:text-sm rounded-lg px-8 py-4 uppercase flex items-center gap-2.5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:to-[#F7E08A] hover:shadow-lg hover:shadow-[#C89B2B]/40 active:scale-[0.98] cursor-pointer shadow-md'>
                            View All Products
                            <ArrowUpRight size={18} />
                        </button>
                    </Link>
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
            </div>

            <QuickAddModal
                isOpen={showQuickAddPopup}
                onClose={() => { setShowQuickAddPopup(false); setActiveItem(null); }}
                product={activeItem as any}
            />
        </>
    )
}

export default OurPicks
