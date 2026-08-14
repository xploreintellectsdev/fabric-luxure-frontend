"use client";
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus, Minus, Heart, Ruler, ZoomIn, Layers, ChevronLeft, ChevronRight, Upload, FileText, X, Camera, Loader2, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import SizeChart from './SizeChart'
import MyCart from '../../pages/productDetail/MyCart'
import { useSearchParams, useRouter } from 'next/navigation'
import { useWishlist } from '../../context/wishlistContext'
import { useCart } from '../../context/cartContext'
import MonogramDrawer, { MonogramConfig } from './MonogramDrawer'
import { isMonogramSupported } from '../../utils/monogram'

interface ProductDescription {
    id: number;
    pro_id: number;
    title: string | null;
    text: string;
    number: number;
}

interface ProductSpecification {
    key: string;
    value: string;
}

interface SizeChartTemplate {
    template_id: number;
    template_name: string;
    image_path: string;
}

interface Product {
    pro_id: number;
    cat_id: number;
    pro_name: string;
    price: number;
    pro_img: string;
    cover_description?: string;
    category_name: string;
    product_type_name: string;
    pro_type_id?: number;
    additionalImages?: string[];
    descriptions?: ProductDescription[];
    specifications?: ProductSpecification[];
    size_chart_template?: SizeChartTemplate | null;
    standard_size?: string | null;
    stock_quantity: number;
  stitching_price?: number;
  disclaimer?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
    if (!img) return "/images/productview/collar.webp";
    if (img.startsWith("/uploads")) {
        return `${API_URL}${img}`;
    }
    return img;
};

