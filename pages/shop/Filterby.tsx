"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Category, ProductType } from './shop'

interface FilterbyProps {
    selectedProductTypeId?: number | null;
    onProductTypeIdChange?: (id: number | null) => void;
    productTypes?: ProductType[];
    selectedCategory?: Category | null;
    onCategorySelect?: (cat: Category | null) => void;
    visibleCategories?: Category[];
}

function Filterby({
    selectedProductTypeId = null,
    onProductTypeIdChange = () => { },
    productTypes = [],
    selectedCategory = null,
    onCategorySelect = () => { },
    visibleCategories = []
}: FilterbyProps) {
    const [isPaused, setIsPaused] = useState(false);

    const useCarousel = visibleCategories.length >= 6;

    // Helper to handle category click (unselects if clicked again)
    const handleCategoryClick = (cat: Category) => {
        if (selectedCategory?.id === cat.id) {
            onCategorySelect(null);
        } else {
            onCategorySelect(cat);
        }
    };

    // NEVER duplicate category cards. Each category appears only once.
    const carouselItems = visibleCategories;

    // Dynamic animation duration calculation to maintain constant pixels-per-second speed.
    // - 16 items -> 30s
    // - 8 items -> 7s
    // Linear interpolation: duration = max(5, Math.round(N * 2.875 - 16))
    const animationDurationSecs = Math.max(5, Math.round(carouselItems.length * 2.875 - 16));

    return (
        <div className='w-full mt-8'>
            <div className='flex justify-between items-center pt-2 px-6 sm:px-12 lg:px-16'>
                <h2 className="text-base md:text-lg font-400 uppercase text-light tracking-wider">
                    Shop By Category
                </h2>
                <div className="relative inline-block">
                    <select
                        value={selectedProductTypeId ?? "All"}
                        onChange={(e) => {
                            const val = e.target.value;
                            onProductTypeIdChange(val === "All" ? null : parseInt(val, 10));
                        }}
                        className="appearance-none text-base md:text-lg font-normal uppercase text-light bg-transparent border border-light/60 hover:border-light focus:border-light outline-none pl-4 pr-10 py-2 rounded-md cursor-pointer tracking-wider transition-colors duration-200"
                    >
                        <option value="All" className="text-Pinball bg-bg-light-blue">All</option>
                        {productTypes.map((type) => (
                            <option key={type.id} value={type.id} className="text-Pinball bg-bg-light-blue">
                                {type.name}
                            </option>
                        ))}
                    </select>

                    {/* Custom Pro Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-light">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Categories Showcase Container */}
            {!useCarousel ? (
                /* Center Aligned categories when count is less than 6 */
                <div className="flex justify-center flex-wrap gap-4 mt-8 px-6 sm:px-12 lg:px-16 w-full">
                    {visibleCategories.map((cat) => {
                        const isSelected = selectedCategory?.id === cat.id;
                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className={`group relative w-[calc((100vw-64px)/2)] md:w-[calc((100vw-128px)/3)] lg:w-[calc((100vw-208px)/6)] aspect-square rounded-md overflow-hidden cursor-pointer shadow-xs transition-all duration-300
                                    ${isSelected ? 'ring-2 ring-bg-blue scale-105' : 'bg-[#F4EFEA]'}`}
                            >
                                <Image
                                    src={cat.imgUrl}
                                    alt={cat.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-w-1024px) 33vw, 16vw"
                                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 select-none pointer-events-none"
                                    unoptimized
                                />
                                <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-bg-blue/40' : 'bg-black/30 group-hover:bg-black/40'}`} />
                                <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                                    <h3 className="text-light font-sans text-[10px] md:text-xs tracking-widest uppercase font-bold drop-shadow-xs leading-tight">
                                        {cat.name}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Carousel mode - scrolls in one direction infinitely with no duplicate category cards */
                <div
                    className="w-full overflow-hidden mt-8 relative select-none px-6 sm:px-12 lg:px-16"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <style>{`
                        @keyframes scrollLeftSingle {
                            0% {
                                transform: translateX(0);
                            }
                            100% {
                                transform: translateX(calc(-100% + 100vw - 128px));
                            }
                        }
                        .animate-shop-scroll-single {
                            display: flex;
                            gap: 16px;
                            width: max-content;
                            animation: scrollLeftSingle 30s linear infinite;
                        }
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                    <div
                        className="flex gap-4 no-scrollbar animate-shop-scroll-single"
                        style={{
                            animationPlayState: isPaused ? 'paused' : 'running',
                            animationDuration: `${animationDurationSecs}s`
                        }}
                    >
                        {carouselItems.map((cat, index) => {
                            const isSelected = selectedCategory?.id === cat.id;
                            return (
                                <div
                                    key={`${cat.id}-${index}`}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`group relative w-[calc((100vw-64px)/2)] md:w-[calc((100vw-128px)/3)] lg:w-[calc((100vw-208px)/6)] aspect-square rounded-md overflow-hidden cursor-pointer shadow-xs shrink-0 transition-all duration-300
                                        ${isSelected ? 'ring-2 ring-bg-blue scale-105' : 'bg-[#F4EFEA]'}`}
                                >
                                    <Image
                                        src={cat.imgUrl}
                                        alt={cat.name}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-w-1024px) 33vw, 16vw"
                                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 select-none pointer-events-none"
                                        unoptimized
                                    />
                                    <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-bg-blue/40' : 'bg-black/30 group-hover:bg-black/40'}`} />
                                    <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                                        <h3 className="text-light font-sans text-[10px] md:text-xs tracking-widest uppercase font-bold drop-shadow-xs leading-tight">
                                            {cat.name}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Filterby;
