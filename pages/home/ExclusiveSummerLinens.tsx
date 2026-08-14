"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Heart, ShoppingCart, X } from 'lucide-react'
import { useWishlist } from '../../context/wishlistContext'
import { useCart } from '../../context/cartContext'
import toast from 'react-hot-toast'

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

interface ExclusiveSummerProps {
    previewConfig?: { section_name: string; is_enabled: number };
}

function ExclusiveSummerLinens({ previewConfig }: ExclusiveSummerProps = {}) {
    const router = useRouter();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    const [cmsConfig, setCmsConfig] = useState({
        section_name: "EXCLUSIVE SUMMER LINENS",
        is_enabled: 1
    });

    useEffect(() => {
        const fetchCMSConfig = async () => {
            if (previewConfig) return;
            try {
                const res = await fetch(`${API_URL}/api/home-page/exclusive-summer`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCmsConfig(data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Exclusive Summer CMS config:", error);
            }
        };

        fetchCMSConfig();
    }, [previewConfig]);

    const activeConfig = previewConfig || cmsConfig;

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
        const fetchExclusiveLinens = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                const resData = await res.json();
                if (res.ok && resData.success) {
                    const exclusiveList = (resData.data || []).filter(
                        (p: any) => (p.is_exclusive === 1 || p.is_exclusive === true) && p.is_active !== 0
                    );
                    setProducts(exclusiveList.slice(0, 4));
                } else {
                    setError(resData.error || "Failed to load products.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to connect to backend server.");
            } finally {
                setLoading(false);
            }
        };

        fetchExclusiveLinens();
    }, []);


    if (error) {
        return (
            <section className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 md:py-24 w-full flex flex-col items-center overflow-hidden font-sans min-h-[300px] justify-center'>
                <div className='max-w-7xl w-full flex flex-col items-center justify-center'>
                    <h2 className='text-center uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center mb-8'>
                        {activeConfig.section_name}
                    </h2>
                    <div className="text-red-400 font-sans text-xs tracking-wider uppercase">
                        Failed to load Exclusive Linens: {error}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0 || (activeConfig.is_enabled === 0 && !previewConfig)) {
        return null; // Hide the section gracefully if no Exclusive Linens are available or if disabled
    }

    return (
        <>
            <section className='bg-tertiary px-6 sm:px-12 lg:px-16 py-16 md:py-24 w-full flex flex-col items-center overflow-hidden font-sans'>
                <div className='max-w-7xl w-full flex flex-col'>

                    <div className='w-full flex items-center justify-center mb-16 md:mb-20'>
                        <h2 className='text-center uppercase font-instrumentserif text-2xl md:text-3xl lg:text-4xl text-light leading-[1.1] transform scale-y-150 origin-center'>
                            {activeConfig.section_name}
                        </h2>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch w-full'>
                        {products.map((item, idx) => {
                            const isColSpan5 = idx === 0 || idx === 3;
                            const isHeight95 = idx === 0 || idx === 1;

                            const colSpanClass = isColSpan5 ? 'lg:col-span-5' : 'lg:col-span-7';
                            const heightClass = isHeight95 ? 'lg:h-95' : 'lg:h-[380px]';
                            const imageSizes = isColSpan5
                                ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 41vw"
                                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 58vw";

                            return (
                                <div
                                    key={item.pro_id}
                                    onClick={() => { router.push(`/productdetailviewpage?id=${item.pro_id}`) }}
                                    className={`col-span-1 ${colSpanClass} bg-primary rounded-md overflow-hidden flex flex-col justify-between group cursor-pointer shadow-xs`}
                                >
                                    <div className='py-4 px-5 md:p-8 flex flex-col justify-between w-full bg-primary relative z-10 grow'>
                                        <div className='flex justify-between items-start gap-3 md:gap-4 w-full'>
                                            <div className='max-w-[80%]'>
                                                <h3 title={item.pro_name} className='text-[19px] md:text-2xl font-semibold text-light tracking-wide line-clamp-2 md:line-clamp-none'>
                                                    {item.pro_name}
                                                </h3>
                                                <p className='mt-1 md:mt-2 text-Pinball text-[17px] md:text-lg font-light leading-[1.4] md:leading-relaxed max-w-62.5'>
                                                    {item.cover_description || (item.descriptions && item.descriptions[0]?.text) || ""}
                                                </p>
                                            </div>
                                            <button type='button' className='text-light hover:text-black transition-all duration-300 p-1 bg-transparent max-lg:opacity-100 lg:opacity-0 lg:-translate-y-1 group-hover:lg:opacity-100 group-hover:lg:translate-y-0'>
                                                <ArrowUpRight className='w-4 h-4 md:w-5 md:h-5 stroke-[1.5]' />
                                            </button>
                                        </div>
                                        <div className='mt-4 md:mt-6 flex justify-between items-center w-full'>
                                            <span className='text-[19px] md:text-2xl font-bold text-brown'>
                                                Rs. {item.price}/-
                                            </span>
                                            <div className='flex gap-1.5 md:gap-2 max-lg:opacity-100 lg:opacity-0 lg:translate-y-2 group-hover:lg:opacity-100 group-hover:lg:translate-y-0 transition-all duration-300'>
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(item.pro_id);
                                                    }}
                                                    className={`p-2 border rounded-md transition-colors bg-transparent ${isWishlisted(item.pro_id)
                                                        ? 'border-red-500 text-red-500'
                                                        : 'border-light text-light hover:bg-white hover:text-black'
                                                        }`}
                                                >
                                                    <Heart
                                                        className='w-4 h-4 stroke-[1.5]'
                                                        fill={isWishlisted(item.pro_id) ? "currentColor" : "none"}
                                                    />
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCartClick(item);
                                                    }}
                                                    className='p-2 border border-light rounded-md text-light hover:bg-white hover:text-black transition-colors bg-transparent'
                                                >
                                                    <ShoppingCart className='w-4 h-4 stroke-[1.5]' />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`relative w-full aspect-4/3 lg:aspect-auto ${heightClass} overflow-hidden mt-auto shrink-0`}>
                                        <Image
                                            src={resolveImageUrl(item.pro_img)}
                                            fill
                                            sizes={imageSizes}
                                            alt={item.pro_name}
                                            className='object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102'
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            );
                        })}
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
    )
}

export default ExclusiveSummerLinens
