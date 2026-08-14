"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart, CartItem } from '../../../context/cartContext'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import CartItemMeasurements from '../../../components/CartItemMeasurements'

import { calculateOrderSummary, calculateItemPrice } from '../../../utils/pricing'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img?: string) => {
  if (!img) return "/images/productview/collar.webp";
  if (img.startsWith("http")) return img;
  return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

export default function CartPage() {
  const { cartItems, loading, updateQuantity, removeFromCart, removeMonogramFromCart } = useCart();

  // Price calculations
  const { subtotal, stitching, shipping, grandTotal } = calculateOrderSummary(cartItems);

  if (loading) {
    return (
      <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 font-sans text-light flex flex-col items-center justify-center">
        <p className="text-sm font-semibold tracking-widest uppercase select-none animate-pulse">Loading Your Cart...</p>
      </div>
    );
  }

  return (
    <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 font-sans text-light">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center uppercase font-instrumentserif text-2xl md:text-4xl lg:text-4xl text-light leading-[1.1] transform scale-y-150 origin-center mb-16 select-none">
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center select-none border border-white/5 bg-primary/40 rounded-xl max-w-2xl mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#A37646] stroke-[1.5]" />
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-light mb-1">Your cart is empty</h2>
              <p className="text-xs text-Pinball">Looks like you haven't added any luxury fabrics yet.</p>
            </div>
            <Link
              href="/shop"
              className="mt-2 px-6 py-3 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-semibold tracking-widest uppercase rounded-md transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Items list */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cartItems.map((item) => {
                const imgUrl = resolveImageUrl(item.pro_img);
                const isCustom = Boolean(item.is_custom);

                const pType = (item.pro_type_name || "").toLowerCase();
                const isPant = pType === "pant" || pType === "pants";
                const isShorts = pType === "shorts" || pType === "short";
                const isBlazer = pType === "blazer" || pType === "blazers";

                return (
                  <div
                    key={item.cart_id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border border-white/5 bg-primary/30 rounded-xl relative group transition-all duration-300 hover:border-white/10"
                  >
                    {/* Cover image */}
                    <div className="relative w-full sm:w-28 sm:h-28 aspect-square rounded-lg overflow-hidden border border-white/5 bg-light shrink-0">
                      <Link href={`/productdetailviewpage?id=${item.pro_id}`}>
                        <img
                          src={imgUrl}
                          alt={item.pro_name || "Product image"}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1 text-left">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <Link href={`/productdetailviewpage?id=${item.pro_id}`} className="hover:text-bg-blue transition-colors">
                            <h3 className="text-sm font-bold uppercase tracking-wider leading-snug">{item.pro_name}</h3>
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cart_id)}
                            className="text-Pinball hover:text-red-400 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                        <p className="text-[20px] text-Pinball mt-1.5 line-clamp-1">{item.cover_description}</p>

                        {item.monogram?.enabled && (
                          <div className="flex flex-col gap-1.5 mt-3 select-none p-3 border border-[#D4AF37]/20 bg-[#0A1633]/50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">
                                {item.monogram.type === 'upload' || item.monogram.upload_file ? "Custom Monogram" : "Monogram"}
                              </span>
                              <div className="flex items-center gap-3">
                                {!(item.monogram.type === 'upload' || item.monogram.upload_file) && (
                                  <Link
                                    href={`/productdetailviewpage?id=${item.pro_id}&edit_cart_id=${item.cart_id}`}
                                    className="text-[10px] text-white/50 hover:text-white underline uppercase tracking-wider"
                                  >
                                    Edit
                                  </Link>
                                )}
                                <button
                                  onClick={() => removeMonogramFromCart(item.cart_id)}
                                  className="text-[10px] text-red-400 hover:text-red-300 underline uppercase tracking-wider cursor-pointer"
                                >
                                  Remove Monogram
                                </button>
                              </div>
                            </div>

                            {item.monogram.type === 'upload' || item.monogram.upload_file ? (
                              <div className="flex flex-col gap-1 text-xs text-white/80">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-white text-[11px] truncate max-w-[200px]">
                                    {item.monogram.file_name || item.monogram.upload_file?.split('/').pop() || 'logo.pdf'}
                                  </span>
                                  {item.monogram.upload_file && (
                                    <a
                                      href={item.monogram.upload_file.startsWith('http') ? item.monogram.upload_file : `${API_URL}${item.monogram.upload_file}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-[#D4AF37] hover:underline font-semibold uppercase tracking-wider"
                                    >
                                      View File
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-white/80">
                                <div><span className="text-white/40">Text:</span> <span className="tracking-widest">{item.monogram.text}</span></div>
                                <div><span className="text-white/40">Placement:</span> {item.monogram.placement_name}</div>
                                <div><span className="text-white/40">Color:</span> {item.monogram.color_name}</div>
                                <div><span className="text-white/40">Font:</span> {item.monogram.font_name}</div>
                              </div>
                            )}

                            <div className="text-xs font-bold text-[#D4AF37] mt-1 pt-1 border-t border-white/10 flex justify-between items-center">
                              <span>Additional Charge:</span>
                              <span>₹{item.monogram.extra_price}</span>
                            </div>
                          </div>
                        )}

                        {/* Selections / Specifications details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 select-none text-[18px] uppercase font-bold tracking-wider text-Pinball">
                          {item.fit_style && (
                            <div className="flex items-center gap-1 w-full mb-0.5">
                              <span className="text-[#D3D3D3]/40">Fit Style:</span>
                              <span className="text-light">{item.fit_style}</span>
                            </div>
                          )}

                          {isCustom ? (
                            <div className="flex flex-col w-full gap-1 mt-1 text-[18px]">
                              <div className="text-[#A37646]">CUSTOM MEASUREMENTS</div>
                              <div className="text-light text-xs md:text-sm font-sans tracking-wide mt-1.5 normal-case font-normal select-text">
                                {isPant || isShorts ? (
                                  <>Waist: {Number(item.custom_waist).toFixed(2)}" | Inseam: {Number(item.custom_inseam).toFixed(2)}" | Hip: {Number(item.custom_hip).toFixed(2)}" | Thigh: {Number(item.custom_thigh).toFixed(2)}" {!isShorts && `| Knee: ${Number(item.custom_knee).toFixed(2)}"`} | Leg Opening: {Number(item.custom_leg_opening).toFixed(2)}"</>
                                ) : isBlazer ? (
                                  <>Shoulder: {Number(item.custom_shoulder).toFixed(2)}" | Chest: {Number(item.custom_chest).toFixed(2)}" | Shirt Length: {Number(item.custom_length).toFixed(2)}" | Sleeve Length: {Number(item.custom_sleeve).toFixed(2)}" | Mid Section: {Number(item.custom_waist).toFixed(2)}"</>
                                ) : (
                                  <>Chest: {Number(item.custom_chest).toFixed(2)}" | Length: {Number(item.custom_length).toFixed(2)}" | Shoulder: {Number(item.custom_shoulder).toFixed(2)}" | Sleeve: {Number(item.custom_sleeve).toFixed(2)}"</>
                                )}
                              </div>
                            </div>
                          ) : (
                            item.selected_size && (
                              <div className="flex items-center gap-1">
                                <span className="text-[#D3D3D3]/40">Size:</span>
                                <span className="text-light">{item.selected_size}</span>
                              </div>
                            )
                          )}

                          {item.selected_sleeve && (
                            <div className="flex items-center gap-1">
                              <span className="text-[#D3D3D3]/40">Sleeve:</span>
                              <span className="text-light uppercase">{item.selected_sleeve}</span>
                            </div>
                          )}

                          {!isCustom && item.fit_style && item.selected_size && (
                            <div className="w-full">
                              <CartItemMeasurements productType={item.pro_type_name || 'Shirt'} fitStyle={item.fit_style} sizeName={item.selected_size} />
                            </div>
                          )}

                          {item.selected_meter && (
                            <div className="flex items-center gap-1">
                              {item.pro_type_name?.toLowerCase().includes('towel') ? (
                                <>
                                  <span className="text-[#D3D3D3]/40">Standard Size:</span>
                                  <span className="text-[#A37646]">{item.selected_meter}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[#D3D3D3]/40">Length:</span>
                                  <span className="text-[#A37646]">{item.selected_meter} Meter</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex flex-col text-right">
                          <div className="text-xl font-bold text-light">
                            Rs. {calculateItemPrice(item).totalItemPrice}/-
                          </div>
                          {item.pro_type_name?.toLowerCase().includes('fabric') && item.selected_meter && (
                            <span className="text-xs text-Pinball">
                              (Rs. {item.price} / Meter)
                            </span>
                          )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3 border border-white/10 rounded bg-[#07122a] h-8 px-1">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                            className={`w-7 h-full flex items-center justify-center text-Pinball hover:text-white transition-colors ${item.quantity <= 1 ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                          >
                            <Minus className="w-3 h-3 stroke-2" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center select-none">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                            className="w-7 h-full flex items-center justify-center text-Pinball hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3 stroke-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="p-6 border border-white/5 bg-primary/20 rounded-xl text-left flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#A37646] pb-3 border-b border-white/5">
                  Order Summary
                </h3>

                <div className="flex flex-col gap-3.5 text-sm font-medium text-Pinball">
                  <div className="flex justify-between">
                    <span>Subtotal (MRP)</span>
                    <span className="text-light">Rs. {subtotal}/-</span>
                  </div>
                  {stitching > 0 && (
                    <div className="flex justify-between">
                      <span>Stitching Charge</span>
                      <span className="text-light">Rs. {stitching}/-</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-light">
                      {shipping === "FREE" ? <span className="text-emerald-500 font-bold uppercase">Free</span> : `Rs. ${shipping}/-`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-baseline">
                  <span className="text-sm uppercase font-bold tracking-wider text-light">Total</span>
                  <span className="text-xl font-bold text-light">Rs. {grandTotal}/-</span>
                </div>

                <Link
                  href="/order-summary"
                  className="w-full h-11 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Proceed To Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
