"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Info,
  ChevronRight
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  status: "Success" | "Pending" | "Failed";
  balanceAfter: number;
}

const quickAmounts = [500, 1000, 2000, 5000, 10000];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WalletPage() {
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0.0);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedGateway, setSelectedGateway] = useState("ICICI");
  const [activeGateways, setActiveGateways] = useState<string[]>(["ICICI"]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);

      // Fetch wallet details
      fetch(`${API_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setBalance(parseFloat(resData.data.balance || 0));
        }
      })
      .catch(err => console.error("Error loading wallet details:", err));

      // Fetch transaction history
      fetch(`${API_URL}/api/wallet/transactions?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          const mapped: Transaction[] = resData.data.map((tx: any) => ({
            id: String(tx.transaction_id || tx.id),
            date: new Date(tx.created_at || tx.date).toLocaleDateString("en-GB").replace(/\//g, "-"),
            type: String(tx.transaction_type || tx.type).toLowerCase() as "credit" | "debit",
            description: tx.remarks || tx.description || "Wallet Transaction",
            amount: parseFloat(tx.amount || 0),
            status: tx.transaction_status || tx.status || "Success",
            balanceAfter: parseFloat(tx.balance_after || tx.balanceAfter || 0)
          }));
          setTransactions(mapped);
        }
      })
      .catch(err => console.error("Error loading transactions:", err));

      // Fetch active payment gateway
      fetch(`${API_URL}/api/admin/payment-gateway`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const actives = data.filter((g: any) => g.is_enabled === 1).map((g: any) => g.gateway_name);
            setActiveGateways(actives);
            
            if (actives.includes("ICICI")) {
              setSelectedGateway("ICICI");
            } else if (actives.includes("CASHFREE")) {
              setSelectedGateway("CASHFREE");
            } else if (actives.includes("INSTAMOJO")) {
              setSelectedGateway("INSTAMOJO");
            }
          }
        })
        .catch(err => console.error("Error fetching payment gateway:", err));
    }
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleQuickChipClick = (amount: number) => {
    setCustomAmount(String(amount));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]*$/.test(val)) {
      setCustomAmount(val);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(customAmount);
    
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("Please select or enter a valid amount.", "error");
      return;
    }

    if (amountVal > 50000) {
      showToast("Maximum recharge limit per transaction is ₹50,000.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Session expired. Please sign in again.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/wallet/add-money`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amountVal, gateway: selectedGateway })
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.payment_url) {
        window.location.href = resData.payment_url;
      } else {
        showToast(resData.error || "Failed to initiate recharge redirect.", "error");
      }
    } catch (err) {
      console.error("Add money recharge error:", err);
      showToast("Network error initiating payment gateway.", "error");
    }
  };

  if (!isClient) return null;

  if (!isLoggedIn) {
    return (
      <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 font-sans text-light flex flex-col items-center justify-center">
        <div className="bg-[#102554]/50 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xl backdrop-blur-sm">
          <div className="mx-auto w-16 h-16 bg-[#08142c] rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-instrumentserif text-3xl uppercase tracking-wider text-white">ACCESS DENIED</h2>
            <p className="text-xs text-Pinball leading-relaxed">
              Please sign in to view your Fabric Luxure wallet, recharge, and manage your recent transactions.
            </p>
          </div>
          <Link
            href="/signin"
            className="block w-full py-3 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#08142c] font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-md text-center"
          >
            SIGN IN NOW
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 font-sans text-light">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col gap-1 text-left border-b border-white/5 pb-4">
          <h1 className="font-instrumentserif text-3xl md:text-4xl lg:text-4xl text-light uppercase tracking-wider scale-y-110 origin-left">
            MY WALLET
          </h1>
          <p className="text-xs text-Pinball">Recharge and manage your store wallet credit.</p>
        </div>

        {/* Responsive Grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Balance card & Recharge options (Col Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#102554] to-[#08142c] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">Available Balance</span>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
                    ₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="w-10 h-10 bg-[#08142c] border border-white/5 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5 text-[10px] text-Pinball/80 uppercase font-mono select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Secured Payment & Faster Checkout</span>
              </div>
            </div>

            {/* Quick Recharge Card */}
            <div className="bg-[#102554]/40 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl text-left space-y-6">
              <div>
                <h3 className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold">RECHARGE WALLET</h3>
                <p className="text-[10px] text-Pinball mt-1 leading-relaxed">Choose a fast amount or insert custom value below to add funds instantly.</p>
              </div>

              {/* Quick Add Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 select-none">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickChipClick(amt)}
                    className="py-2 rounded-lg border border-white/10 hover:border-[#D4AF37]/40 bg-[#08142c]/50 text-xs font-semibold text-white transition-all cursor-pointer text-center hover:bg-[#08142c] focus:outline-none"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Form Input */}
              <form onSubmit={handleAddMoney} className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-Pinball font-semibold">Custom Amount (₹)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-sm text-Pinball/60 font-semibold">₹</span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 text-sm placeholder:text-Pinball/30 text-white rounded-lg border border-white/10 bg-[#08142c] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-2">
                  <label className="text-[10px] uppercase tracking-wider text-Pinball font-semibold">Payment Gateway</label>
                  <div className="grid grid-cols-1 gap-3">
                    {activeGateways.includes("ICICI") && (
                      <label className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedGateway === "ICICI" ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/10 bg-[#08142c] hover:border-white/20"}`}>
                        <input type="radio" name="gateway" value="ICICI" checked={selectedGateway === "ICICI"} onChange={() => setSelectedGateway("ICICI")} className="hidden" />
                        <div className="flex flex-col ml-3">
                          <span className="text-white text-sm font-semibold">ICICI Bank Gateway</span>
                          <span className="text-Pinball text-xs">ICICI E-Commerce Portal</span>
                        </div>
                        {selectedGateway === "ICICI" && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] absolute right-3" />}
                      </label>
                    )}

                    {activeGateways.includes("CASHFREE") && (
                      <label className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedGateway === "CASHFREE" ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/10 bg-[#08142c] hover:border-white/20"}`}>
                        <input type="radio" name="gateway" value="CASHFREE" checked={selectedGateway === "CASHFREE"} onChange={() => setSelectedGateway("CASHFREE")} className="hidden" />
                        <div className="flex flex-col ml-3">
                          <span className="text-white text-sm font-semibold">Cashfree Payments</span>
                          <span className="text-Pinball text-xs">UPI, Cards, Net Banking, Wallets</span>
                        </div>
                        {selectedGateway === "CASHFREE" && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] absolute right-3" />}
                      </label>
                    )}

                    {activeGateways.includes("INSTAMOJO") && (
                      <label className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedGateway === "INSTAMOJO" ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/10 bg-[#08142c] hover:border-white/20"}`}>
                        <input type="radio" name="gateway" value="INSTAMOJO" checked={selectedGateway === "INSTAMOJO"} onChange={() => setSelectedGateway("INSTAMOJO")} className="hidden" />
                        <div className="flex flex-col ml-3">
                          <span className="text-white text-sm font-semibold">Instamojo Payments</span>
                          <span className="text-Pinball text-xs">UPI, Net Banking, Wallets</span>
                        </div>
                        {selectedGateway === "INSTAMOJO" && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] absolute right-3" />}
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-bg-blue hover:bg-bg-blue/90 border border-bg-blue/50 text-white text-xs uppercase tracking-widest rounded-full cursor-pointer font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Money</span>
                </button>
              </form>
            </div>

            {/* Wallet Benefits */}
            <div className="bg-[#102554]/20 border border-white/5 rounded-2xl p-6 shadow-xl text-left space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Wallet Benefits
              </h4>
              <ul className="grid grid-cols-2 gap-3 text-xs text-Pinball">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Faster Checkout</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instant Refunds</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Secure Payments</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No Expiry</span>
                </li>
              </ul>
            </div>

          </div>

          {/* RIGHT COLUMN: Transaction History List (Col Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            
            {/* Header Title */}
            <div className="flex justify-between items-center bg-[#102554]/30 border border-white/5 px-6 py-4 rounded-xl text-left">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                <History className="w-4 h-4" /> Wallet Transactions
              </h3>
              <span className="text-[10px] uppercase font-mono text-Pinball/75">{transactions.length} records</span>
            </div>

            {/* Transaction Grid/List */}
            <div className="bg-[#102554]/10 border border-white/5 rounded-2xl shadow-xl text-left">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-5 py-24 text-center select-none">
                  <div className="w-16 h-16 bg-[#08142c] border border-white/5 rounded-full flex items-center justify-center">
                    <History className="w-7 h-7 text-Pinball/30" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-light mb-1">No Wallet Transactions Yet</h4>
                    <p className="text-xs text-Pinball/70">Recharge your wallet to initiate transactions.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto custom-scrollbar w-full max-h-[720px]">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-white/5 bg-[#102554]/30 text-Pinball">
                        <th className="p-4 text-[10px] uppercase font-mono tracking-wider font-semibold">Date</th>
                        <th className="p-4 text-[10px] uppercase font-mono tracking-wider font-semibold">Description</th>
                        <th className="p-4 text-[10px] uppercase font-mono tracking-wider font-semibold">Amount</th>
                        <th className="p-4 text-[10px] uppercase font-mono tracking-wider font-semibold">Status</th>
                        <th className="p-4 text-[10px] uppercase font-mono tracking-wider font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-Pinball">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-[10px] text-Pinball/60">{tx.date}</td>
                          <td className="p-4 font-semibold text-white">
                            <div className="flex flex-col gap-0.5">
                              <span>{tx.description}</span>
                              <span className="text-[9px] font-normal uppercase tracking-wider text-[#D4AF37]">ID: {tx.id}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {tx.type === "credit" ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                                <span>+ ₹{tx.amount.toFixed(2)}</span>
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold flex items-center gap-1">
                                <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                                <span>- ₹{tx.amount.toFixed(2)}</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold select-none">
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-light/80">₹{tx.balanceAfter.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30"
              : "bg-red-950/90 text-red-400 border-red-500/30"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