export default function ProductViewHero() {
    const searchParams = useSearchParams();
    const productIdStr = searchParams ? (searchParams.get('id') || '1') : '1';
    const currentId = parseInt(productIdStr, 10) || 1;

    const editCartId = searchParams ? searchParams.get('edit_cart_id') : null;

    const { isWishlisted, toggleWishlist } = useWishlist();
    const { addToCart, cartItems } = useCart();
    const router = useRouter();
    const wishlisted = isWishlisted(currentId);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedSize, setSelectedSize] = useState('S')
    const [fitStyles, setFitStyles] = useState<any[]>([])
    const [fitStyleId, setFitStyleId] = useState<number | null>(null)

    const [customMeasurements, setCustomMeasurements] = useState({
        chest: '',
        length: '',
        shoulder: '',
        sleeve: '',
        waist: '',
        inseam: '',
        hip: '',
        thigh: '',
        knee: '',
        leg_opening: '',
        confirmed: false
    })
    const [shirtSizes, setShirtSizes] = useState<any[]>([])
    const [quantity, setQuantity] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Sleeve and Monogram states
    const [sleeves, setSleeves] = useState<any[]>([])
    const [selectedSleeve, setSelectedSleeve] = useState("")
    const [isMonogramDrawerOpen, setIsMonogramDrawerOpen] = useState(false)
    const [monogramConfig, setMonogramConfig] = useState<MonogramConfig | null>(null)

    // Custom Monogram Upload states
    const [monogramOption, setMonogramOption] = useState<'text' | 'upload'>('text')
    const [customSettings, setCustomSettings] = useState<any>(null)
    const [customFile, setCustomFile] = useState<{ url: string; name: string; type: string } | null>(null)
    const [uploadingFile, setUploadingFile] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Meter options states for Towel products
    const [selectedMeter, setSelectedMeter] = useState<number | null>(1)
    const [customMeter, setCustomMeter] = useState('')

    const handleCustomMeterChange = (val: string) => {
        if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
            setCustomMeter(val);
            setSelectedMeter(null);
        }
    }

    // --- ZOOM STATES & REFS ---
    const [isZoomed, setIsZoomed] = useState(false)
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Fetch product details
    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products/${currentId}`);
                const resData = await res.json();
                if (res.ok && resData.success) {
                    setProduct(resData.data);
                } else {
                    setError(resData.message || "Failed to load product details.");
                }
            } catch (err) {
                console.error("Product Detail Fetch Error:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        const fetchCustomSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/monogram/custom-monogram-settings`);
                const data = await res.json();
                if (res.ok && data) {
                    setCustomSettings(data);
                }
            } catch (err) {
                console.error("Error fetching custom monogram settings:", err);
            }
        };
        fetchProductDetail();
        fetchCustomSettings();
    }, [currentId]);

    // Fetch active fit styles and sleeves
    useEffect(() => {
        const fetchMasters = async () => {
            if (!product?.pro_type_id) return;
            try {
                const fsRes = await fetch(`${API_URL}/api/admin/fit-styles/active/${product.pro_type_id}`);
                const fsData = await fsRes.json();
                if (fsData.success) {
                    const fetchedFitStyles = fsData.fitStyles || [];
                    setFitStyles(fetchedFitStyles);
                    if (fetchedFitStyles.length > 0 && !fitStyleId && !editCartId) {
                        setFitStyleId(fetchedFitStyles[0].fit_style_id);
                    }
                }

                const slRes = await fetch(`${API_URL}/api/admin/sleeves/active/${product.pro_type_id}`);
                const slData = await slRes.json();
                if (slData.success) {
                    const fetchedSleeves = slData.sleeves || [];
                    setSleeves(fetchedSleeves);
                    if (fetchedSleeves.length > 0 && !selectedSleeve && !editCartId) {
                        setSelectedSleeve(fetchedSleeves[0].sleeve_name);
                    }
                }
            } catch (err) {
                console.error("❌ Failed to fetch fit styles/sleeves:", err);
            }
        };
        fetchMasters();
    }, [product?.pro_type_id]);

    // Fetch active sizes dynamically depending on selected fitStyle
    useEffect(() => {
        const loadSizes = async () => {
            if ((!isBlazer && !isShirt && !isPant && !isShorts) || !product?.pro_type_id || !fitStyleId) return;

            try {
                const pTypeStr = isBlazer ? 'Blazers' : isShirt ? 'Shirt' : isPant ? 'Pant' : 'Shorts';
                const fetchUrl = `${API_URL}/api/admin/size-charts/active?product_type=${pTypeStr}&pro_type_id=${product.pro_type_id}&fit_style_id=${fitStyleId}`;
                const res = await fetch(fetchUrl);
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (res.ok && data.success) {
                        setShirtSizes(data.data || []);
                        if (data.data && data.data.length > 0 && selectedSize !== 'CUSTOM' && !editCartId) {
                            setSelectedSize(data.data[0].size_name);
                        }
                    }
                } catch (parseErr) {
                    console.error(`❌ Failed to parse active ${pTypeStr} sizes from:`, fetchUrl);
                    console.error("Response text:", text.substring(0, 200));
                }
            } catch (err) {
                console.error("❌ Failed to fetch active sizes:", err);
            }
        };

        if (product) {
            loadSizes();
        }
    }, [fitStyleId, product]);

    const hasRestoredRef = useRef(false);
    useEffect(() => {
        if (editCartId && cartItems.length > 0 && product && !hasRestoredRef.current) {
            const itemToEdit = cartItems.find((item: any) => String(item.cart_id) === editCartId);
            if (itemToEdit) {
                if (itemToEdit.fit_style && fitStyles.length > 0) {
                    const matchedFs = fitStyles.find(f => f.fit_style_name === itemToEdit.fit_style);
                    if (matchedFs) setFitStyleId(matchedFs.fit_style_id);
                }
                if (itemToEdit.selected_size === 'CUSTOM') {
                    setSelectedSize('CUSTOM');
                    setCustomMeasurements({
                        chest: itemToEdit.custom_chest || '',
                        length: itemToEdit.custom_length || '',
                        shoulder: itemToEdit.custom_shoulder || '',
                        sleeve: itemToEdit.custom_sleeve || '',
                        waist: itemToEdit.custom_waist || '',
                        inseam: itemToEdit.custom_inseam || '',
                        hip: itemToEdit.custom_hip || '',
                        thigh: itemToEdit.custom_thigh || '',
                        knee: itemToEdit.custom_knee || '',
                        leg_opening: itemToEdit.custom_leg_opening || '',
                        confirmed: true
                    });
                } else if (itemToEdit.selected_size) {
                    setSelectedSize(itemToEdit.selected_size);
                }

                if (itemToEdit.selected_sleeve) setSelectedSleeve(itemToEdit.selected_sleeve);
                if (itemToEdit.selected_meter) setSelectedMeter(Number(itemToEdit.selected_meter));

                if (itemToEdit.monogram?.enabled) {
                    setMonogramConfig(itemToEdit.monogram as any);
                }
                setQuantity(itemToEdit.quantity || 1);
                hasRestoredRef.current = true;
            }
        }
    }, [editCartId, cartItems, product, fitStyles]);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const maxMb = customSettings?.max_file_size_mb || 10;
        if (file.size > maxMb * 1024 * 1024) {
            toast.error("Selected file exceeds the maximum allowed size.");
            return;
        }

        const ext = file.name.split('.').pop()?.toUpperCase() || "";
        const allowed = (customSettings?.allowed_file_types || "PNG,JPG,JPEG,PDF").split(',').map((t: string) => t.trim().toUpperCase());
        if (!allowed.includes(ext)) {
            toast.error("Unsupported file format.");
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append("custom_monogram_file", file);

            const res = await fetch(`${API_URL}/api/monogram/upload-custom`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setCustomFile({
                    url: data.file_url,
                    name: file.name,
                    type: data.file_type
                });
            } else {
                toast.error(data.message || "Failed to upload custom monogram file.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload custom monogram file.");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleAddToCartClick = async (isBuyNow: boolean) => {
        if (!product) return;

        const fitStyleName = fitStyles.find(f => f.fit_style_id === fitStyleId)?.fit_style_name || null;

        const cartData: any = {
            pro_id: currentId,
            fit_style: (isBlazer || isShirt || isPant || isShorts) ? fitStyleName : null,
            quantity: quantity,
            pro_name: product.pro_name,
            price: product.price,
            pro_img: product.pro_img,
            cover_description: product.cover_description,
            pro_type_name: product.product_type_name,
      stitching_price: product.stitching_price
        };

        if (isBlazer || isShirt || isPant || isShorts) {
            if (selectedSize === 'CUSTOM') {
                if (!customMeasurements.confirmed) {
                    toast.error("Please confirm your custom measurements first.");
                    return;
                }
                cartData.selected_size = 'CUSTOM';
                cartData.is_custom = 1;
                if (isBlazer) {
                    cartData.custom_shoulder = customMeasurements.shoulder;
                    cartData.custom_chest = customMeasurements.chest;
                    cartData.custom_length = customMeasurements.length;
                    cartData.custom_sleeve = customMeasurements.sleeve;
                    cartData.custom_waist = customMeasurements.waist;
                } else if (isShirt) {
                    cartData.custom_chest = customMeasurements.chest;
                    cartData.custom_length = customMeasurements.length;
                    cartData.custom_shoulder = customMeasurements.shoulder;
                    cartData.custom_sleeve = customMeasurements.sleeve;
                } else if (isPant || isShorts) {
                    cartData.custom_waist = customMeasurements.waist;
                    cartData.custom_inseam = customMeasurements.inseam;
                    cartData.custom_hip = customMeasurements.hip;
                    cartData.custom_thigh = customMeasurements.thigh;
                    cartData.custom_knee = customMeasurements.knee;
                    cartData.custom_leg_opening = customMeasurements.leg_opening;
                }
            } else {
                cartData.selected_size = selectedSize;
                cartData.is_custom = 0;
            }

            // Add new configurations
            cartData.selected_sleeve = isShirt ? selectedSleeve : null;
            
            const isSupported = isMonogramSupported(product.product_type_name || product.category_name);
            if (isSupported) {
                if (monogramOption === 'upload') {
                    if (!customFile) {
                        toast.error("Please upload your monogram file.");
                        return;
                    }
                    cartData.monogram = {
                        enabled: true,
                        type: 'upload',
                        upload_file: customFile.url,
                        upload_file_type: customFile.type,
                        extra_price: Number(customSettings?.upload_price || 599),
                        file_name: customFile.name
                    };
                } else if (monogramConfig?.enabled && monogramConfig.placement_name !== 'None') {
                    cartData.monogram = {
                        enabled: true,
                        type: 'text',
                        text: monogramConfig.text,
                        placement_id: monogramConfig.placement_id,
                        color_id: monogramConfig.color_id,
                        font_id: monogramConfig.font_id,
                        extra_price: monogramConfig.extra_price,
                        placement_name: monogramConfig.placement_name,
                        color_name: monogramConfig.color_name,
                        font_name: monogramConfig.font_name
                    };
                }
            }
        } else if (isFabric) {
            cartData.selected_meter = selectedMeter || Number(customMeter) || 1;
            cartData.is_custom = 0;
        } else {
            // Towel
            cartData.selected_meter = product.standard_size;
            cartData.is_custom = 0;
        }

        await addToCart(cartData);

        if (isBuyNow) {
            router.push("/cart");
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || !containerRef.current) return

        const { left, top, width, height } = containerRef.current.getBoundingClientRect()

        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100

        setZoomPos({ x, y })
    }

    const toggleZoom = () => {
        setIsZoomed(!isZoomed)
        if (isZoomed) setZoomPos({ x: 50, y: 50 })
    }

    const imageThumbs = [
        product?.pro_img || "",
        ...(product?.additionalImages || [])
    ].slice(0, 5);

    const pType = (product?.product_type_name || "").toLowerCase();
    const isShirt = !product?.product_type_name || pType === "shirt" || pType === "shirts";
    const isPant = pType === "pant" || pType === "pants";
    const isShorts = pType === "shorts" || pType === "short";
    const isBlazer = pType === "blazer" || pType === "blazers" || product?.pro_type_id === 21;
    const isFabric = pType === "fabric" || pType === "fabrics";

    const [firstBreadcrumbText, setFirstBreadcrumbText] = useState("All");
    const [navProductIds, setNavProductIds] = useState<number[]>([]);

    useEffect(() => {
        const savedType = sessionStorage.getItem("shop_product_type");
        const text = (savedType === "2" || product?.product_type_name === "Towels" || product?.product_type_name === "Towel") && (savedType !== "All")
            ? "Towels"
            : (savedType === "1" || product?.product_type_name === "Shirts" || product?.product_type_name === "Shirt") && (savedType !== "All")
                ? "Shirts"
                : "All";
        setFirstBreadcrumbText(text);
    }, [product]);

    // Load nav product IDs from sessionStorage (saved by shop.tsx)
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem("shop_nav_product_ids");
                if (saved) {
                    setNavProductIds(JSON.parse(saved));
                }
            } catch (e) { }
        }
    }, []);

    const currentNavIdx = navProductIds.indexOf(currentId);
    const prevProductId = currentNavIdx > 0 ? navProductIds[currentNavIdx - 1] : null;
    const nextProductId = currentNavIdx >= 0 && currentNavIdx < navProductIds.length - 1 ? navProductIds[currentNavIdx + 1] : null;

    const handleFirstBreadcrumbClick = () => {
        if (typeof window !== "undefined") {
            if (firstBreadcrumbText === "Towels") {
                sessionStorage.setItem("shop_product_type", "2");
                sessionStorage.removeItem("shop_selected_category");
            } else if (firstBreadcrumbText === "Shirts") {
                sessionStorage.setItem("shop_product_type", "1");
                sessionStorage.removeItem("shop_selected_category");
            } else {
                sessionStorage.setItem("shop_product_type", "All");
                sessionStorage.removeItem("shop_selected_category");
            }
            sessionStorage.setItem("shop_breadcrumb_nav", "true");
            router.push("/shop");
        }
    };

    const handleSecondBreadcrumbClick = () => {
        if (typeof window !== "undefined" && product) {
            const typeId = product.product_type_name === "Shirts" || product.product_type_name === "Shirt" ? 1 : 2;
            sessionStorage.setItem("shop_product_type", typeId.toString());
            sessionStorage.setItem("shop_selected_category", JSON.stringify({
                id: product.cat_id,
                name: product.category_name,
                productTypeId: typeId
            }));
            sessionStorage.setItem("shop_breadcrumb_nav", "true");
            router.push("/shop");
        }
    };

    // Filter out 'Fit' from specifications
    const specList = product?.specifications && product.specifications.length > 0
        ? product.specifications
            .filter(s => s.key.toLowerCase() !== "fit")
            .map(s => ({ name: s.key, value: s.value }))
        : [];

    const getGridColsClass = (count: number) => {
        const c = Math.max(1, Math.min(5, count));
        if (c === 5) return "grid-cols-5 max-w-[360px]";
        if (c === 4) return "grid-cols-4 max-w-[288px]";
        if (c === 3) return "grid-cols-3 max-w-[216px]";
        if (c === 2) return "grid-cols-2 max-w-[144px]";
        return "grid-cols-1 max-w-[72px]";
    };

    return (
        <div className="w-full min-h-screen bg-tertiary text-Pinball flex flex-col">
            <section className="w-full flex-grow flex items-stretch">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch">
                    {/* Left Side: Image Viewer */}
                    <div
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => {
                            setIsZoomed(false)
                            setZoomPos({ x: 50, y: 50 })
                        }}
                        className={`w-full relative bg-milk-jug flex flex-col justify-between overflow-hidden select-none ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                            }`}
                        onClick={toggleZoom}
                    >
                        <div className="relative w-full h-full min-h-137.5 lg:min-h-screen overflow-hidden bg-[#F6F4EF]">
                            <Image
                                src={resolveImageUrl(imageThumbs[activeImg])}
                                alt={`${product?.pro_name} - View ${activeImg + 1}`}
                                fill
                                priority
                                className="object-contain object-center transition-transform duration-200 ease-out"
                                style={{
                                    transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                                }}
                                unoptimized
                            />

                            {/* Action Floating Buttons */}
                            <div
                                className="absolute top-32 right-6 flex flex-col gap-5 z-10 items-end"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={toggleZoom}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-colors ${isZoomed
                                        ? 'bg-[#A37646] text-light'
                                        : 'bg-white text-black/70 hover:text-black'
                                        }`}
                                    aria-label="Zoom Image"
                                >
                                    <ZoomIn className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Image Carousel Selection Thumbnails */}
                            <div
                                className={`absolute bottom-6 left-1/2 -translate-x-1/2 grid gap-3 w-full z-10 bg-white/40 backdrop-blur-md p-2 rounded-lg shadow-sm ${getGridColsClass(imageThumbs.length)}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {imageThumbs.map((src, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImg(idx)}
                                        aria-pressed={activeImg === idx}
                                        className={`relative aspect-square rounded-md overflow-hidden bg-white border-2 outline-none focus:outline-none transition-all ${activeImg === idx
                                            ? 'border-[#2b6cb0] scale-102'
                                            : 'border-transparent opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={resolveImageUrl(src)}
                                            alt={`Product thumbnail variant slot ${idx + 1}`}
                                            fill
                                            sizes="(max-width: 340px) 20vw, 64px"
                                            className="object-contain object-center bg-[#F6F4EF]"
                                            unoptimized
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Product Details */}
                    <div className="w-full flex flex-col justify-center border-b-2 border-bg-light-blue px-6 sm:pr-12 lg:pr-16 lg:pl-5 py-12 lg:py-18 lg:pt-30 max-w-full mx-auto lg:mx-0 flex flex-col gap-6">

                        {/* Breadcrumb Navigation + Prev/Next */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wider text-light/40 font-sans uppercase min-w-0 overflow-hidden">
                                <span
                                    onClick={handleFirstBreadcrumbClick}
                                    className="hover:text-light cursor-pointer transition-colors whitespace-nowrap"
                                >
                                    {firstBreadcrumbText}
                                </span>
                                <span className="select-none text-light/20">/ </span>
                                <span
                                    onClick={handleSecondBreadcrumbClick}
                                    className="hover:text-light cursor-pointer transition-colors line-clamp-1"
                                >
                                    {product?.category_name}
                                </span>
                                <span className="select-none text-light/20">/</span>
                                <span className="text-[#D4AF37] line-clamp-1 select-none font-bold">
                                    {product?.pro_name}
                                </span>
                            </div>

                            {/* Prev / Next product navigation */}
                            {navProductIds.length > 1 && (
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        disabled={!prevProductId}
                                        onClick={() => prevProductId && router.push(`/productdetailviewpage?id=${prevProductId}`)}
                                        className="w-7 h-7 flex items-center justify-center rounded border border-light/20 text-light/50 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        title="Previous product"
                                        aria-label="Previous product"
                                    >
                                        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                                    </button>
                                    <span className="text-[10px] font-mono text-light/30 select-none px-1">
                                        {currentNavIdx + 1}/{navProductIds.length}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!nextProductId}
                                        onClick={() => nextProductId && router.push(`/productdetailviewpage?id=${nextProductId}`)}
                                        className="w-7 h-7 flex items-center justify-center rounded border border-light/20 text-light/50 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        title="Next product"
                                        aria-label="Next product"
                                    >
                                        <ChevronRight className="w-4 h-4" strokeWidth={2} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 1. Main Info Block */}
                        <div className="flex flex-col gap-4 text-left">
                            <div className="flex justify-between items-start gap-4 sm:gap-6 relative">
                                <h1 className="font-instrumentserif text-2xl sm:text-4xl lg:text-5xl font-medium text-light leading-[1.2] uppercase transform scale-y-120 sm:scale-y-130 tracking-tighter origin-left break-words pr-2">
                                    {product?.pro_name}
                                </h1>
                                <button
                                    type="button"
                                    onClick={() => toggleWishlist(currentId)}
                                    className={`p-2.5 border rounded-md transition-all -mt-1 shrink-0 ${wishlisted
                                        ? 'border-red-500 bg-red-500/10 text-red-500'
                                        : 'border-light text-Pinball hover:border-bg-blue hover:text-light'
                                        }`}
                                    aria-label="Toggle Wishlist"
                                >
                                    <Heart
                                        className="w-4 h-4"
                                        fill={wishlisted ? "currentColor" : "none"}
                                    />
                                </button>
                            </div>

                            <p className="text-sm text-Pinball font-normal leading-relaxed text-left">
                                {product?.cover_description || (product?.descriptions && product?.descriptions[0]?.text) || ""}
                            </p>

                            <div className="flex items-center gap-1 text-xs font-medium tracking-wide">
                                <span className="text-xs text-pinball font-normal">4.0</span>
                                <span className="text-xs text-pinball font-normal">★</span>
                                <span className="ml-1 text-xs text-pinball font-normal">Ratings</span>
                            </div>

                            <div className="flex flex-col gap-1.5 text-left">
                                <span className="text-xl sm:text-2xl font-semibold text-brown tracking-wide flex items-baseline gap-2">
                                    Rs. {Number(product?.price || 0) * (isFabric ? (selectedMeter || Number(customMeter) || 1) : 1)}/-
                                    {isFabric && <span className="text-sm font-normal text-Pinball opacity-80">(Rs. {Number(product?.price || 0)} / Meter)</span>}
                                </span>
                                {(isBlazer || isShirt || isPant || isShorts) && monogramConfig?.enabled && monogramConfig.extra_price > 0 && (
                                    <span className="text-xs font-semibold text-[#D4AF37] tracking-wide mb-1">
                                        Includes ₹{monogramConfig.extra_price} Monogram Customization
                                    </span>
                                )}
                                
                                {/* Stock Status Text */}
                                {(product?.stock_quantity === 0) ? (
                                    <span className="text-sm font-bold text-red-500 uppercase tracking-widest mt-1 mb-2">OUT OF STOCK</span>
                                ) : (product?.stock_quantity !== undefined && product?.stock_quantity !== null && product?.stock_quantity <= 10) ? (
                                    <span className={`text-sm font-bold tracking-wide mt-1 mb-2 ${product.stock_quantity <= 5 ? 'text-red-400' : 'text-orange-400'}`}>
                                        {product.stock_quantity <= 5 ? `Hurry! Only ${product.stock_quantity} left in stock` : `Only ${product.stock_quantity} left in stock`}
                                    </span>
                                ) : null}

                                <p className="text-sm text-pinball font-normal">
                                    Stitching charges calculated at checkout.
                                </p>
                            </div>
                        </div>

                        {/* Disclaimer Section */}
                        {product?.disclaimer && product.disclaimer.trim() !== "" && (
                            <div className="bg-[#102554]/60 border border-[#102554] rounded-xl p-4 text-left flex gap-3 items-start w-full min-w-0">
                                <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                                        Disclaimer
                                    </span>
                                    <p className="text-[12px] leading-relaxed text-[#D3D3D3]/90 break-words overflow-wrap-anywhere">
                                        {product.disclaimer}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 2. Specifications Section */}
                        {specList.length > 0 && (
                            <div className="flex flex-col gap-3 text-left">
                                <h3 className="text-[#D4AF37] text-[16px] tracking-wider uppercase font-semibold font-mono">
                                    Specifications
                                </h3>
                                <div className="bg-[#081A42] border border-[#102554]/40 rounded-xl px-4 py-2 divide-y divide-[#102554]/30">
                                    {specList.map((spec, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm py-3">
                                            <span className="text-[#D3D3D3] font-medium text-[14px]">{spec.name}</span>
                                            <span className="text-white font-semibold text-[14px]">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. New Flow: Quantity Selector & Fit Style Selector side-by-side */}
                        <div className="flex items-center gap-4 text-left">
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-light">Quantity</label>
                                <div className="bg-[#F4EFE6]/60 rounded-md flex items-center justify-between border border-black/5 w-24 h-11 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-full flex items-center justify-center text-black/60 hover:text-black transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-3.5 h-3.5 stroke-2" />
                                    </button>
                                    <span className="text-xs font-semibold text-black select-none">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-full flex items-center justify-center text-black/60 hover:text-black transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-3.5 h-3.5 stroke-2" />
                                    </button>
                                </div>
                            </div>

                            {(isBlazer || isShirt || isPant || isShorts) && (
                                <div className="flex flex-col gap-3 grow">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-light">Fit Style</label>
                                    <select
                                        value={fitStyleId || ""}
                                        onChange={(e) => setFitStyleId(Number(e.target.value))}
                                        className="w-full h-11 px-4 text-xs font-semibold rounded-md border border-white/10 bg-[#07122a] text-light focus:outline-none focus:border-bg-blue transition-colors cursor-pointer"
                                    >
                                        {fitStyles.map(f => (
                                            <option key={f.fit_style_id} value={f.fit_style_id}>{f.fit_style_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* 4. Size Selection or Length Selection */}
                        {(() => {
                            if (isFabric) {
                                return (
                                    <div className="flex flex-col gap-5 text-left">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-light">Select Length</label>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {[1, 1.5, 2, 3].map((meter) => (
                                                    <button
                                                        key={meter}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedMeter(meter);
                                                            setCustomMeter('');
                                                        }}
                                                        className={`px-4 h-11 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center ${selectedMeter === meter
                                                            ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                                            : 'border-black/5 bg-[#F4EFE6]/60 text-black/80 hover:border-black/20'
                                                            }`}
                                                    >
                                                        {meter} Meter
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-light">Custom Length</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={customMeter}
                                                    onChange={(e) => handleCustomMeterChange(e.target.value)}
                                                    placeholder="Enter length"
                                                    className="w-32 h-11 px-3 bg-[#07122a] border border-white/10 rounded-md text-sm text-light focus:outline-none focus:border-[#D4AF37]"
                                                />
                                                <span className="text-xs font-semibold uppercase text-light">Meter</span>
                                            </div>
                                            {customMeter !== "" && (Number(customMeter) < 0.5 || Number(customMeter) > 50) && (
                                                <p className="text-xs text-red-400">Please enter a valid fabric length (0.5 to 50).</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            if (!isBlazer && !isShirt && !isPant && !isShorts) {
                                return (
                                    <div className="flex flex-col gap-5 text-left">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-light">Standard Size</label>
                                            <div className="bg-[#07122a] border border-white/10 rounded-md p-3 text-sm text-light font-medium tracking-wide w-max min-w-[200px]">
                                                {product?.standard_size || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col gap-3 text-left">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-light">Select Size</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {shirtSizes.map((sizeObj) => (
                                            <button
                                                key={sizeObj.size_chart_id}
                                                type="button"
                                                onClick={() => setSelectedSize(sizeObj.size_name)}
                                                className={`w-14 h-11 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center ${selectedSize === sizeObj.size_name
                                                    ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                                    : 'border-black/5 bg-[#F4EFE6]/60 text-black/80 hover:border-black/20'
                                                    }`}
                                            >
                                                {sizeObj.size_name}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSize('CUSTOM');
                                                setIsSizeChartOpen(true);
                                            }}
                                            className={`px-4 h-11 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer ${selectedSize === 'CUSTOM'
                                                ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                                : 'border-black/5 bg-[#F4EFE6]/60 text-black/80 hover:border-black/20'
                                                }`}
                                        >
                                            <span>Custom</span>
                                            {customMeasurements.confirmed && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsSizeChartOpen(true)}
                                            className="flex items-center gap-1.5 ml-4 h-11 px-4 text-xs font-semibold rounded-md border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1633] transition-all cursor-pointer uppercase shadow-lg shadow-[#D4AF37]/10"
                                        >
                                            <Ruler className="w-3.5 h-3.5" />
                                            <span>Size Chart</span>
                                        </button>
                                    </div>

                                    {/* Sleeve Selection */}
                                    {isShirt && (
                                        <div className="flex flex-col gap-3 mt-1">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-light">Sleeve</label>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {sleeves.map((sleeveOpt) => (
                                                    <button
                                                        key={sleeveOpt.sleeve_id}
                                                        type="button"
                                                        onClick={() => setSelectedSleeve(sleeveOpt.sleeve_name)}
                                                        className={`px-4 h-11 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center ${selectedSleeve === sleeveOpt.sleeve_name
                                                            ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                                                            : 'border-black/5 bg-[#F4EFE6]/60 text-black/80 hover:border-black/20'
                                                            }`}
                                                    >
                                                        {sleeveOpt.sleeve_name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Monogram Section - Restricted to Shirt, Pant, Blazer, Shorts */}
                                    {isMonogramSupported(product?.product_type_name || product?.category_name) && (
                                        <div className="flex flex-col gap-3 mt-3 p-4 rounded-xl border border-[#D4AF37]/30 bg-[#0A1633]/40 text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                                                    Customization Options
                                                </span>
                                                {/* Toggle between Text Monogram & Upload Custom Monogram */}
                                                <div className="flex items-center gap-4 text-xs font-semibold text-white">
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="monogramOption"
                                                            value="text"
                                                            checked={monogramOption === 'text'}
                                                            onChange={() => setMonogramOption('text')}
                                                            className="accent-[#D4AF37]"
                                                        />
                                                        <span>Text Monogram</span>
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="monogramOption"
                                                            value="upload"
                                                            checked={monogramOption === 'upload'}
                                                            onChange={() => setMonogramOption('upload')}
                                                            className="accent-[#D4AF37]"
                                                        />
                                                        <span>Upload Custom Monogram</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Text Monogram Option */}
                                            {monogramOption === 'text' && (
                                                <div className="flex flex-col gap-2 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMonogramDrawerOpen(true)}
                                                        className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold rounded-md border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1633] transition-all cursor-pointer uppercase shadow-lg shadow-[#D4AF37]/10 w-fit"
                                                    >
                                                        <span>✨ {monogramConfig?.enabled ? "Edit Text Monogram" : "Add Text Monogram"}</span>
                                                    </button>

                                                    {/* Monogram Summary */}
                                                    {monogramConfig?.enabled && (
                                                        <div className="flex flex-col gap-2 mt-2 p-3 rounded-lg border border-[#D4AF37]/20 bg-[#0A1633]/60 relative overflow-hidden">
                                                            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex justify-between items-center">
                                                                <span>Text Monogram Details</span>
                                                                <button onClick={() => setIsMonogramDrawerOpen(true)} className="text-white/50 hover:text-white underline text-[10px]">Edit</button>
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs font-medium">
                                                                <div className="text-white/60">Placement</div>
                                                                <div className="text-white text-right">{monogramConfig.placement_name}</div>
                                                                {monogramConfig.placement_name !== 'None' && (
                                                                    <>
                                                                        <div className="text-white/60">Text</div>
                                                                        <div className="text-white text-right tracking-widest">{monogramConfig.text}</div>
                                                                        <div className="text-white/60">Color</div>
                                                                        <div className="text-white text-right">{monogramConfig.color_name}</div>
                                                                        <div className="text-white/60">Font</div>
                                                                        <div className="text-white text-right">{monogramConfig.font_name}</div>
                                                                        <div className="text-white/60">Additional Charge</div>
                                                                        <div className="text-[#D4AF37] text-right font-bold">₹{monogramConfig.extra_price}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Upload Custom Monogram Option */}
                                            {monogramOption === 'upload' && (
                                                <div className="flex flex-col gap-3 mt-1 bg-[#08142c]/60 p-4 rounded-lg border border-[#D4AF37]/20">
                                                    <div>
                                                        <h4 className="text-[#D4AF37] text-sm font-semibold uppercase tracking-wider">
                                                            Upload Your Own Monogram
                                                        </h4>
                                                        <p className="text-xs text-white/70 mt-0.5">
                                                            {customSettings?.description || "Upload your logo, initials, artwork or embroidery-ready design."}
                                                        </p>
                                                    </div>

                                                    {/* Upload Box or Preview */}
                                                    {!customFile ? (
                                                        <div
                                                            onClick={() => fileInputRef.current?.click()}
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                                    handleFileUpload(e.dataTransfer.files[0]);
                                                                }
                                                            }}
                                                            className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[#0A1633]/40 text-center"
                                                        >
                                                            <input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        handleFileUpload(e.target.files[0]);
                                                                    }
                                                                }}
                                                                accept="image/*,application/pdf"
                                                                className="hidden"
                                                            />
                                                            {uploadingFile ? (
                                                                <div className="flex flex-col items-center gap-2 text-[#D4AF37]">
                                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                                    <span className="text-xs font-semibold">Uploading file...</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-6 h-6 text-[#D4AF37]" />
                                                                    <p className="text-xs text-white font-medium">
                                                                        Drag & Drop your file here or <span className="text-[#D4AF37] underline">Browse Files</span>
                                                                    </p>
                                                                    <div className="flex items-center gap-4 text-[10px] text-white/60 mt-1">
                                                                        <span>Supported: {customSettings?.allowed_file_types || "PNG, JPG, JPEG, PDF"}</span>
                                                                        <span>•</span>
                                                                        <span>Max Size: {customSettings?.max_file_size_mb || 10} MB</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between p-3 rounded-lg border border-[#D4AF37]/40 bg-[#0A1633]/80">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                {customFile.type === 'PDF' || customFile.name.endsWith('.pdf') ? (
                                                                    <div className="p-2 bg-red-900/30 border border-red-500/30 rounded text-red-400 shrink-0">
                                                                        <FileText className="w-6 h-6" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-10 h-10 relative rounded overflow-hidden border border-[#D4AF37]/30 shrink-0">
                                                                        <img src={customFile.url.startsWith('http') ? customFile.url : `${API_URL}${customFile.url}`} alt="Uploaded Preview" className="w-full h-full object-cover" />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-xs font-semibold text-white truncate max-w-[160px] sm:max-w-[220px]">
                                                                        {customFile.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-[#D4AF37] font-bold">
                                                                        {customFile.type === 'PDF' ? 'PDF Uploaded' : 'Image Uploaded'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="px-2.5 py-1 text-[10px] font-semibold uppercase rounded border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1633] transition-all"
                                                                >
                                                                    Replace
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCustomFile(null)}
                                                                    className="p-1 text-red-400 hover:text-red-300"
                                                                    title="Remove File"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center text-xs pt-1 border-t border-[#D4AF37]/10">
                                                        <span className="text-white/70">Additional Charge:</span>
                                                        <span className="text-[#D4AF37] font-bold">₹{customSettings?.upload_price || 599}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* 5. Purchase Buttons Block */}
                        <div className="flex flex-col gap-3 w-full">
                            {(isBlazer || isShirt || isPant || isShorts) && selectedSize === 'CUSTOM' && !customMeasurements.confirmed && (
                                <p className="text-xs text-amber-500 font-semibold text-left select-none animate-pulse">
                                    * Please confirm your custom measurements in the Size Chart to enable purchase.
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => handleAddToCartClick(false)}
                                disabled={product?.stock_quantity === 0 || ((isBlazer || isShirt || isPant || isShorts) && selectedSize === 'CUSTOM' && !customMeasurements.confirmed) || (isFabric && customMeter !== "" && (Number(customMeter) < 0.5 || Number(customMeter) > 50))}
                                className={`w-full h-11 text-light text-[11px] font-semibold tracking-widest uppercase rounded-md flex items-center justify-center transition-colors duration-200 ${
                                    product?.stock_quantity === 0 || ((isBlazer || isShirt || isPant || isShorts) && selectedSize === 'CUSTOM' && !customMeasurements.confirmed) || (isFabric && customMeter !== "" && (Number(customMeter) < 0.5 || Number(customMeter) > 50))
                                    ? "bg-bg-blue/40 text-light/40 cursor-not-allowed"
                                    : "bg-bg-blue hover:bg-bg-blue/90 cursor-pointer"
                                    }`}
                            >
                                Add To Cart
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddToCartClick(true)}
                                disabled={product?.stock_quantity === 0 || ((isBlazer || isShirt || isPant || isShorts) && selectedSize === 'CUSTOM' && !customMeasurements.confirmed) || (isFabric && customMeter !== "" && (Number(customMeter) < 0.5 || Number(customMeter) > 50))}
                                className={`w-full h-11 text-[11px] font-semibold tracking-widest uppercase rounded-md flex items-center justify-center transition-colors duration-200 ${
                                    product?.stock_quantity === 0 || ((isBlazer || isShirt || isPant || isShorts) && selectedSize === 'CUSTOM' && !customMeasurements.confirmed) || (isFabric && customMeter !== "" && (Number(customMeter) < 0.5 || Number(customMeter) > 50))
                                    ? "bg-[#D4AF37]/50 text-black/50 cursor-not-allowed"
                                    : "bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0A1633] cursor-pointer"
                                    }`}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>

                </div>

                <SizeChart
                    isOpen={isSizeChartOpen}
                    onClose={() => setIsSizeChartOpen(false)}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    templateImage={product?.size_chart_template?.image_path}
                    productType={product?.product_type_name}
                    proTypeId={product?.pro_type_id}
                    fitStyleId={fitStyleId}
                    setFitStyleId={setFitStyleId}
                    fitStyles={fitStyles}
                    customMeasurements={customMeasurements}
                    setCustomMeasurements={setCustomMeasurements}
                />
                <MyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                <MonogramDrawer
                    isOpen={isMonogramDrawerOpen}
                    onClose={() => setIsMonogramDrawerOpen(false)}
                    onSave={setMonogramConfig}
                    initialConfig={monogramConfig}
                    proTypeId={product?.pro_type_id}
                />
            </section>
        </div>
    )
}
