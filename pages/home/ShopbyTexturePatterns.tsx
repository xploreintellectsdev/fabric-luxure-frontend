"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useWishlist } from "../../context/wishlistContext";
import { useCart } from "../../context/cartContext";
import toast from 'react-hot-toast';

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
  descriptions?: { title?: string | null; text: string; number: number }[];
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

interface ShopbyTexturePatternsProps {
  previewConfig?: { section_name: string; is_enabled: number };
}

function ShopbyTexturePatterns({ previewConfig }: ShopbyTexturePatternsProps = {}) {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [activeProductTypeId, setActiveProductTypeId] = useState<number>(0);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [typePage, setTypePage] = useState<number>(0);
  const [typesPerPage, setTypesPerPage] = useState<number>(100);

  useEffect(() => {
    const updateTypesPerPage = () => {
      setTypesPerPage(window.innerWidth < 768 ? 2 : 100);
      setTypePage(0);
    };
    updateTypesPerPage();
    window.addEventListener('resize', updateTypesPerPage);
    return () => window.removeEventListener('resize', updateTypesPerPage);
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cmsConfig, setCmsConfig] = useState({ section_name: "SHOP BY", is_enabled: 1 });

  // Selection popup states
  const [activeItem, setActiveItem] = useState<Product | null>(null);
  const [showShirtPopup, setShowShirtPopup] = useState(false);

  // Size selection states
  const [fitStyle, setFitStyle] = useState("Classic");
  const [shirtSizes, setShirtSizes] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState('S');

  // Custom size inputs
  const [customChest, setCustomChest] = useState('');
  const [customLength, setCustomLength] = useState('');
  const [customShoulder, setCustomShoulder] = useState('');
  const [customSleeve, setCustomSleeve] = useState('');



  // Fetch active shirt sizes dynamically depending on selected fit style
  useEffect(() => {
    if (!showShirtPopup) return;

    const fetchSizesForFit = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/shirt-sizes/active?fitStyle=${fitStyle}`);
        const data = await res.json();
        if (res.ok && data.success && data.data?.length > 0) {
          setShirtSizes(data.data);
          setSelectedSize(data.data[0].size_name);
        } else {
          setShirtSizes([
            { size_chart_id: 1, size_name: 'S' },
            { size_chart_id: 2, size_name: 'M' },
            { size_chart_id: 3, size_name: 'L' },
            { size_chart_id: 4, size_name: 'XL' }
          ]);
          setSelectedSize('S');
        }
      } catch (err) {
        console.error("❌ Failed to fetch shirt sizes in products catalog:", err);
        setShirtSizes([
          { size_chart_id: 1, size_name: 'S' },
          { size_chart_id: 2, size_name: 'M' },
          { size_chart_id: 3, size_name: 'L' },
          { size_chart_id: 4, size_name: 'XL' }
        ]);
        setSelectedSize('S');
      }
    };
    fetchSizesForFit();
  }, [showShirtPopup, fitStyle]);

  const handleAddToCartClick = async (item: Product) => {
    setActiveItem(item);
    const pType = (item.product_type_name || "").toLowerCase();
    const isShirt = pType === "shirt" || pType === "shirts" || (!item.product_type_name && !item.pro_name.toLowerCase().includes("towel"));

    if (isShirt) {
      setFitStyle("Classic"); // Default back to Classic fit style on dialog launch
      setShowShirtPopup(true);
    } else {
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
    }
  };

  const handleNumberInputChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
      setter(val);
    }
  };

  const confirmShirtCart = async () => {
    if (!activeItem) return;

    const cartData: any = {
      pro_id: activeItem.pro_id,
      fit_style: fitStyle,
      quantity: 1,
      pro_name: activeItem.pro_name,
      price: activeItem.price,
      pro_img: activeItem.pro_img,
      cover_description: activeItem.cover_description,
      pro_type_name: activeItem.product_type_name,
      stitching_price: activeItem.stitching_price
    };

    if (selectedSize === 'CUSTOM') {
      if (!customChest || !customLength || !customShoulder || !customSleeve) {
        toast.error("Please enter all four measurements (Chest, Length, Shoulder, Sleeve).");
        return;
      }
      const chestVal = parseFloat(customChest);
      const lengthVal = parseFloat(customLength);
      const shoulderVal = parseFloat(customShoulder);
      const sleeveVal = parseFloat(customSleeve);

      if (isNaN(chestVal) || chestVal <= 0 ||
        isNaN(lengthVal) || lengthVal <= 0 ||
        isNaN(shoulderVal) || shoulderVal <= 0 ||
        isNaN(sleeveVal) || sleeveVal <= 0) {
        toast.error("All measurements must be positive numbers.");
        return;
      }

      cartData.selected_size = 'CUSTOM';
      cartData.is_custom = 1;
      cartData.custom_chest = customChest;
      cartData.custom_length = customLength;
      cartData.custom_shoulder = customShoulder;
      cartData.custom_sleeve = customSleeve;
    } else {
      cartData.selected_size = selectedSize;
      cartData.is_custom = 0;
    }

    await addToCart(cartData);
    setShowShirtPopup(false);
    setActiveItem(null);
    setCustomChest('');
    setCustomLength('');
    setCustomShoulder('');
    setCustomSleeve('');
  };



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
          if (fetchedTypes.length > 0) {
            setActiveProductTypeId(fetchedTypes[0].pro_type_id);
          }
          setCategories((catData.data || []).filter((c: any) => c.is_active !== 0));
          setProducts((prodData.data || []).filter((p: any) => p.is_active !== 0));
        }
      } catch (err) {
        console.error("Failed to load Shop By Category Grid backend data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCMSConfig = async () => {
      if (previewConfig) return;
      try {
        const res = await fetch(`${API_URL}/api/home-page/shop-by`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCmsConfig(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching Shop By CMS config:", error);
      }
    };

    fetchCategoriesAndProducts();
    fetchCMSConfig();
  }, [previewConfig]);

  const activeConfig = previewConfig || cmsConfig;

  const activeTypeObj = productTypes.find(t => t.pro_type_id === activeProductTypeId);
  const activeTypeName = activeTypeObj ? activeTypeObj.product_type : "";

  const currentCategories = categories
    .filter(c => c.pro_type_id === activeProductTypeId)
    .map(c => c.category_name);

  const activeCategoryName = currentCategories[selectedCategoryIndex % currentCategories.length];
  const activeCategoryObj = categories.find(c => c.category_name === activeCategoryName);

  const activeProducts = products
    .filter(p => activeCategoryObj && p.cat_id === activeCategoryObj.cat_id)
    .slice(0, 3);

  useEffect(() => {
    setCurrentCardIndex(0);
  }, [selectedCategoryIndex, activeProductTypeId]);

  const handleModeSwitch = (typeId: number) => {
    setActiveProductTypeId(typeId);
    setSelectedCategoryIndex(0);
  };

  const handlePrevClick = () => {
    if (window.innerWidth < 768) {
      if (currentCardIndex > 0) {
        setCurrentCardIndex((prev) => prev - 1);
      } else {
        const prevIndex =
          selectedCategoryIndex === 0
            ? currentCategories.length - 1
            : selectedCategoryIndex - 1;
        setSelectedCategoryIndex(prevIndex);
      }
    } else {
      const prevIndex =
        selectedCategoryIndex === 0
          ? currentCategories.length - 1
          : selectedCategoryIndex - 1;
      setSelectedCategoryIndex(prevIndex);
    }
  };

  const handleNextClick = () => {
    if (window.innerWidth < 768) {
      if (currentCardIndex < activeProducts.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        const nextIndex =
          selectedCategoryIndex === currentCategories.length - 1
            ? 0
            : selectedCategoryIndex + 1;
        setSelectedCategoryIndex(nextIndex);
      }
    } else {
      const nextIndex =
        selectedCategoryIndex === currentCategories.length - 1
          ? 0
          : selectedCategoryIndex + 1;
      setSelectedCategoryIndex(nextIndex);
    }
  };


  if (categories.length === 0) {
    return null; // Gracefully hide the section if no categories exist
  }

  if (activeConfig.is_enabled === 0 && !previewConfig) {
      return null; // Hide if disabled and not in preview mode
  }

  return (
    <>
      <section className="w-full px-6 sm:px-12 lg:px-16 py-16 md:py-24 bg-tertiary flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="w-full flex flex-col">
          {/* Header text aligned correctly */}
      <div className="w-full text-center px-4 md:px-0">
        <h2 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center mb-8 md:mb-12 mt-4 md:mt-8">
          {activeConfig.section_name}
        </h2>
            <div className="flex items-center justify-center gap-4 mt-4 mb-10">
              {/* Previous Button - Mobile Only */}
              <div className="md:hidden">
                <button
                  type="button"
                  disabled={typePage === 0}
                  onClick={() => setTypePage(typePage - 1)}
                  className="p-1 text-bg-grey hover:bg-charcoal/20 rounded-full disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Previous Product Types"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {productTypes.slice(typePage * typesPerPage, (typePage + 1) * typesPerPage).map((type, localIdx) => {
                const isActive = activeProductTypeId === type.pro_type_id;
                return (
                  <React.Fragment key={type.pro_type_id}>
                    {localIdx > 0 && <div className="w-px h-8 bg-charcoal self-center" />}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch(type.pro_type_id)}
                      className={`transform scale-y-150 origin-center font-instrumentserif text-lg md:text-2xl uppercase select-none cursor-pointer border-none bg-transparent outline-none transition-all duration-300
                                              ${isActive ? "italic text-bg-blue font-normal underline" : "text-bg-grey hover:text-bg-grey"}`}
                    >
                      {type.product_type}
                    </button>
                  </React.Fragment>
                );
              })}

              {/* Next Button - Mobile Only */}
              <div className="md:hidden">
                <button
                  type="button"
                  disabled={(typePage + 1) * typesPerPage >= productTypes.length}
                  onClick={() => setTypePage(typePage + 1)}
                  className="p-1 text-bg-grey hover:bg-charcoal/20 rounded-full disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Next Product Types"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Core Component Workspace Grid Layout Wrapper */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-2 relative w-full pl-0 lg:pl-4 self-start flex flex-col overflow-hidden box-border">
              <style>{`
              .custom-category-list::-webkit-scrollbar {
                width: 4px;
              }
              .custom-category-list::-webkit-scrollbar-track {
                background: #0A192F;
                border-radius: 10px;
              }
              .custom-category-list::-webkit-scrollbar-thumb {
                background-color: #D4AF37;
                border-radius: 10px;
                border-top: 10px solid #0A192F;
                border-bottom: 10px solid #0A192F;
                background-clip: padding-box;
              }
              .custom-category-list::-webkit-scrollbar-thumb:hover {
                background-color: #E6C068;
              }
              .custom-category-list {
                scrollbar-width: thin;
                scrollbar-color: #D4AF37 #0A192F;
                overflow-x: hidden;
              }
            `}</style>

              <div className="hidden lg:block absolute left-0 top-3 bottom-3 w-0.75 bg-[#E6C068]/20 rounded-full overflow-hidden">
                <div
                  className="w-full bg-gradient-to-b from-[#D4AF37] to-[#E6C068] rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    height: `${100 / Math.max(1, Math.min(8, currentCategories.length))}%`,
                    transform: `translateY(${(selectedCategoryIndex % Math.max(1, Math.min(8, currentCategories.length))) * 100}%)`,
                  }}
                />
              </div>

              <div className="overflow-y-auto overflow-x-hidden custom-category-list flex flex-col gap-2.5 w-full h-fit max-h-[358px] pr-4 box-border">
                {currentCategories.map((cat, idx) => {
                  const isSelected = idx === selectedCategoryIndex;
                  return (
                    <div
                      key={cat}
                      className="w-full lg:h-10 flex items-center justify-start shrink-0 box-border"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryIndex(idx)}
                        className={`w-full text-center lg:text-left font-sans text-xs lg:text-sm tracking-widest uppercase transition-all duration-300 select-none cursor-pointer font-bold px-4 lg:px-5 py-3 rounded-full whitespace-nowrap truncate box-border shadow-sm
                                                ${isSelected
                            ? "text-[#0C1A3F] bg-gradient-to-r from-[#D4AF37] to-[#E6C068] lg:translate-x-3"
                            : "bg-[#F3ECE3]/10 lg:bg-transparent text-light/70 hover:text-[#D4AF37]"
                          }`}
                      >
                        {cat}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Hand Dynamic Card Window Node Viewport */}
            <div className="lg:col-span-10 flex flex-col w-full overflow-hidden mt-4 lg:mt-0">
              {activeProducts.length === 0 ? (
                <div className="text-center py-20 text-light/50 text-sm font-sans w-full">
                  No products found in this category.
                </div>
              ) : (
                <div
                  className="w-full flex md:grid md:grid-cols-3 gap-6 items-start transition-transform duration-500 ease-in-out"
                  style={{
                    transform:
                      typeof window !== "undefined" && window.innerWidth < 768
                        ? `translateX(calc(-${currentCardIndex * 100}% - ${currentCardIndex * 24}px))`
                        : "none",
                  }}
                >
                  {activeProducts.map((imgItem, idx) => (
                    <div
                      key={imgItem.pro_id}
                      onClick={() => { router.push(`/productdetailviewpage?id=${imgItem.pro_id}`) }}
                      className="w-full md:w-auto shrink-0 flex flex-col group cursor-pointer animate-fade-in"
                    >
                      <div className="relative w-full aspect-4/5 overflow-hidden rounded-md bg-[#F4EFEA] shadow-xs">
                        <Image
                          src={resolveImageUrl(imgItem.pro_img)}
                          fill
                          sizes="(max-w-768px) 100vw, (max-w-1024px) 33vw, 30vw"
                          alt={imgItem.pro_name}
                          className="object-cover object-center transition-transform duration-700 ease-out lg:group-hover:scale-105 select-none pointer-events-none"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/5 lg:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none z-10" />

                        {/* Desktop Overlay Content Info Panel */}
                        <div
                          className="hidden lg:block absolute bottom-4 left-4 right-4 bg-tertiary p-4 rounded-sm shadow-md border border-gray-100/50 font-sans transition-all duration-300 ease-in-out z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-light tracking-wide leading-snug">
                                {imgItem.pro_name}
                              </h3>
                              <p className="mt-1.5 text-xs sm:text-sm text-Pinball font-light leading-relaxed max-w-52.5 line-clamp-2">
                                {imgItem.cover_description || (imgItem.descriptions && imgItem.descriptions[0]?.text) || ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-light transition-all duration-300 ease-in-out p-1 shrink-0 bg-transparent rounded-full hover:bg-gray-50"
                              aria-label="View details"
                            >
                              <ArrowUpRight className="w-4 h-4 stroke-[1.5]" />
                            </button>
                          </div>
                          <div className="mt-3 sm:mt-4 flex justify-between items-end pt-2 border-t border-charcoal/5">
                            <span className="text-base sm:text-lg font-bold text-brown">
                              Rs. {imgItem.price}/-
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(imgItem.pro_id);
                                }}
                                className={`p-1.5 border rounded-md transition-colors bg-transparent cursor-pointer ${isWishlisted(imgItem.pro_id)
                                  ? "border-red-500 text-red-500"
                                  : "border-light text-light hover:bg-white hover:text-black"
                                  }`}
                                aria-label="Save to wishlist"
                              >
                                <Heart
                                  className="w-3.5 h-3.5 stroke-[1.5]"
                                  fill={isWishlisted(imgItem.pro_id) ? "currentColor" : "none"}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCartClick(imgItem);
                                }}
                                className="p-1.5 border border-light rounded-md text-light hover:bg-white hover:text-black cursor-pointer transition-colors"
                                aria-label="Add to cart"
                              >
                                <ShoppingCart className="w-3.5 h-3.5 stroke-[1.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Structural Fallback Data Description Frame */}
                      <div className="block lg:hidden mt-4 px-1 font-sans w-full text-left">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-base font-medium text-light tracking-wide leading-tight line-clamp-1">
                            {imgItem.pro_name}
                          </h3>
                          <span className="text-base font-bold text-brown whitespace-nowrap">
                            Rs. {imgItem.price}/-
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-Pinball font-light line-clamp-2 leading-relaxed">
                          {imgItem.cover_description || (imgItem.descriptions && imgItem.descriptions[0]?.text) || ""}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-light">
                          <span className="text-xs uppercase tracking-wider font-semibold text-bg-blue flex items-center gap-0.5">
                            View Product{" "}
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(imgItem.pro_id);
                              }}
                              className={`p-2 border rounded-md transition-colors bg-transparent ${isWishlisted(imgItem.pro_id)
                                ? "border-red-500 text-red-500"
                                : "border-light text-light active:bg-gray-100"
                                }`}
                              aria-label="Save to wishlist"
                            >
                              <Heart
                                className="w-3.5 h-3.5 stroke-[1.5]"
                                fill={isWishlisted(imgItem.pro_id) ? "currentColor" : "none"}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCartClick(imgItem);
                              }}
                              className="p-2 border border-light rounded-md text-light active:bg-gray-100"
                              aria-label="Add to cart"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Slider Controller Button Handles Row - moved outside the grid layout for perfect sidebar-gallery vertical height match */}
          <div className="w-full flex justify-end items-center gap-3 mt-6 lg:mt-10">
            <button
              type="button"
              onClick={handlePrevClick}
              disabled={activeProducts.length === 0}
              className="w-11 h-11 rounded-md border border-charcoal/10 bg-white disabled:opacity-50 flex items-center justify-center text-charcoal hover:bg-[#F4EFEA] hover:border-bg-blue/20 transition-all active:scale-95 cursor-pointer shadow-xs z-30"
              aria-label="Previous Item Slider Trigger"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleNextClick}
              disabled={activeProducts.length === 0}
              className="w-11 h-11 rounded-md border border-charcoal/10 bg-white disabled:opacity-50 flex items-center justify-center text-charcoal hover:bg-[#F4EFEA] hover:border-bg-blue/20 transition-all active:scale-95 cursor-pointer shadow-xs z-30"
              aria-label="Next Item Slider Trigger"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* Shirt Size Selector Popup */}
      {showShirtPopup && activeItem && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm bg-[#0b1426] border border-white/10 rounded-xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => { setShowShirtPopup(false); setActiveItem(null); }}
              className="absolute top-4 right-4 text-Pinball hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold uppercase tracking-wider text-light mb-4">
              Select Shirt Options
            </h3>
            <p className="text-xs text-Pinball mb-4">{activeItem.pro_name}</p>

            {/* Select Fit Style */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Select Fit Style</label>
              <select
                value={fitStyle}
                onChange={(e) => setFitStyle(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-md border border-white/10 bg-[#08142c] text-light focus:outline-none focus:border-bg-blue transition-colors cursor-pointer"
              >
                <option value="Classic">Classic</option>
                <option value="Slim">Slim</option>
              </select>
            </div>

            {/* Select Size Label */}
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold font-mono">Select Size</label>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {shirtSizes.map((sizeObj) => (
                <button
                  key={sizeObj.size_chart_id}
                  type="button"
                  onClick={() => setSelectedSize(sizeObj.size_name)}
                  className={`w-12 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${selectedSize === sizeObj.size_name
                    ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                    : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                    }`}
                >
                  {sizeObj.size_name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedSize('CUSTOM')}
                className={`px-4 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${selectedSize === 'CUSTOM'
                  ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                  : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                  }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Size subform */}
            {selectedSize === 'CUSTOM' && (
              <div className="bg-[#07122a] border border-white/5 rounded-md p-4 grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Chest', value: customChest, setter: setCustomChest },
                  { label: 'Length', value: customLength, setter: setCustomLength },
                  { label: 'Shoulder', value: customShoulder, setter: setCustomShoulder },
                  { label: 'Sleeve', value: customSleeve, setter: setCustomSleeve }
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-wider text-[#D3D3D3]/60">{field.label} *</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={field.value}
                        onChange={handleNumberInputChange(field.setter)}
                        placeholder="0.0"
                        className="w-full pl-2 pr-10 py-1 h-8 text-xs placeholder:text-[#D3D3D3]/30 text-white rounded border border-white/10 bg-[#08142c] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                      <span className="absolute right-2 text-[8px] text-[#D3D3D3]/55 font-semibold select-none">
                        In
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={confirmShirtCart}
              className="w-full h-10 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-bold uppercase tracking-widest rounded-md cursor-pointer transition-colors mt-2"
            >
              Confirm & Add
            </button>
          </div>
        </div>
      )}


    </>
  );
}

export default ShopbyTexturePatterns;
