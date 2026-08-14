"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ListOrdered, AlertTriangle } from "lucide-react";
import OrdersList from "../../../components/OrdersList";
import { useCart } from "../../../context/cartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface OrderSuccessDetails {
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  amountPaid: number;
  expectedDelivery: string;
}

export default function OrderSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<OrderSuccessDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const { clearCart } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsGuest(true);
        const guestDataStr = sessionStorage.getItem("guest_checkout_data");
        if (guestDataStr) {
          try {
            const parsed = JSON.parse(guestDataStr);
            setGuestEmail(parsed.email || "");
          } catch (e) { }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qOrderNum = params.get("orderNumber");

      if (!qOrderNum) {
        setError("No order number provided in the URL.");
        setLoading(false);
        return;
      }

      // Fetch order success details from backend
      const fetchDetails = async () => {
        try {
          const res = await fetch(`${API_URL}/api/orders/details/${qOrderNum}`);
          const data = await res.json();

          if (res.ok && data.success) {
            setDetails(data);
            clearCart();
          } else {
            setError(data.message || "Failed to load order confirmation details.");
          }
        } catch (err) {
          console.error("❌ Error loading success details:", err);
          setError("A network error occurred. Please check your orders page.");
        } finally {
          setLoading(false);
        }
      };

      fetchDetails();
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-tertiary pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 overflow-hidden flex flex-col justify-start">

      {/* Blurred background showing Your Orders page */}
      <div className="w-full max-w-7xl mx-auto opacity-10 select-none pointer-events-none blur-[2px] transition-opacity duration-300">
        <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-8">
          <h1 className="font-instrumentserif text-3xl sm:text-4xl text-light uppercase tracking-wider scale-y-125 origin-left">
            My Orders
          </h1>
        </div>
        <OrdersList />
      </div>

      {/* Foreground Modal Dialog Overlay with Backdrop Blur */}
      <div className="fixed inset-0 bg-[#030c17]/75 backdrop-blur-[4px] flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="max-w-md w-full bg-primary border border-light/5 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">

          {/* Glow Radial Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-bg-blue/10 rounded-full blur-3xl pointer-events-none" />

          {loading ? (
            /* Loading State */
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-Pinball">Loading order details...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="py-6">
              <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500 stroke-[1.5]" />
              </div>
              <h2 className="font-instrumentserif text-2xl uppercase tracking-wider text-light mb-3">
                Order Confirmed
              </h2>
              <p className="text-sm text-Pinball leading-relaxed font-light mb-8 max-w-xs mx-auto">
                {error}
              </p>
              <div className="space-y-3">
                <Link
                  href="/profile/your-orders"
                  className="w-full h-11 bg-bg-blue hover:bg-bg-blue/90 text-light text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>View My Orders</span>
                </Link>
                <Link
                  href="/shop"
                  className="w-full h-11 bg-transparent hover:bg-white/5 border border-white/10 text-light text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-Pinball" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Success Content */
            <>
              {/* Success Checkmark Circle */}
              <div className="relative mx-auto w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-full animate-ping opacity-30" />
                <CheckCircle className="w-10 h-10 text-[#D4AF37] stroke-[1.5]" />
              </div>

              {/* Serif Header */}
              <h2 className="font-instrumentserif text-3xl sm:text-4xl font-normal uppercase tracking-wider text-light mb-3 leading-tight">
                Order Successfully Placed
              </h2>

              <p className="text-sm text-Pinball leading-relaxed font-light mb-6 max-w-xs mx-auto">
                Thank you for choosing Fabric Luxure. Your order has been registered, and confirmation has been dispatched.
              </p>

              {/* Dynamic Parameters Summary Container */}
              <div className="bg-tertiary rounded-xl border border-white/5 p-5 mb-8 text-left space-y-3 font-mono text-xs text-Pinball select-none">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="uppercase text-[9px] tracking-wider text-slate-400">Order Number</span>
                  <span className="text-light font-bold">{details?.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="uppercase text-[9px] tracking-wider text-slate-400">Payment Status</span>
                  <span className="text-emerald-500 font-bold uppercase">{details?.paymentStatus}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="uppercase text-[9px] tracking-wider text-slate-400">Payment Method</span>
                  <span className="text-light font-semibold uppercase">{details?.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="uppercase text-[9px] tracking-wider text-slate-400">Amount Paid</span>
                  <span className="text-[#D4AF37] font-bold">Rs. {details?.amountPaid}/-</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="uppercase text-[9px] tracking-wider text-slate-400">Expected Delivery</span>
                  <span className="text-light font-semibold">{details?.expectedDelivery}</span>
                </div>
              </div>

              {/* Navigation Actions Stack */}
              <div className="space-y-3">
                <Link
                  href="/shop"
                  className="w-full h-11 bg-bg-blue hover:bg-bg-blue/90 text-light text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>

                {isGuest ? (
                  <Link
                    href={`/signin${guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''}`}
                    className="w-full h-11 bg-transparent hover:bg-white/5 border border-[#D4AF37] text-[#D4AF37] text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Complete Registration</span>
                  </Link>
                ) : (
                  <Link
                    href="/profile/your-orders"
                    className="w-full h-11 bg-transparent hover:bg-white/5 border border-white/10 text-light text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ListOrdered className="w-4 h-4 text-Pinball" />
                    <span>View My Orders</span>
                  </Link>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
