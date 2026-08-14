"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Truck, Calendar, X, Plus, ShoppingCart, Check, ChevronRight, ShoppingBag } from 'lucide-react';
import { showAlert } from '../../../utils/modalUtils';
import { useCart } from "../../../context/cartContext";
import EditAddressModal, { Address } from "../../../pages/profile/EditAddressModal";

import { calculateOrderSummary } from "../../../utils/pricing";
import CartItemMeasurements from "../../../components/CartItemMeasurements";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "/images/shop/category.webp";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: "Order Summary" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Success" }
  ];

  return (
    <div className="max-w-xl mx-auto mb-12 px-4">
      <div className="flex items-center justify-between relative">
        {/* Track Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-bg-blue transition-all duration-500 z-0"
          style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
        />

        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 border ${isCompleted
                  ? "bg-bg-blue border-transparent text-light"
                  : isActive
                    ? "bg-[#EBE3D5] border-transparent text-black"
                    : "bg-tertiary border-white/10 text-Pinball"
                  }`}
              >
                {isCompleted ? "✓" : step.number}
              </div>
              <span
                className={`text-[10px] sm:text-xs uppercase tracking-wider mt-2.5 font-semibold transition-colors duration-300 ${isActive ? "text-[#EBE3D5]" : isCompleted ? "text-bg-blue" : "text-Pinball/50"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderSummaryPage() {
  const { cartItems } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showRegisteredUserModal, setShowRegisteredUserModal] = useState(false);
  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    streetLocality: "",
    houseBuilding: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: ""
  });

  const handleGuestPostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuestData(prev => ({ ...prev, postalCode: val }));

    if (/^\d{6}$/.test(val)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setGuestData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        console.error("Error fetching pincode details:", err);
      }
    }
  };

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsGuest(true);
      setLoadingAddresses(false);
      return;
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/address`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = data.data || [];
        setAddresses(list);

        // Find default or fallback
        if (list.length > 0) {
          const def = list.find((a: any) => a.isDefault === true || a.isDefault === 1);
          setSelectedAddress(prev => {
            if (prev) {
              return list.find((a: any) => a.addressId === prev.addressId) || prev;
            }
            return def || list[0];
          });
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch user addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Initialize/validate checkout session when items are present
  useEffect(() => {
    if (cartItems.length > 0) {
      sessionStorage.setItem("checkout_session_active", "true");
    }
  }, [cartItems]);

  const handleSaveAddress = async (savedAddr: Address) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // If this is the user's first address, automatically make isDefault = true
    const isFirst = addresses.length === 0;
    const finalIsDefault = savedAddr.isDefault || isFirst;

    try {
      const isEditing = Boolean(savedAddr.addressId);
      const url = isEditing
        ? `${backendUrl}/api/address/${savedAddr.addressId}`
        : `${backendUrl}/api/address`;

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...savedAddr,
          isDefault: finalIsDefault
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        const latestAddress = resData.data;
        await fetchAddresses();

        if (latestAddress) {
          const newFormatted: Address = {
            addressId: latestAddress.addressId,
            fullName: latestAddress.fullName || savedAddr.fullName,
            mobile: latestAddress.mobile || savedAddr.mobile,
            alternateMobile: latestAddress.alternateMobile || savedAddr.alternateMobile,
            houseBuilding: latestAddress.houseBuilding || savedAddr.houseBuilding,
            streetLocality: latestAddress.streetLocality || savedAddr.streetLocality,
            landmark: latestAddress.landmark || savedAddr.landmark,
            city: latestAddress.city || savedAddr.city,
            state: latestAddress.state || savedAddr.state,
            country: latestAddress.country || savedAddr.country || "India",
            postalCode: latestAddress.postalCode || savedAddr.postalCode,
            addressType: latestAddress.addressType || savedAddr.addressType,
            isDefault: finalIsDefault
          };
          setSelectedAddress(newFormatted);
        }

        setIsAddModalOpen(false);
        setAddressToEdit(null);
      } else {
        console.error("❌ Failed to save address:", resData.error);
      }
    } catch (err) {
      console.error("❌ Error saving address:", err);
    }
  };

  const confirmDeleteAddress = async () => {
    if (addressToDelete === null) return;
    const addressId = addressToDelete;

    const token = localStorage.getItem("token");
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${backendUrl}/api/address/${addressId}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        await fetchAddresses();
        if (selectedAddress?.addressId === addressId) {
          setSelectedAddress(null);
        }
        setAddressToDelete(null);
      } else {
        console.error("❌ Failed to delete address:", resData.error);
      }
    } catch (err) {
      console.error("❌ Error deleting address:", err);
    }
  };

  // If cart is empty, render clean Empty State page
  if (cartItems.length === 0) {
    return (
      <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 flex flex-col items-center justify-center font-sans text-light">
        <div className="max-w-md w-full bg-primary border border-light/5 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Gold Glow Radial Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto w-20 h-20 bg-bg-blue/10 border border-bg-blue/20 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-bg-blue stroke-[1.5]" />
          </div>

          <h2 className="font-instrumentserif text-3xl sm:text-4xl font-normal uppercase tracking-wider text-light mb-3 leading-tight">
            Your cart is empty.
          </h2>

          <p className="text-sm text-Pinball leading-relaxed font-light mb-8 max-w-xs mx-auto">
            You do not have any items in your checkout summary. Add items to cart to proceed.
          </p>

          <Link
            href="/shop"
            className="w-full h-11 bg-bg-blue hover:bg-bg-blue/90 text-light text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Compute prices dynamically from backend loaded cart items
  const { subtotal, stitching, shipping, grandTotal } = calculateOrderSummary(cartItems);

  return (
    <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-4 sm:px-8 lg:px-16 font-sans text-light">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <h1 className="text-center uppercase font-instrumentserif text-2xl md:text-4xl lg:text-5xl text-light leading-[1.1] transform scale-y-130 origin-center mb-10 select-none">
          Order Summary
        </h1>

        {/* Step Indicator */}
        <StepIndicator currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Side: Address & Products */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section 1: Delivery Address */}
            <div className="bg-primary rounded-xl border border-light/5 p-6 text-left shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-bg-blue stroke-[1.5]" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-light">
                    Delivery Address
                  </h3>
                </div>
                {!isGuest && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressToEdit(null);
                      setIsAddModalOpen(true);
                    }}
                    className="text-[10px] uppercase font-bold tracking-widest text-bg-blue hover:text-light transition-colors"
                  >
                    Add New Address
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {isGuest ? (
                  <div className="bg-tertiary border border-white/5 p-5 rounded-lg space-y-4">
                    <p className="text-sm font-light text-Pinball">Please provide your details for delivery.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">First Name *</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.firstName} onChange={e => setGuestData({ ...guestData, firstName: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">Last Name *</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.lastName} onChange={e => setGuestData({ ...guestData, lastName: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">Email Address *</label>
                        <input type="email" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.email} onChange={e => setGuestData({ ...guestData, email: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">Mobile Number *</label>
                        <input type="tel" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.mobile} onChange={e => setGuestData({ ...guestData, mobile: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">House/Building *</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.houseBuilding} onChange={e => setGuestData({ ...guestData, houseBuilding: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">Street/Locality *</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.streetLocality} onChange={e => setGuestData({ ...guestData, streetLocality: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">Landmark</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.landmark} onChange={e => setGuestData({ ...guestData, landmark: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">Postal Code *</label>
                        <input type="text" maxLength={6} className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.postalCode} onChange={handleGuestPostalCodeChange} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">City *</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.city} onChange={e => setGuestData({ ...guestData, city: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-Pinball mb-1">State *</label>
                        <input type="text" className="w-full bg-[#08142c] border border-white/10 rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-[#D4AF37]" value={guestData.state} onChange={e => setGuestData({ ...guestData, state: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ) : loadingAddresses ? (
                  <p className="text-xs text-Pinball/50 italic py-2">Loading delivery address...</p>
                ) : addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <label
                      key={addr.addressId}
                      className={`flex items-start gap-4 p-5 rounded-lg border cursor-pointer transition-colors ${selectedAddress?.addressId === addr.addressId
                          ? "bg-tertiary border-[#D4AF37]"
                          : "bg-tertiary border-white/5 hover:border-white/20"
                        }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={addr.addressId}
                        checked={selectedAddress?.addressId === addr.addressId}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-1 accent-[#D4AF37] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-base text-light">{addr.fullName}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-[#EBE3D5] text-black">
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-bg-blue/20 text-bg-blue border border-bg-blue/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                                Default
                              </span>
                            )}
                            <span className="text-sm text-Pinball font-mono">{addr.mobile}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAddressToEdit(addr);
                              }}
                              className="text-[10px] bg-white/5 border border-white/10 hover:bg-white/10 text-light px-2.5 py-1 rounded transition-colors uppercase font-bold tracking-widest cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAddressToDelete(addr.addressId!);
                              }}
                              className="text-[10px] bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded transition-colors uppercase font-bold tracking-widest cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-Pinball/90 leading-relaxed font-light mt-2 text-left text-light">
                          {addr.houseBuilding}, {addr.streetLocality}
                          {addr.landmark ? `, Near ${addr.landmark}` : ""}
                          , {addr.city}, {addr.state} - {addr.postalCode}, {addr.country || "India"}
                        </p>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-Pinball/50 italic mb-3">No delivery address found.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-6 py-2.5 bg-bg-blue hover:bg-bg-blue/90 text-light text-[10px] font-bold tracking-widest uppercase rounded-md transition-colors"
                    >
                      Add New Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Ordered Products */}
            <div className="bg-primary rounded-xl border border-light/5 p-6 text-left shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-bg-blue stroke-[1.5]" />
                <h3 className="text-base font-bold uppercase tracking-wider text-light">
                  Ordered Products
                </h3>
              </div>

              <div className="space-y-4">
                {(() => {
                  const estimatedDate = new Date();
                  estimatedDate.setDate(estimatedDate.getDate() + 5);
                  const dateString = estimatedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                  });

                  return cartItems.map((item: any) => {
                    const isCustom = Boolean(item.is_custom) === true;
                    const pType = (item.pro_type_name || "").toLowerCase();
                    const isPant = pType === "pant" || pType === "pants";
                    const isShorts = pType === "shorts" || pType === "short";
                    return (
                      <div
                        key={item.cart_id}
                        className="bg-tertiary border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-stretch group"
                      >
                        <div className="flex flex-row gap-4">
                          {/* Image Thumbnail */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={resolveImageUrl(item.pro_img)}
                              alt={item.pro_name}
                              fill
                              sizes="(max-width: 768px) 25vw, 15vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                              unoptimized
                            />
                          </div>

                          {/* Content details */}
                          <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm sm:text-base font-bold text-light truncate uppercase text-left">
                                  {item.pro_name}
                                </h4>
                              </div>
                              <p className="text-xs sm:text-sm text-Pinball mt-1 leading-relaxed line-clamp-2 font-light">
                                {item.cover_description}
                              </p>
                            </div>

                            {/* Desktop Monogram Section */}
                            <div className="hidden sm:block">
                              {item.monogram?.enabled && (
                                <div className="mt-3 bg-[#0a152e] border border-white/5 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                                      {item.monogram.type === 'upload' || item.monogram.upload_file ? "Custom Monogram" : "Monogram"}
                                    </h5>
                                  </div>
                                  {item.monogram.type === 'upload' || item.monogram.upload_file ? (
                                    <div className="flex items-center justify-between text-xs text-white/80">
                                      <span className="font-mono text-white text-[11px] truncate max-w-[150px] sm:max-w-[200px]">
                                        {item.monogram.file_name || item.monogram.upload_file?.split('/').pop() || 'logo.pdf'}
                                      </span>
                                      {item.monogram.upload_file && (
                                        <a
                                          href={item.monogram.upload_file.startsWith('http') ? item.monogram.upload_file : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${item.monogram.upload_file}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[9px] sm:text-[10px] text-[#D4AF37] hover:underline font-semibold uppercase tracking-wider whitespace-nowrap ml-2"
                                        >
                                          View File
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 text-xs text-white/80">
                                      <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest sm:normal-case sm:tracking-normal whitespace-nowrap">Text:</span> <span className="tracking-widest text-right">{item.monogram.text}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest sm:normal-case sm:tracking-normal whitespace-nowrap">Placement:</span> <span className="text-right">{item.monogram.placement_name}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest sm:normal-case sm:tracking-normal whitespace-nowrap">Color:</span> <span className="text-right">{item.monogram.color_name}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest sm:normal-case sm:tracking-normal whitespace-nowrap">Font:</span> <span className="text-right">{item.monogram.font_name}</span></div>
                                    </div>
                                  )}
                                  <div className="text-[10px] sm:text-xs font-bold text-[#D4AF37] mt-2 pt-1.5 border-t border-white/10 flex justify-between items-center">
                                    <span className="whitespace-nowrap">Additional Charge:</span>
                                    <span>₹{item.monogram.extra_price}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Selections / Specifications details */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 select-none text-[12px] font-bold tracking-wider text-Pinball">
                              {item.fit_style && (
                                <div className="flex flex-row items-center gap-1 w-full sm:w-auto mb-0.5">
                                  <span className="text-[#D3D3D3]/40 whitespace-nowrap text-[10px] sm:text-xs uppercase">Fit Style:</span>
                                  <span className="text-light uppercase">{item.fit_style}</span>
                                </div>
                              )}

                              {isCustom ? (
                                <div className="flex flex-col w-full gap-1 mt-1">
                                  <div className="text-[#A37646]">CUSTOM MEASUREMENTS</div>
                                  <div className="text-light text-[11px] font-sans tracking-wide mt-1.5 normal-case font-normal select-text">
                                    {isPant || isShorts ? (
                                      <>Waist: {Number(item.custom_waist).toFixed(2)}" | Inseam: {Number(item.custom_inseam).toFixed(2)}" | Hip: {Number(item.custom_hip).toFixed(2)}" | Thigh: {Number(item.custom_thigh).toFixed(2)}" {!isShorts && `| Knee: ${Number(item.custom_knee).toFixed(2)}"`} | Leg Opening: {Number(item.custom_leg_opening).toFixed(2)}"</>
                                    ) : (
                                      <>Chest: {Number(item.custom_chest).toFixed(2)}" | Length: {Number(item.custom_length).toFixed(2)}" | Shoulder: {Number(item.custom_shoulder).toFixed(2)}" | Sleeve: {Number(item.custom_sleeve).toFixed(2)}"</>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                item.selected_size && (
                                  <div className="flex flex-row items-center gap-1 w-full sm:w-auto">
                                    <span className="text-[#D3D3D3]/40 whitespace-nowrap text-[10px] sm:text-xs uppercase">Size:</span>
                                    <span className="text-light uppercase">{item.selected_size}</span>
                                  </div>
                                )
                              )}

                              {item.selected_sleeve && (
                                <div className="flex flex-row items-center gap-1 w-full sm:w-auto mt-1 sm:mt-0">
                                  <span className="text-[#D3D3D3]/40 whitespace-nowrap text-[10px] sm:text-xs uppercase">Sleeve:</span>
                                  <span className="text-light uppercase">{item.selected_sleeve}</span>
                                </div>
                              )}

                              {!isCustom && item.fit_style && item.selected_size && (
                                <div className="w-full">
                                  <CartItemMeasurements productType={item.pro_type_name || 'Shirt'} fitStyle={item.fit_style} sizeName={item.selected_size} />
                                </div>
                              )}

                              {item.selected_meter && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 w-full mt-1 sm:mt-0">
                                  {item.pro_type_name?.toLowerCase().includes('towel') ? (
                                    <>
                                      <span className="text-[#D3D3D3]/40 whitespace-nowrap text-[10px] sm:text-xs uppercase">Standard Size:</span>
                                      <span className="text-[#A37646] uppercase">{item.selected_meter}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-[#D3D3D3]/40 whitespace-nowrap text-[10px] sm:text-xs uppercase">Length:</span>
                                      <span className="text-[#A37646] uppercase">{item.selected_meter} Meter</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Sizing Specifications & Qty */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 mt-3">
                              <div className="flex flex-col">
                                <span className="text-sm sm:text-base font-bold text-light whitespace-nowrap">
                                  Rs. {(() => {
                                    // Assuming calculateItemPrice is imported from utils/pricing at the top
                                    // Wait, calculateItemPrice is not imported yet. I need to add it to imports.
                                    const { calculateItemPrice } = require('../../../utils/pricing');
                                    return calculateItemPrice(item).totalItemPrice;
                                  })()}/-
                                </span>
                                {item.pro_type_name?.toLowerCase().includes('fabric') && item.selected_meter && (
                                  <span className="text-[10px] text-Pinball">
                                    (Rs. {item.price} / Meter)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1 bg-primary rounded-md border border-white/10">
                                <span className="text-xs uppercase font-semibold text-white/50 tracking-wider">Qty</span>
                                <span className="text-sm font-bold text-light">{item.quantity}</span>
                              </div>
                            </div>

                            {/* Est Delivery Badge */}
                            <div className="flex flex-row items-center justify-start gap-1 sm:gap-1.5 bg-[#EBE3D5]/5 border border-[#EBE3D5]/10 px-2 sm:px-2.5 py-1 rounded-md mt-4 self-start sm:ml-auto overflow-hidden max-w-[100%]">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-bg-blue shrink-0" />
                              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold text-bg-blue truncate">
                                Delivery: {dateString}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Monogram Section */}
                        <div className="block sm:hidden w-full">
                          {item.monogram?.enabled && (
                            <div className="bg-[#0a152e] border border-white/5 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                                  {item.monogram.type === 'upload' || item.monogram.upload_file ? "Custom Monogram" : "Monogram"}
                                </h5>
                              </div>
                              {item.monogram.type === 'upload' || item.monogram.upload_file ? (
                                <div className="flex items-center justify-between text-xs text-white/80">
                                  <span className="font-mono text-white text-[11px] truncate max-w-[150px]">
                                    {item.monogram.file_name || item.monogram.upload_file?.split('/').pop() || 'logo.pdf'}
                                  </span>
                                  {item.monogram.upload_file && (
                                    <a
                                      href={item.monogram.upload_file.startsWith('http') ? item.monogram.upload_file : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${item.monogram.upload_file}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[9px] text-[#D4AF37] hover:underline font-semibold uppercase tracking-wider whitespace-nowrap ml-2"
                                    >
                                      View File
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1.5 text-xs text-white/80">
                                  <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] uppercase tracking-widest whitespace-nowrap">Text:</span> <span className="tracking-widest text-right">{item.monogram.text}</span></div>
                                  <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] uppercase tracking-widest whitespace-nowrap">Placement:</span> <span className="text-right">{item.monogram.placement_name}</span></div>
                                  <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] uppercase tracking-widest whitespace-nowrap">Color:</span> <span className="text-right">{item.monogram.color_name}</span></div>
                                  <div className="flex justify-between items-center"><span className="text-white/40 text-[10px] uppercase tracking-widest whitespace-nowrap">Font:</span> <span className="text-right">{item.monogram.font_name}</span></div>
                                </div>
                              )}
                              <div className="text-[10px] font-bold text-[#D4AF37] mt-2 pt-1.5 border-t border-white/10 flex justify-between items-center">
                                <span className="whitespace-nowrap">Additional Charge:</span>
                                <span>₹{item.monogram.extra_price}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>

          {/* Right Side: Sticky Price details */}
          <div className="lg:col-sticky lg:top-28 space-y-6">
            <div className="bg-primary rounded-xl border border-light/5 p-6 shadow-sm text-left">
              <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono mb-4 pb-2 border-b border-white/5">
                Price Details
              </h3>

              <div className="space-y-3.5 text-sm text-Pinball font-medium">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#D3D3D3]/80">Subtotal (MRP)</span>
                  <span className="font-bold text-light">Rs. {subtotal}/-</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#D3D3D3]/80">GST (5%)</span>
                  <span className="font-bold text-[#D4AF37]">Included</span>
                </div>
                {stitching > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#D3D3D3]/80">Stitching Charge</span>
                    <span className="font-bold text-light">Rs. {stitching}/-</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-light">
                    {shipping === "FREE" ? (
                      <span className="text-emerald-500 font-bold uppercase font-sans">Free</span>
                    ) : (
                      <span className="font-mono">Rs. {shipping}/-</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-baseline">
                <span className="text-sm uppercase font-bold tracking-wider text-light">Total Amount</span>
                <span className="text-xl font-bold text-light font-mono">Rs. {grandTotal}/-</span>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={async () => {
                  if (isGuest) {
                    if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.mobile || !guestData.houseBuilding || !guestData.streetLocality || !guestData.city || !guestData.state || !guestData.postalCode) {
                      showAlert("warning", "Required Fields", "Please fill all the mandatory fields.");
                      return;
                    }
                    try {
                      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                      const res = await fetch(`${backendUrl}/api/auth/check-guest-email`, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: guestData.email })
                      });
                      const data = await res.json();
                      if (data.code === "REGISTERED_USER_EXISTS") {
                        setShowRegisteredUserModal(true);
                        return;
                      }

                      if (res.ok && data.success) {
                        sessionStorage.setItem("guest_checkout_data", JSON.stringify(guestData));
                        sessionStorage.setItem("checkout_address_id", "GUEST");
                        router.push("/payment");
                      }
                    } catch (err) {
                      showAlert("error", "Error", "Something went wrong.");
                    }
                  } else {
                    if (!selectedAddress) {
                      showAlert("warning", "Address Required", "Please select or add a delivery address.");
                      return;
                    }
                    sessionStorage.setItem("checkout_address_id", String(selectedAddress.addressId));
                    router.push("/payment");
                  }
                }}
                className="w-full h-11 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer mt-6"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Add/Edit New Address Modal */}
        <EditAddressModal
          isOpen={isAddModalOpen || addressToEdit !== null}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddressToEdit(null);
          }}
          onSave={handleSaveAddress}
          initialAddress={addressToEdit}
        />

        {/* Custom Delete Confirmation Modal */}
        {addressToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ease-out"
              onClick={() => setAddressToDelete(null)}
            />
            <div
              className="relative bg-[#08142c] border border-red-500/20 rounded-2xl w-full max-w-sm flex flex-col p-6 sm:p-8 shadow-2xl shadow-black text-light z-10 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-red-500 text-2xl">!</span>
                </div>
                <h3 className="font-instrumentserif text-xl sm:text-2xl uppercase tracking-widest text-light leading-none mb-2">
                  Delete Address
                </h3>
                <p className="text-xs text-Pinball/80">
                  Are you sure you want to delete this address? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setAddressToDelete(null)}
                  className="flex-1 h-10 border border-white/10 hover:border-white/30 text-xs font-bold uppercase tracking-widest rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAddress}
                  className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already Registered Modal */}
        {showRegisteredUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ease-out"
              onClick={() => setShowRegisteredUserModal(false)}
            />
            <div
              className="relative bg-[#08142c] border border-white/20 rounded-2xl w-full max-w-sm flex flex-col p-6 sm:p-8 shadow-2xl shadow-black text-light z-10 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-[#EBE3D5] rounded-full flex items-center justify-center mb-4">
                  <span className="text-black text-2xl font-bold">!</span>
                </div>
                <h3 className="font-instrumentserif text-xl sm:text-2xl tracking-widest text-light leading-none mb-2">
                  Already Registered
                </h3>
                <p className="text-xs text-Pinball/80 mt-3 leading-relaxed">
                  This email is already linked to an existing account.<br /><br />
                  Please sign in to continue your purchase. If you wish to use a different email, you can go back and change the email address in the Delivery Address form.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisteredUserModal(false)}
                  className="flex-1 h-10 border border-white/10 hover:border-white/30 text-xs font-bold uppercase tracking-widest rounded transition-colors cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/signin")}
                  className="flex-1 h-10 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-bold uppercase tracking-widest rounded transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
