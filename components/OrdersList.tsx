"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag, ShieldCheck, Eye, X } from "lucide-react";
import { Order } from "../types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please sign in to view your orders.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/orders/user`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          const list = Array.isArray(data) ? data : data.data || [];
          setOrders(list);
        } else {
          setError(data.message || "Failed to fetch orders.");
        }
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        setError("Network error. Failed to fetch your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 w-full text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-primary/50 border border-white/5 p-5 rounded-xl h-96 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-primary/20 rounded-xl border border-light/5 text-Pinball">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-primary rounded-xl border border-light/5 shadow-sm max-w-2xl mx-auto flex flex-col items-center gap-6">
        <p className="text-Pinball text-base sm:text-lg">Your orders list is currently empty.</p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  // Map one card per order
  const orderCards = orders.map((order) => {
    const prod = order.products && order.products.length > 0 ? order.products[0] : null;
    const additionalItems = order.products ? order.products.length - 1 : 0;
    
    let sizeStr = "";
    if (prod) {
      if (prod.custom_measurement) {
        try {
          const cm = typeof prod.custom_measurement === 'string'
            ? JSON.parse(prod.custom_measurement)
            : prod.custom_measurement;
          if (cm.waist || cm.inseam || cm.hip || cm.thigh || cm.knee || cm.leg_opening) {
            sizeStr = `CUSTOM (W:${cm.waist || ""}, I:${cm.inseam || ""}, H:${cm.hip || ""}, T:${cm.thigh || ""}, K:${cm.knee || ""}, LO:${cm.leg_opening || ""})`;
          } else {
            sizeStr = `CUSTOM (C:${cm.chest || ""}, L:${cm.length || ""}, S:${cm.shoulder || ""}, Sl:${cm.sleeve || ""})`;
          }
        } catch (e) {
          sizeStr = "CUSTOM";
        }
      } else if (prod.selected_size) {
        sizeStr = prod.selected_size;
      } else if (prod.selected_length) {
        sizeStr = prod.product_name?.toLowerCase().includes('towel') ? `Standard Size: ${prod.selected_length}` : `${prod.selected_length} Meters`;
      }
    }

    return {
      order_id: order.order_id,
      order_number: order.order_number,
      order_status: order.order_status,
      grand_total: order.grand_total,
      created_at: order.created_at,
      expected_delivery: order.expected_delivery,
      product_name: prod ? prod.product_name : "Unknown Product",
      product_image: prod ? prod.product_image : "/images/shop/category.webp",
      fit_style: prod ? prod.fit_style : null,
      quantity: prod ? prod.quantity : 0,
      size_display: sizeStr,
      additional_items: additionalItems,
      key: `${order.order_number}`
    };
  });

  return (
    <div className="space-y-4 w-full text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {orderCards.map((card) => {


          const formattedDate = card.expected_delivery 
            ? new Date(card.expected_delivery).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })
            : "Delivery date will be updated";

          return (
            <div
              key={card.key}
              className="bg-primary border border-white/5 p-5 rounded-xl flex flex-col justify-between text-left shadow-md hover:border-white/10 transition-all duration-300 group"
            >
              {/* Product Info Row */}
              <div>
                <div className="flex gap-4 items-start relative w-full">
                  <div className="relative w-16 h-16 bg-tertiary rounded-lg shrink-0 overflow-hidden">
                    <Image
                      src={card.product_image?.startsWith("/uploads") ? `${API_URL}${card.product_image}` : (card.product_image || "/images/shop/category.webp")}
                      alt="product cover"
                      fill
                      sizes="15vw"
                      className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-bg-blue text-light text-[9px] w-5 h-5 rounded-md flex items-center justify-center font-bold font-mono">
                      {card.quantity}
                    </span>
                  </div>

                  <div className="grow min-w-0 flex flex-col justify-between min-h-[64px] text-left">
                    <h3 className="font-instrumentserif text-base text-light leading-tight tracking-tight uppercase truncate">
                      {card.product_name} {card.additional_items > 0 && <span className="text-Pinball/70 lowercase text-sm font-sans tracking-normal ml-1">+{card.additional_items} more</span>}
                    </h3>
                    {card.fit_style && (
                      <div className="text-[10px] text-Pinball mt-0.5">
                        Fit Style: <span className="text-light font-semibold">{card.fit_style}</span>
                      </div>
                    )}
                    {card.size_display && (
                      <div className="flex items-center gap-1 mt-1">
                        <Tag className="w-3 h-3 text-[#D4AF37]" />
                        <span className="text-[10px] text-Pinball truncate max-w-[150px]">
                          {card.size_display}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Separator */}
                <div
                  className="w-full h-px my-4"
                  style={{
                    background: "repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0 4px, transparent 4px 7px)"
                  }}
                />

                {/* Details Metrics */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-Pinball mb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-Pinball/60">Order ID</span>
                    <span className="font-sans text-light text-xs font-semibold">{card.order_number}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-Pinball/60">Expected Delivery</span>
                    <span className="text-light font-bold text-xs">{formattedDate}</span>
                  </div>
                </div>



                {card.order_status === "CANCELLED" && (
                  <div className="mb-5 bg-red-950/20 p-3 rounded-lg border border-red-500/10 text-left">
                    <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                      Order Cancelled
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/profile/orders/${card.order_number}`}
                  className="flex-1 h-9 border border-white/10 hover:bg-white/5 text-light text-[10px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
