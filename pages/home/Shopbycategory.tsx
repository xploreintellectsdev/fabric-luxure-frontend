"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
    cat_id: number;
    pro_type_id: number;
    category_name: string;
    category_desc: string;
    category_img: string;
    product_type_name: string;
}

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

// Check if category type name matches tab name (e.g. Shirt matches Shirts, Towel matches Towels)
const isMatchingType = (catTypeName: string, activeTab: string) => {
    if (!catTypeName || !activeTab) return false;
    const catLower = catTypeName.toLowerCase();
    const tabLower = activeTab.toLowerCase();
    return catLower.startsWith(tabLower.slice(0, -1)) || catLower === tabLower;
};

interface ShopbycategoryProps {
    previewConfig?: { section_name: string; is_enabled: number };
}

function Shopbycategory({ previewConfig }: ShopbycategoryProps = {}) {
    const router = useRouter();
    const [productTypes, setProductTypes] = useState<any[]>([]);
    const [activeTypeId, setActiveTypeId] = useState<number | null>(null);
    const [page, setPage] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(4);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [typePage, setTypePage] = useState<number>(0);
    const [typesPerPage, setTypesPerPage] = useState<number>(100);

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cmsConfig, setCmsConfig] = useState({ section_name: "SHOP BY CATEGORY", is_enabled: 1 });

    useEffect(() => {
        const updateItemsPerPage = () => {
            setItemsPerPage(window.innerWidth < 768 ? 2 : 4);
            setTypesPerPage(window.innerWidth < 768 ? 2 : 100);
            setPage(0);
            setTypePage(0);
        };
        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
            try {
                const typeRes = await fetch(`${API_URL}/api/product-types`);
                const typeData = await typeRes.json();

                const catRes = await fetch(`${API_URL}/api/product-categories`);
                const catData = await catRes.json();

                const prodRes = await fetch(`${API_URL}/api/products`);
                const prodData = await prodRes.json();

                if (typeRes.ok && typeData.success && catRes.ok && catData.success && prodRes.ok && prodData.success) {
                    const fetchedTypes = (typeData.data || []).filter((t: any) => t.is_active !== 0);
                    setProductTypes(fetchedTypes);

                    const fetchedCats = (catData.data || []).filter((c: any) => c.is_active !== 0);
                    setCategories(fetchedCats);

                    const fetchedProducts = (prodData.data || []).filter((p: any) => p.is_active !== 0);
                    setProducts(fetchedProducts);

                    // Select the first product type initially
                    if (fetchedTypes.length > 0) {
                        const firstType = fetchedTypes[0];
                        setActiveTypeId(firstType.pro_type_id);

                        // Select the first category belonging to that product type
                        const firstTypeCats = fetchedCats.filter((c: Category) => c.pro_type_id === firstType.pro_type_id);
                        if (firstTypeCats.length > 0) {
                            setActiveCategory(firstTypeCats[0].category_name);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load Shop by Category backend data:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/shop-category`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Shop Category CMS config:", error);
            }
        };

        fetchCategoriesAndProducts();
        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

    // Switch categories when tab type switches
    useEffect(() => {
        if (!loading && categories.length > 0 && activeTypeId !== null) {
            const filtered = categories.filter(c => c.pro_type_id === activeTypeId);
            if (filtered.length > 0) {
                if (!filtered.some(c => c.category_name === activeCategory)) {
                    setActiveCategory(filtered[0].category_name);
                    setPage(0);
                }
            } else {
                setActiveCategory("");
                setPage(0);
            }
        }
    }, [activeTypeId, categories, loading]);

    const currentCategories = categories.filter(c => c.pro_type_id === activeTypeId);
    const visibleCategories = currentCategories.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    const currentCategory = categories.find(c => c.category_name === activeCategory);
    const matchingProduct = currentCategory
        ? products.find(p => p.cat_id === currentCategory.cat_id)
        : null;

    const itemLink = matchingProduct
        ? `/productdetailviewpage?id=${matchingProduct.pro_id}`
        : `/shop`;


    if (categories.length === 0) {
        return null; // Gracefully hide the section if no categories exist
    }

    if (activeConfig.is_enabled === 0 && !previewConfig) {
        return null; // Hide if disabled and not in preview mode
    }

    return (
        <div className='bg-light px-6 sm:px-12 lg:px-16 pt-6 pb-12 md:pt-8 md:pb-16 w-full flex flex-col justify-center overflow-hidden'>
            <div className='mx-auto w-full'>
                <h2 className='text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-scroll-text leading-[1.1] transform scale-y-150 origin-center'>
                    {activeConfig.section_name}
                </h2>

                {/* Product Type Selector */}
                <div className='flex justify-center items-center gap-2 sm:gap-4 mt-8'>
                    {/* Previous Button - Mobile Only */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            disabled={typePage === 0}
                            onClick={() => setTypePage(typePage - 1)}
                            className="p-1 text-scroll-text hover:bg-charcoal/10 rounded-full disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                            aria-label="Previous Product Types"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>

                    {productTypes.slice(typePage * typesPerPage, (typePage + 1) * typesPerPage).map((typeObj) => {
                        const isActive = activeTypeId === typeObj.pro_type_id;
                        return (
                            <button
                                key={typeObj.pro_type_id}
                                type="button"
                                onClick={() => {
                                    setActiveTypeId(typeObj.pro_type_id);
                                    setPage(0);
                                    const cats = categories.filter(c => c.pro_type_id === typeObj.pro_type_id);
                                    if (cats.length > 0) {
                                        setActiveCategory(cats[0].category_name);
                                    }
                                }}
                                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none border shadow-sm hover:-translate-y-[1px] shrink-0
                                    ${isActive
                                        ? 'bg-[#0C1A3F] text-[#F8F4EC] border-[#E6C068]'
                                        : 'bg-[#F8F4EC] text-[#0C1A3F] border-gray-300 hover:bg-[#E6C068] hover:text-[#0C1A3F] hover:border-[#E6C068]'
                                    }`}
                            >
                                {typeObj.product_type}
                            </button>
                        );
                    })}

                    {/* Next Button - Mobile Only */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            disabled={(typePage + 1) * typesPerPage >= productTypes.length}
                            onClick={() => setTypePage(typePage + 1)}
                            className="p-1 text-scroll-text hover:bg-charcoal/10 rounded-full disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                            aria-label="Next Product Types"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className='relative border border-bg-grey p-4 sm:p-8 mt-16 lg:mt-20'>
                    {/* Category Tabs Wrapper with Navigation Arrows */}
                    <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-grey rounded-full p-1.5 w-[92%] sm:w-4/5 md:w-2/3 flex items-center gap-2 shadow-sm border border-[#E0D9CF]/60 px-3 z-20'>
                        {/* Previous Button */}
                        <button
                            type="button"
                            disabled={page === 0}
                            onClick={() => {
                                const prevPage = page - 1;
                                setPage(prevPage);
                                const cats = currentCategories.slice(prevPage * itemsPerPage, (prevPage + 1) * itemsPerPage);
                                if (cats.length > 0) {
                                    setActiveCategory(cats[0].category_name);
                                }
                            }}
                            className="p-1.5 text-scroll-text hover:bg-charcoal/5 rounded-full disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                            aria-label="Previous Category Page"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Visible Category Tabs */}
                        <div className="flex-1 flex gap-2">
                            {visibleCategories.map((cat) => {
                                const isActive = activeCategory === cat.category_name;
                                return (
                                    <div
                                        key={cat.cat_id}
                                        onClick={() => setActiveCategory(cat.category_name)}
                                        className={`relative flex-1 rounded-full py-2 text-center text-[8px] sm:text-sm uppercase font-medium tracking-wider cursor-pointer transition-all duration-300 select-none truncate px-1 group
                                            ${isActive ? 'bg-gradient-to-r from-[#D4AF37] to-[#E6C068] text-[#0C1A3F] shadow-sm' : 'bg-transparent text-gray-500 hover:text-[#D4AF37]'}`}
                                    >
                                        <span className="relative z-10">{cat.category_name}</span>
                                        {!isActive && <span className="absolute bottom-1.5 left-1/2 w-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300 ease-in-out group-hover:w-[40%] group-hover:left-[30%]"></span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <button
                            type="button"
                            disabled={(page + 1) * itemsPerPage >= currentCategories.length}
                            onClick={() => {
                                const nextPage = page + 1;
                                setPage(nextPage);
                                const cats = currentCategories.slice(nextPage * itemsPerPage, (nextPage + 1) * itemsPerPage);
                                if (cats.length > 0) {
                                    setActiveCategory(cats[0].category_name);
                                }
                            }}
                            className="p-1.5 text-scroll-text hover:bg-charcoal/5 rounded-full disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                            aria-label="Next Category Page"
                        >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    <div className='w-full mt-4'>
                        {currentCategory ? (
                            <>
                                <div
                                    onClick={() => { router.push(itemLink) }}
                                    className='relative w-full aspect-video min-h-87.5 sm:min-h-112.5 md:min-h-125 rounded-xl overflow-hidden shadow-sm cursor-pointer'
                                >
                                    <Image
                                        src={resolveImageUrl(currentCategory.category_img)}
                                        alt={currentCategory.category_name}
                                        fill
                                        priority
                                        className='object-cover object-center'
                                        unoptimized
                                    />
                                    <div className='absolute top-[45%] left-1/2 -translate-x-1/2 w-[88%] max-w-85 sm:max-w-105 sm:left-auto sm:right-[2%] sm:translate-x-0 sm:w-auto flex items-center z-10' onClick={(e) => e.stopPropagation()}>
                                        <div className='absolute -top-5 -left-11 bg-bg-blue text-light p-2.5 sm:p-3.5 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform z-20 translate-x-1/2 -translate-y-1 shrink-0'
                                            onClick={() => { router.push(itemLink) }}>
                                            <Plus size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className='bg-primary py-3 px-4 sm:p-7 pl-6 sm:pl-14 rounded-lg shadow-xl border border-charcoal/5 flex flex-col justify-center min-h-[75px] sm:min-h-[130px]'>
                                            <p className="text-[13px] sm:text-base lg:text-[17px] text-Pinball font-normal leading-[1.4] sm:leading-[1.7] text-left">
                                                {currentCategory.category_desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-row justify-between items-center gap-6 mt-6 px-1 w-full'>
                                    <div className='min-w-0 text-left'>
                                        <h3
                                            onClick={() => { router.push(itemLink) }}
                                            className='text-base sm:text-[26px] lg:text-[28px] text-tertiary tracking-tight leading-none font-semibold cursor-pointer hover:underline'
                                        >
                                            {currentCategory.category_name}
                                        </h3>
                                    </div>
                                    <div className='shrink-0'>
                                        <Link
                                            href={itemLink}
                                            className='flex items-center gap-1.5 text-xs sm:text-sm font-medium uppercase tracking-wider text-bg-blue hover:opacity-80 transition-opacity pb-1'
                                        >
                                            <span>View Product</span>
                                            <ArrowUpRight size={16} strokeWidth={2} />
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-scroll-text/50 text-sm">
                                No categories found for this product type.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Shopbycategory;
