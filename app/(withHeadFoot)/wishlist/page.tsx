"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, X } from "lucide-react";
import { useWishlist } from "../../../context/wishlistContext";
import { useCart } from "../../../context/cartContext";
import { showAlert } from '../../../utils/modalUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "/images/shop/category.webp";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

export default function WishlistPage() {
  const { wishlistIds, wishlistItems, toggleWishlist, loading: contextLoading } = useWishlist();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Popup states
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [showShirtPopup, setShowShirtPopup] = useState(false);
  const [showTowelPopup, setShowTowelPopup] = useState(false);

  // Size selections
  const [fitStyle, setFitStyle] = useState("Classic");
  const [shirtSizes, setShirtSizes] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState('S');

  // Custom size fields
  const [customChest, setCustomChest] = useState('');
  const [customLength, setCustomLength] = useState('');
  const [customShoulder, setCustomShoulder] = useState('');
  const [customSleeve, setCustomSleeve] = useState('');

  // Meter selections
  const [selectedMeter, setSelectedMeter] = useState<number | null>(1);
  const [customMeter, setCustomMeter] = useState('');

  // Check login token
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Fetch all products to resolve details for guest wishlist
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        if (res.ok && data.success) {
          setAllProducts(data.data || []);
        }
      } catch (err) {
        console.error("❌ Failed to fetch products for guest wishlist:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch active shirt sizes dynamically depending on selected fit style
  useEffect(() => {
    if (!showShirtPopup) return;

    const fetchSizesForFit = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/size-charts/active?product_type=Shirt&fitStyle=${fitStyle}`);
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
        console.error("❌ Failed to fetch shirt sizes in wishlist popup:", err);
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

  // Map to a unified items array
  const itemsToDisplay = token
    ? wishlistItems.map(item => ({
        id: Number(item.pro_id),
        name: item.pro_name,
        desc: item.cover_description,
        price: item.price,
        imgUrl: item.pro_img,
        product_type_name: item.product_type_name
      }))
    : allProducts
        .filter(p => wishlistIds.includes(Number(p.pro_id)))
        .map(p => ({
          id: Number(p.pro_id),
          name: p.pro_name,
          desc: p.cover_description,
          price: p.price,
          imgUrl: p.pro_img,
          product_type_name: p.product_type_name
        }));

  const handleAddToCartWishlist = (item: any) => {
    setActiveItem(item);
    const pType = (item.product_type_name || "").toLowerCase();
    const isShirt = pType === "shirt" || pType === "shirts" || !item.product_type_name;

    if (isShirt) {
      setFitStyle("Classic"); // Reset to Classic default on opening
      setShowShirtPopup(true);
    } else {
      setShowTowelPopup(true);
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
      pro_id: activeItem.id,
      fit_style: fitStyle,
      quantity: 1,
      pro_name: activeItem.name,
      price: activeItem.price,
      pro_img: activeItem.imgUrl,
      cover_description: activeItem.desc,
      pro_type_name: activeItem.product_type_name
    };

    if (selectedSize === 'CUSTOM') {
      if (!customChest || !customLength || !customShoulder || !customSleeve) {
        showAlert("warning", "Missing Measurements", "Please enter all four measurements (Chest, Length, Shoulder, Sleeve).");
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
        showAlert("warning", "Invalid Measurements", "All measurements must be positive numbers.");
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

  const confirmTowelCart = async () => {
    if (!activeItem) return;
    const meterVal = selectedMeter !== null ? selectedMeter : parseFloat(customMeter);
    if (!meterVal || isNaN(meterVal) || meterVal <= 0) {
      showAlert("warning", "Invalid Length", "Please select or enter a valid length in meters.");
      return;
    }

    await addToCart({
      pro_id: activeItem.id,
      quantity: 1,
      selected_meter: meterVal,
      is_custom: 0,
      pro_name: activeItem.name,
      price: activeItem.price,
      pro_img: activeItem.imgUrl,
      cover_description: activeItem.desc,
      pro_type_name: activeItem.product_type_name
    });
    setShowTowelPopup(false);
    setActiveItem(null);
    setCustomMeter('');
    setSelectedMeter(1);
  };

  const isLoading = contextLoading || (loadingProducts && !token);

  if (isLoading) {
    return (
      <div className="bg-tertiary min-h-screen py-16 flex flex-col items-center justify-center font-sans text-light">
        <h1 className="uppercase font-instrumentserif text-lg md:text-2xl lg:text-2xl text-light leading-[1.1] transform scale-y-150 origin-center mb-8">
          ( Your Wishlist )
        </h1>
        <div className="text-light/60 font-sans text-sm animate-pulse tracking-widest uppercase">
          Loading Wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 font-sans text-light text-left">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center uppercase font-instrumentserif text-2xl md:text-4xl lg:text-4xl text-light leading-[1.1] transform scale-y-150 origin-center mb-16 select-none">
          ( Your Wishlist )
        </h1>

        {itemsToDisplay.length === 0 ? (
          <div className="text-center py-20 bg-primary rounded-xl border border-light/5 shadow-sm max-w-2xl mx-auto flex flex-col items-center gap-6">
            <p className="text-Pinball text-base sm:text-lg">Your wishlist is currently empty.</p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {itemsToDisplay.map((item) => (
              <div
                key={item.id}
                className="bg-primary rounded-xl overflow-hidden border border-light/5 hover:border-light/10 shadow-sm flex flex-row h-52 sm:h-60 transition-all duration-300 group"
              >
                {/* Image Area */}
                <div className="relative w-1/3 h-full bg-[#1e1e1e] overflow-hidden shrink-0">
                  <Image
                    src={resolveImageUrl(item.imgUrl)}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    unoptimized
                  />
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-light leading-tight truncate text-left">
                        {item.name}
                      </h2>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item.id)}
                        className="text-Pinball hover:text-red-500 transition-colors p-1 cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-Pinball font-light leading-relaxed line-clamp-2 sm:line-clamp-3 text-left">
                      {item.desc || "Exquisite linen fabric crafted for ultimate comfort and class."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-light/5">
                    <span className="text-lg sm:text-xl font-bold text-brown whitespace-nowrap">
                      Rs. {item.price}/-
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddToCartWishlist(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-bg-blue hover:bg-bg-blue/90 text-light text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-md transition-colors shrink-0 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add To Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shirt Size Selector Popup */}
      {showShirtPopup && activeItem && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm bg-tertiary border border-white/10 rounded-xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => { setShowShirtPopup(false); setActiveItem(null); }}
              className="absolute top-4 right-4 text-Pinball hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold uppercase tracking-wider text-light mb-4">
              Select Shirt Options
            </h3>
            <p className="text-xs text-Pinball mb-4">{activeItem.name}</p>

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
                  className={`w-12 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${
                    selectedSize === sizeObj.size_name
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
                className={`px-4 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${
                  selectedSize === 'CUSTOM'
                    ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                    : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Size fields */}
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
              className="w-full h-10 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-bold uppercase tracking-widest rounded-md cursor-pointer transition-colors"
            >
              Confirm & Add
            </button>
          </div>
        </div>
      )}

      {/* Towel Meter Selector Popup */}
      {showTowelPopup && activeItem && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm bg-[#0b1426] border border-white/10 rounded-xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => { setShowTowelPopup(false); setActiveItem(null); setCustomMeter(''); setSelectedMeter(1); }}
              className="absolute top-4 right-4 text-Pinball hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold uppercase tracking-wider text-light mb-4">
              Select Length (Meters)
            </h3>
            <p className="text-xs text-Pinball mb-4">{activeItem.name}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3, 5].map((meter) => (
                <button
                  key={meter}
                  type="button"
                  onClick={() => { setSelectedMeter(meter); setCustomMeter(''); }}
                  className={`px-3 h-10 text-xs font-semibold rounded-md border transition-all uppercase flex items-center justify-center cursor-pointer ${
                    selectedMeter === meter
                      ? 'bg-[#EBE3D5] border-transparent text-black font-bold'
                      : 'border-white/10 bg-[#08142c] text-light hover:border-white/30'
                  }`}
                >
                  {meter} Meter
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-[10px] uppercase tracking-wider text-[#D3D3D3]/60">Custom Length</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customMeter}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                      setCustomMeter(val);
                      setSelectedMeter(null);
                    }
                  }}
                  placeholder="0.00"
                  className="w-full pl-3 pr-14 py-2 h-9 text-xs placeholder:text-[#D3D3D3]/30 text-white rounded border border-white/10 bg-[#08142c] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <span className="absolute right-3 text-[9px] text-[#D3D3D3]/60 font-semibold uppercase select-none">
                  Meters
                </span>
              </div>
            </div>

            <button
              onClick={confirmTowelCart}
              className="w-full h-10 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-bold uppercase tracking-widest rounded-md cursor-pointer transition-colors"
            >
              Confirm & Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
