"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Save, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { showAlert } from "../../../../../utils/modalUtils";

export default function PaymentGatewaySettings() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [enabledGateways, setEnabledGateways] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/payment-gateway`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setGateways(data);
        const activeGateways = data.filter((g: any) => g.is_enabled === 1).map((g: any) => g.gateway_name);
        setEnabledGateways(activeGateways);
      } else {
        showAlert("error", "Error", "Failed to fetch gateway settings.");
      }
    } catch (err) {
      showAlert("error", "Error", "Network error fetching settings.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGateway = (gateway: string) => {
    setEnabledGateways(prev => 
      prev.includes(gateway) ? prev.filter(g => g !== gateway) : [...prev, gateway]
    );
    setIsApplied(false);
  };

  const handleApply = () => {
    setIsApplied(true);
    showAlert("success", "Settings Applied", "Settings applied locally. Please click Save to confirm changes.");
  };

  const handleSave = async () => {
    if (!isApplied) {
      showAlert("warning", "Action Required", "First apply the settings and then save.");
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/payment-gateway`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ gateways: enabledGateways })
      });
      
      if (res.ok) {
        showAlert("success", "Success", "Gateway Preference Updated Successfully");
      } else {
        showAlert("error", "Error", "Unable to update Gateway Preference");
      }
    } catch (err) {
      showAlert("error", "Error", "Unable to update Gateway Preference");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#D4AF37]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-white w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-serif text-[#D4AF37] uppercase tracking-wider mb-2">
          Payment Gateway Settings
        </h1>
        <p className="text-Pinball/70 text-sm md:text-base">
          Choose which payment provider should be available to customers during checkout.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cashfree Card */}
        <div
          onClick={() => toggleGateway("CASHFREE")}
          className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 ${
            enabledGateways.includes("CASHFREE")
              ? "bg-[#0A1128] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] transform -translate-y-1"
              : "bg-[#111A3A] border-2 border-white/5 hover:border-white/20"
          }`}
        >
          {enabledGateways.includes("CASHFREE") && (
            <div className="absolute top-4 right-4 text-[#D4AF37]">
              <CheckCircle className="w-6 h-6 fill-[#D4AF37] text-[#0A1128]" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${enabledGateways.includes('CASHFREE') ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-white/50'}`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">Cashfree Payments</h2>
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">Modern v3 Checkout</p>
            </div>
          </div>
          <div className="space-y-3 mt-6 text-sm text-Pinball/80">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> UPI (GPay, PhonePe, Paytm)</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Credit / Debit Cards</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Net Banking</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Wallets</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Server-to-Server Verification</div>
          </div>
        </div>

        {/* ICICI Card */}
        <div
          onClick={() => toggleGateway("ICICI")}
          className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 ${
            enabledGateways.includes("ICICI")
              ? "bg-[#0A1128] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] transform -translate-y-1"
              : "bg-[#111A3A] border-2 border-white/5 hover:border-white/20"
          }`}
        >
          {enabledGateways.includes("ICICI") && (
            <div className="absolute top-4 right-4 text-[#D4AF37]">
              <CheckCircle className="w-6 h-6 fill-[#D4AF37] text-[#0A1128]" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${enabledGateways.includes('ICICI') ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-white/50'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">ICICI Secure Gateway</h2>
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">Corporate Bank Gateway</p>
            </div>
          </div>
          <div className="space-y-3 mt-6 text-sm text-Pinball/80">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Direct Bank Processing</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Credit / Debit Cards</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Net Banking</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Secure Signature Validation</div>
          </div>
        </div>

        {/* Instamojo Card */}
        <div
          onClick={() => toggleGateway("INSTAMOJO")}
          className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 ${
            enabledGateways.includes("INSTAMOJO")
              ? "bg-[#0A1128] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] transform -translate-y-1"
              : "bg-[#111A3A] border-2 border-white/5 hover:border-white/20"
          }`}
        >
          {enabledGateways.includes("INSTAMOJO") && (
            <div className="absolute top-4 right-4 text-[#D4AF37]">
              <CheckCircle className="w-6 h-6 fill-[#D4AF37] text-[#0A1128]" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${enabledGateways.includes('INSTAMOJO') ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-white/50'}`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">Instamojo</h2>
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">Payment Aggregator</p>
            </div>
          </div>
          <div className="space-y-3 mt-6 text-sm text-Pinball/80">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> UPI (GPay, PhonePe, BHIM)</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Net Banking</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Wallets</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Credit & Debit Cards</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Secure Webhook Integration</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-4 pt-8 mt-8 border-t border-white/10">
        <button
          onClick={handleApply}
          className="flex items-center gap-2 bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold py-4 px-8 rounded-lg transition-all uppercase tracking-wider"
        >
          <CheckCircle className="w-5 h-5" />
          Apply
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A1128] font-bold py-4 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] uppercase tracking-wider"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Gateway Preference
        </button>
      </div>
    </div>
  );
}
