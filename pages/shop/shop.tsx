"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Products from './products';
import WhereComfortMeets from '../../components/WhereComfortMeets';
import Filterby from './Filterby';

export interface ProductType {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    productTypeId: number;
    name: string;
    imgUrl: string;
}

export interface Product {
    id: number;
    categoryId: number;
    productTypeId: number;
    title: string;
    imgUrl: string;
    price: string;
    desc: string;
    product_type_name?: string;
    stock_quantity?: number;
}

export interface ProductType {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    productTypeId: number;
    name: string;
    imgUrl: string;
}

export interface Product {
    id: number;
    categoryId: number;
    productTypeId: number;
    title: string;
    imgUrl: string;
    price: string;
    desc: string;
    product_type_name?: string;
    stock_quantity?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    if (!img) return "/images/shop/category.webp";
    if (img.startsWith("/uploads")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:5000` : "http://localhost:5000");
        return `${baseUrl}${img}`;
    }
    return img;
};

function Shop() {
    const searchParams = useSearchParams();

    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(24);

    // Responsive pageSize handler
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setPageSize(8); // Mobile (4 before banner, 4 after)
            } else if (window.innerWidth < 1024) {
                setPageSize(16); // Tablet (8 before banner, 8 after)
            } else {
                setPageSize(24); // Desktop (12 before banner, 12 after)
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Save scroll position in real-time
    useEffect(() => {
        const handleScroll = () => {
            sessionStorage.setItem("shop_scroll_y", window.scrollY.toString());
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Save current page to sessionStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("shop_current_page", currentPage.toString());
        }
    }, [currentPage]);

    // Fetch dynamic categories and products
    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const typeRes = await fetch(`${API_URL}/api/product-types`);
                const typeData = await typeRes.json();

                const catRes = await fetch(`${API_URL}/api/product-categories`);
                const catData = await catRes.json();

                const prodRes = await fetch(`${API_URL}/api/products`);
                const prodData = await prodRes.json();

                if (typeRes.ok && typeData.success && catRes.ok && catData.success && prodRes.ok && prodData.success) {
                    const mappedTypes = (typeData.data || [])
                        .filter((t: any) => t.is_active !== 0)
                        .map((t: any) => ({
                            id: t.pro_type_id,
                            name: t.product_type
                        }));
                    setProductTypes(mappedTypes);

                    const mappedCats = (catData.data || [])
                        .filter((c: any) => c.is_active !== 0)
                        .map((c: any) => ({
                            id: c.cat_id,
                            productTypeId: c.pro_type_id,
                            name: c.category_name,
                            imgUrl: resolveImageUrl(c.category_img)
                        }));


                    const mappedProds = (prodData.data || [])
                        .filter((p: any) => p.is_active !== 0)
                        .map((p: any) => ({
                            id: p.pro_id,
                            categoryId: p.cat_id,
                            productTypeId: p.pro_type_id,
                            title: p.pro_name,
                            imgUrl: resolveImageUrl(p.pro_img),
                            price: `Rs. ${p.price}/-`,
                            desc: p.cover_description || "",
                            product_type_name: p.product_type_name,
                            standard_size: p.standard_size,
                            stock_quantity: p.stock_quantity
                        }));

                    setCategories(mappedCats);
                    setProducts(mappedProds);
                }
            } catch (err) {
                console.error("Failed to load Shop page data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, []);

    // Restore filters, page number and scroll position on back/reload navigation
    useEffect(() => {
        if (loading) return;

        const savedType = sessionStorage.getItem("shop_product_type");
        const savedCategory = sessionStorage.getItem("shop_selected_category");
        const savedPage = sessionStorage.getItem("shop_current_page");
        const isBreadcrumbNav = sessionStorage.getItem("shop_breadcrumb_nav") === "true";

        const navigationEntries = performance.getEntriesByType("navigation");
        const navType = navigationEntries[0] ? (navigationEntries[0] as any).type : "";

        if (navType === "back_forward" || navType === "reload" || isBreadcrumbNav) {
            if (isBreadcrumbNav) {
                sessionStorage.removeItem("shop_breadcrumb_nav");
            }
            if (savedType) {
                if (savedType === "All") {
                    setSelectedProductTypeId(null);
                } else {
                    const parsedId = parseInt(savedType, 10);
                    if (!isNaN(parsedId)) {
                        setSelectedProductTypeId(parsedId);
                    }
                }
            }
            if (savedCategory) {
                try {
                    setSelectedCategory(JSON.parse(savedCategory));
                } catch (e) { }
            }
            // Restore page number (skip for breadcrumb nav which always resets to 1)
            if (savedPage && !isBreadcrumbNav) {
                const parsedPage = parseInt(savedPage, 10);
                if (!isNaN(parsedPage) && parsedPage > 1) {
                    setCurrentPage(parsedPage);
                }
            }

            const savedScrollY = sessionStorage.getItem("shop_scroll_y");
            if (savedScrollY && !isBreadcrumbNav) {
                const timer = setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScrollY, 10),
                        behavior: "auto"
                    });
                }, 80);
                return () => clearTimeout(timer);
            }
        } else {
            // Fresh navigation — clear all persisted shop state
            sessionStorage.removeItem("shop_product_type");
            sessionStorage.removeItem("shop_selected_category");
            sessionStorage.removeItem("shop_scroll_y");
            sessionStorage.removeItem("shop_current_page");
            sessionStorage.removeItem("shop_nav_product_ids");
        }
    }, [loading]);

    // Apply URL Parameters (search, productType, category)
    useEffect(() => {
        if (loading || !searchParams) return; // Wait until data is loaded and searchParams is available

        let shouldUpdate = false;

        const qSearch = searchParams.get('search');
        if (qSearch !== null) {
            setSearchQuery(qSearch.toLowerCase());
            shouldUpdate = true;
        } else {
            setSearchQuery("");
        }

        const qProductType = searchParams.get('productType');
        if (qProductType !== null) {
            const parsed = parseInt(qProductType, 10);
            if (!isNaN(parsed) && parsed !== selectedProductTypeId) {
                setSelectedProductTypeId(parsed);
                shouldUpdate = true;
            }
        }

        const qCategory = searchParams.get('category');
        if (qCategory !== null) {
            const parsed = parseInt(qCategory, 10);
            if (!isNaN(parsed)) {
                const cat = categories.find(c => c.id === parsed);
                if (cat && cat.id !== selectedCategory?.id) {
                    setSelectedCategory(cat);
                    // Also auto-select its parent product type to match UI state correctly
                    setSelectedProductTypeId(cat.productTypeId);
                    shouldUpdate = true;
                }
            }
        }

        if (shouldUpdate) {
            setCurrentPage(1);
        }
    }, [searchParams, loading, categories]);

    const handleProductTypeChange = (typeId: number | null) => {
        setSelectedProductTypeId(typeId);
        setSelectedCategory(null); // Reset category selection
        setCurrentPage(1); // Reset pagination
        if (typeof window !== "undefined") {
            sessionStorage.setItem("shop_product_type", typeId === null ? "All" : typeId.toString());
            sessionStorage.removeItem("shop_selected_category");
        }
    };

    const handleCategorySelect = (cat: Category | null) => {
        setSelectedCategory(cat);
        setCurrentPage(1); // Reset pagination
        if (typeof window !== "undefined") {
            if (cat) {
                sessionStorage.setItem("shop_selected_category", JSON.stringify(cat));
            } else {
                sessionStorage.removeItem("shop_selected_category");
            }
        }
    };

    // Filter categories to show in carousel
    const visibleCategories = categories.filter((cat) => {
        if (selectedProductTypeId === null) return true;
        return cat.productTypeId === selectedProductTypeId;
    });

    // Filter products list below
    const filteredProducts = products.filter((prod) => {
        // 1. Search Query Filter
        if (searchQuery) {
            const matchesTitle = prod.title.toLowerCase().includes(searchQuery);
            const matchesDesc = prod.desc.toLowerCase().includes(searchQuery);
            const matchesTypeName = prod.product_type_name?.toLowerCase().includes(searchQuery);

            // If it doesn't match any of the text fields, filter it out
            if (!matchesTitle && !matchesDesc && !matchesTypeName) {
                return false;
            }
        }

        // 2. Category Filter
        if (selectedCategory) {
            return prod.categoryId === selectedCategory.id;
        }

        // 3. Product Type Filter
        if (selectedProductTypeId !== null) {
            return prod.productTypeId === selectedProductTypeId;
        }

        return true;
    });

    // Grouping: Sort filteredProducts if selectedProductTypeId is null (the ALL filter)
    if (selectedProductTypeId === null) {
        filteredProducts.sort((a, b) => {
            const indexA = productTypes.findIndex(t => t.id === a.productTypeId);
            const indexB = productTypes.findIndex(t => t.id === b.productTypeId);
            const posA = indexA === -1 ? 9999 : indexA;
            const posB = indexB === -1 ? 9999 : indexB;
            return posA - posB;
        });
    }

    const totalProductsCount = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProductsCount / pageSize));
    const activePage = Math.min(currentPage, totalPages);

    const startIndex = (activePage - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

    // Always keep the nav ID list in sync so ProductViewHero can do Prev/Next
    // (uses the full filtered list, not just the current page)
    if (typeof window !== "undefined" && filteredProducts.length > 0) {
        sessionStorage.setItem("shop_nav_product_ids", JSON.stringify(filteredProducts.map(p => p.id)));
    }

    const halfSize = Math.ceil(pageSize / 2);
    const firstHalfProducts = paginatedProducts.slice(0, halfSize);
    const secondHalfProducts = paginatedProducts.slice(halfSize);

    // Compute dynamic heading
    const getHeading = () => {
        if (selectedCategory) {
            return selectedCategory.name;
        }
        if (selectedProductTypeId === null) return "All Products";
        const activeType = productTypes.find(t => t.id === selectedProductTypeId);
        return activeType ? activeType.name : "All Products";
    };

    if (loading) {
        return (
            <div className='bg-tertiary py-12 md:py-16 w-full flex flex-col items-center justify-center overflow-hidden font-sans min-h-[600px]'>
                <h1 className="text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center mb-8">
                    ( shop )
                </h1>
                <div className="text-light/60 font-sans text-sm animate-pulse tracking-widest uppercase">
                    Loading Shop Catalog...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='bg-tertiary py-12 md:py-16 w-full flex flex-col items-center justify-center overflow-hidden font-sans'>
                <div className='w-full flex flex-col'>
                    <h1 className="text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
                        shop
                    </h1>
                    <Filterby
                        selectedProductTypeId={selectedProductTypeId}
                        onProductTypeIdChange={handleProductTypeChange}
                        productTypes={productTypes}
                        selectedCategory={selectedCategory}
                        onCategorySelect={handleCategorySelect}
                        visibleCategories={visibleCategories}
                    />
                    {(selectedProductTypeId !== null || selectedCategory !== null) ? (
                        <>
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wider text-light/50 font-sans uppercase px-6 sm:px-12 lg:px-16 mt-10">
                                <span
                                    onClick={() => {
                                        if (selectedCategory !== null) {
                                            handleCategorySelect(null);
                                        } else {
                                            handleProductTypeChange(null);
                                        }
                                    }}
                                    className="hover:text-light cursor-pointer transition-colors"
                                >
                                    {selectedProductTypeId !== null ? (productTypes.find(t => t.id === selectedProductTypeId)?.name || "All") : "All"}
                                </span>
                                {selectedCategory && (
                                    <>
                                        <span className="select-none text-light/30">/</span>
                                        <span className="text-[#D4AF37] font-bold select-none">
                                            {selectedCategory.name}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className='flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-end gap-4 sm:gap-0 mt-4 pt-2 px-6 sm:px-12 lg:px-16'>
                                <h2 className="text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
                                    All Products
                                </h2>
                                <span className="text-sm md:text-base text-light tracking-wide text-center sm:text-right">
                                    Showing {paginatedProducts.length} of {totalProductsCount} Products
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className='flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-end gap-4 sm:gap-0 mt-10 pt-2 px-6 sm:px-12 lg:px-16'>
                            <h2 className="text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center">
                                All Products
                            </h2>
                            <span className="text-sm md:text-base text-light tracking-wide text-center sm:text-right">
                                Showing {paginatedProducts.length} of {totalProductsCount} Products
                            </span>
                        </div>
                    )}
                    {firstHalfProducts.length > 0 ? (
                        <Products list={firstHalfProducts} />
                    ) : (
                        <div className="text-center text-light/50 py-12">No products found.</div>
                    )}
                </div>
            </div>

            {/* Where Comfort Meets Character Banner */}
            {firstHalfProducts.length > 0 && (
                <WhereComfortMeets />
            )}

            {/* Second half of products grid */}
            {secondHalfProducts.length > 0 && (
                <div className='bg-tertiary pt-10 pb-6 w-full flex flex-col items-center justify-center overflow-hidden font-sans'>
                    <div className='w-full flex flex-col'>
                        <Products list={secondHalfProducts} />
                    </div>
                </div>
            )}

            {/* Pagination Controls Footer */}
            <div className='bg-tertiary pb-12 md:pb-16 w-full flex flex-col items-center justify-center overflow-hidden font-sans'>
                <div className='w-full flex flex-col'>
                    <div className="px-6 sm:px-12 lg:px-16">
                        <div
                            className='group mt-12 flex flex-row md:grid md:grid-cols-3 justify-between items-center py-4 md:py-5 px-5 md:px-8 rounded-[14px] transition-shadow duration-[400ms] ease-in-out border border-[#D4AF37]/20 shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.35)]'
                            style={{ background: 'linear-gradient(90deg, #132652 0%, #1C356B 50%, #132652 100%)' }}
                        >
                            <div className="flex justify-start order-1">
                                <p className='text-[#F5F1E8] font-semibold tracking-[1px] uppercase text-sm md:text-[15px]'>
                                    Page {String(activePage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                                </p>
                            </div>

                            <div className="hidden md:flex justify-center order-2">
                                <Image src="/images/FL New Logo Final.png" alt="logo" height={80} width={80} className='h-14 md:h-16 w-auto object-contain brightness-0 invert drop-shadow-[0_0_12px_rgba(212,175,55,0.20)]' />
                            </div>

                            <div className='flex justify-end gap-2 md:gap-3 order-3'>
                                <button
                                    type='button'
                                    disabled={activePage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className='w-9 h-9 md:w-10 md:h-10 rounded-[10px] flex items-center justify-center transition-all duration-[350ms] ease-out disabled:bg-white/12 disabled:text-white/40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none disabled:hover:bg-white/12 bg-[#D4AF37] text-[#132652] hover:bg-[#E6C068] hover:-translate-y-[3px] hover:shadow-[0_8px_18px_rgba(212,175,55,0.45)] active:scale-95 cursor-pointer'
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={20} strokeWidth={2.5} />
                                </button>
                                <button
                                    type='button'
                                    disabled={activePage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className='w-9 h-9 md:w-10 md:h-10 rounded-[10px] flex items-center justify-center transition-all duration-[350ms] ease-out disabled:bg-white/12 disabled:text-white/40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none disabled:hover:bg-white/12 bg-[#D4AF37] text-[#132652] hover:bg-[#E6C068] hover:-translate-y-[3px] hover:shadow-[0_8px_18px_rgba(212,175,55,0.45)] active:scale-95 cursor-pointer'
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Shop;
