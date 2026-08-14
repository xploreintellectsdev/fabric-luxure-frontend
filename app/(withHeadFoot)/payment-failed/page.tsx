"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { XCircle, ShoppingBag, RefreshCw } from "lucide-react";

export default function PaymentFailedPage() {
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qReason = params.get("reason");
      if (qReason) {
        if (qReason === "payment_declined") setReason("Transaction was declined by the bank.");
        else if (qReason === "invalid_checksum") setReason("Payment verification failed (checksum error).");
        else if (qReason === "session_not_found") setReason("Active payment session could not be retrieved.");
        else setReason("A system or network timeout occurred.");
      }
    }
  }, []);

  return (
    <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 flex flex-col items-center justify-center font-sans text-light">
      <div className="max-w-md w-full bg-primary border border-light/5 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden animate-fade-in">
        
        {/* Red Glow Radial Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Failed Check Circle */}
        <div className="relative mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-red-500/5 rounded-full animate-ping opacity-30" />
          <XCircle className="w-10 h-10 text-red-500 stroke-[1.5]" />
        </div>

        {/* Header */}
        <h2 className="font-instrumentserif text-3xl sm:text-4xl font-normal uppercase tracking-wider text-light mb-3 leading-tight">
          Payment Failed
        </h2>
        
        <p className="text-sm text-Pinball leading-relaxed font-light mb-6 max-w-xs mx-auto">
          We could not complete your transaction. {reason || "Please verify your payment details and try again."}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/order-summary"
            className="w-full h-11 bg-bg-blue hover:bg-bg-blue/90 text-light text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
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
    </div>
  );
}
