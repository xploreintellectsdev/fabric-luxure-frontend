"use client";

import Link from "next/link";
import { CreditCard, ChevronRight } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in text-white w-full max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-serif text-[#D4AF37] uppercase tracking-wider mb-2">
          System Settings
        </h1>
        <p className="text-Pinball/70 text-sm md:text-base">
          Manage your store's global configuration and integrations.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/settings/payment-gateway">
          <div className="group bg-[#111A3A] border-2 border-white/5 hover:border-[#D4AF37]/50 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] hover:-translate-y-1 cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0A1128] transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <h2 className="text-lg font-bold tracking-wide text-white group-hover:text-[#D4AF37] transition-colors">Payment Gateway</h2>
            <p className="text-sm text-Pinball/70 mt-2 flex-grow">
              Configure active payment providers (ICICI / Cashfree / Instamojo) for the checkout flow.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
