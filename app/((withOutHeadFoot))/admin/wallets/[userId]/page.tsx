"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Wallet,
  Clock,
  RefreshCw
} from "lucide-react";

interface UserDetails {
  user_id: number;
  name: string;
  email: string;
  mobile: string | null;
}

interface WalletDetails {
  wallet_id: number;
  balance: number;
  status: string;
  totalRechargeAmount: number;
  totalRefundAmount: number;
  totalWalletPayments: number;
}

interface WalletTransaction {
  transaction_id: number;
  wallet_id: number;
  transaction_type: "CREDIT" | "DEBIT";
  transaction_source: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  remarks: string | null;
  order_id: number | null;
  transaction_status: string;
  created_at: string;
}

interface RechargeHistory {
  topup_id: number;
  amount: number;
  gateway_name: string;
  merchant_txn_no: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminWalletDetailsPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [recharges, setRecharges] = useState<RechargeHistory[]>([]);

  const [activeTab, setActiveTab] = useState<"transactions" | "recharges">("transactions");

  // Credit Wallet Modal State
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("Birthday Gift");
  const [customReason, setCustomReason] = useState("");
  const [creditRemarks, setCreditRemarks] = useState("");
  const [isCrediting, setIsCrediting] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ show: boolean; message: string; onClose?: () => void } | null>(null);

  const executeCredit = async (finalReason: string) => {
    setIsCrediting(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(`${API_URL}/api/admin/wallets/${userId}/credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: creditAmount,
          reason: finalReason,
          remarks: creditRemarks
        })
      });
      const data = await res.json();
      if (data.success) {
        setAlertDialog({
          show: true,
          message: "Wallet credited successfully!",
          onClose: () => {
            setShowCreditModal(false);
            setCreditAmount("");
            setCreditReason("Birthday Gift");
            setCustomReason("");
            setCreditRemarks("");
            window.location.reload();
          }
        });
      } else {
        setAlertDialog({ show: true, message: data.error || "Failed to credit wallet." });
      }
    } catch (err) {
      console.error("❌ Failed to credit wallet:", err);
      setAlertDialog({ show: true, message: "Network error. Please try again." });
    } finally {
      setIsCrediting(false);
    }
  };

  const handleCreditWallet = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      setAlertDialog({ show: true, message: "Please enter a valid amount greater than 0." });
      return;
    }
    const finalReason = creditReason === "Other" ? customReason : creditReason;
    if (!finalReason) {
      setAlertDialog({ show: true, message: "Please provide a reason." });
      return;
    }

    setConfirmDialog({
      show: true,
      message: `Are you sure you want to credit ₹${creditAmount} to this customer's wallet?`,
      onConfirm: () => {
        setConfirmDialog(null);
        executeCredit(finalReason);
      }
    });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin_token") || "";
        const res = await fetch(`${API_URL}/api/admin/wallets/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data.user);
          setWallet(data.data.wallet);
          setTransactions(data.data.transactions);
          setRecharges(data.data.recharges);
        } else {
          setError(data.error || "Failed to load wallet details.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch wallet details:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDetails();
    }
  }, [userId]);

  return (
    <div className="space-y-8 animate-fade-in text-white w-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/wallets"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#D4AF37]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-instrumentserif text-3xl text-white tracking-wide scale-y-110">Wallet Details</h1>
            <p className="text-[14px] text-slate-300 font-mono">Detailed audit view of transaction history and recharge requests.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[14px] font-mono">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-white/50 font-sans">
          Loading customer wallet record details...
        </div>
      ) : !user || !wallet ? (
        <div className="text-center py-12 text-white/50 font-sans">
          Wallet record not found.
        </div>
      ) : (
        <>
          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            {/* Customer Information */}
            <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <User className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-mono text-[14px] uppercase tracking-wider text-[#D4AF37] font-bold">
                  Customer Information
                </h3>
              </div>

              <div className="space-y-4 font-mono text-[14px] text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/50">Full Name:</span>
                  <span className="font-bold text-white font-sans">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Email:</span>
                  <span className="font-bold text-white">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Mobile:</span>
                  <span className="font-bold text-white">{user.mobile || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Wallet Details Information */}
            <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <Wallet className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-mono text-[14px] uppercase tracking-wider text-[#D4AF37] font-bold">
                  Wallet Information
                </h3>
              </div>

              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowCreditModal(true)}
                  className="bg-[#D4AF37] hover:bg-[#b08d2c] text-[#081A42] font-bold px-4 py-2 rounded-lg transition-colors text-[13px] font-mono shadow-lg flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> Credit Wallet
                </button>
              </div>

              <div className="space-y-4 font-mono text-[14px] text-white/80">
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Current Balance:</span>
                  <span className="font-extrabold text-[15px] text-[#D4AF37]">
                    ₹{wallet.balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Wallet Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${wallet.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                  >
                    {wallet.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total Recharges:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{wallet.totalRechargeAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total Refunds:</span>
                  <span className="font-bold text-blue-400">
                    ₹{wallet.totalRefundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total Wallet Payments:</span>
                  <span className="font-bold text-red-400">
                    ₹{wallet.totalWalletPayments.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Tabs */}
          <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl overflow-hidden shadow-xl text-left">
            <div className="border-b border-white/5 flex bg-[#081A42]/60 font-mono text-[10px] uppercase tracking-widest font-bold">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-6 py-4 border-r border-white/5 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "transactions"
                    ? "bg-[#081A42] text-[#D4AF37] border-b-2 border-b-[#D4AF37]"
                    : "text-white/50 hover:text-white/80"
                  }`}
              >
                <Clock className="w-4 h-4" />
                <span>Transaction History</span>
              </button>
              <button
                onClick={() => setActiveTab("recharges")}
                className={`px-6 py-4 border-r border-white/5 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "recharges"
                    ? "bg-[#081A42] text-[#D4AF37] border-b-2 border-b-[#D4AF37]"
                    : "text-white/50 hover:text-white/80"
                  }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharge History</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === "transactions" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[14px]">
                    <thead>
                      <tr className="border-b border-white/5 font-mono text-white/50 uppercase tracking-wider">
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Source</th>
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Balance Before</th>
                        <th className="pb-3">Balance After</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-white/80">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-white/40 font-sans">
                            No wallet transactions recorded.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.transaction_id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 text-white/60">
                              {new Date(t.created_at).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.transaction_type === "CREDIT"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}
                              >
                                {t.transaction_type}
                              </span>
                            </td>
                            <td className="py-3 font-bold">{t.transaction_source}</td>
                            <td className="py-3 text-white/70">{t.order_id || "—"}</td>
                            <td className="py-3 font-bold text-[#D4AF37]">
                              ₹{parseFloat(String(t.amount || 0)).toFixed(2)}
                            </td>
                            <td className="py-3 text-white/60">
                              ₹{parseFloat(String(t.balance_before || 0)).toFixed(2)}
                            </td>
                            <td className="py-3 text-white/60">
                              ₹{parseFloat(String(t.balance_after || 0)).toFixed(2)}
                            </td>
                            <td className="py-3">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                                {t.transaction_status}
                              </span>
                            </td>
                            <td className="py-3 text-[10px] text-white/60 max-w-xs truncate" title={t.remarks || ""}>
                              {t.remarks || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[14px]">
                    <thead>
                      <tr className="border-b border-white/5 font-mono text-white/50 uppercase tracking-wider">
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Recharge Amount</th>
                        <th className="pb-3">Gateway</th>
                        <th className="pb-3">Merchant Transaction Number</th>
                        <th className="pb-3">Gateway Transaction ID</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-white/80">
                      {recharges.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-white/40 font-sans">
                            No topup requests found.
                          </td>
                        </tr>
                      ) : (
                        recharges.map((r) => (
                          <tr key={r.topup_id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 text-white/60">
                              {new Date(r.created_at).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 font-bold text-emerald-400">
                              ₹{parseFloat(String(r.amount || 0)).toFixed(2)}
                            </td>
                            <td className="py-3 text-white/70">{r.gateway_name}</td>
                            <td className="py-3 text-white/70 select-all">{r.merchant_txn_no}</td>
                            <td className="py-3 text-white/70 select-all">{r.transaction_id || "—"}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${r.status === "SUCCESS"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : r.status === "PENDING"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Credit Wallet Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#081A42]/50 p-6 rounded-2xl max-w-md w-full m-4 shadow-2xl">
            <h2 className="font-instrumentserif text-3xl text-white mb-2 tracking-wide">Credit Wallet</h2>
            <p className="text-white/60 text-[14px] mb-6">Manually credit funds to this user's wallet.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-[12px] font-bold mb-2 uppercase tracking-wider">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-white/70 text-[12px] font-bold mb-2 uppercase tracking-wider">Reason</label>
                <select
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="Birthday Gift">Birthday Gift</option>
                  <option value="Festival Bonus">Festival Bonus</option>
                  <option value="Loyalty Reward">Loyalty Reward</option>
                  <option value="Compensation">Compensation</option>
                  <option value="Promotional Credit">Promotional Credit</option>
                  <option value="Refund">Refund</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {creditReason === "Other" && (
                <div>
                  <label className="block text-white/70 text-[12px] font-bold mb-2 uppercase tracking-wider">Custom Reason</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Enter custom reason"
                  />
                </div>
              )}

              <div>
                <label className="block text-white/70 text-[12px] font-bold mb-2 uppercase tracking-wider">Remarks (Optional)</label>
                <textarea
                  value={creditRemarks}
                  onChange={(e) => setCreditRemarks(e.target.value)}
                  className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors h-24 resize-none"
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowCreditModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors font-bold text-[14px]"
                disabled={isCrediting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreditWallet}
                disabled={isCrediting || !creditAmount}
                className="flex-1 px-4 py-3 bg-[#D4AF37] text-[#081A42] hover:bg-[#b08d2c] rounded-lg font-bold transition-colors disabled:opacity-50 text-[14px]"
              >
                {isCrediting ? "Processing..." : "Confirm Credit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog?.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#081A42]/50 p-6 rounded-2xl max-w-sm w-full m-4 shadow-2xl text-center">
            <h3 className="font-instrumentserif text-2xl text-white mb-4">Confirm Action</h3>
            <p className="text-white/80 text-[14px] font-mono mb-8">{confirmDialog.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors font-bold text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-[#081A42] hover:bg-[#b08d2c] rounded-lg font-bold transition-colors text-[13px]"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Dialog */}
      {alertDialog?.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#081A42]/50 p-6 rounded-2xl max-w-sm w-full m-4 shadow-2xl text-center">
            <h3 className="font-instrumentserif text-2xl text-white mb-4">Notice</h3>
            <p className="text-white/80 text-[14px] font-mono mb-8">{alertDialog.message}</p>
            <button
              onClick={() => {
                const onClose = alertDialog.onClose;
                setAlertDialog(null);
                if (onClose) onClose();
              }}
              className="w-full px-4 py-2.5 bg-[#D4AF37] text-[#081A42] hover:bg-[#b08d2c] rounded-lg font-bold transition-colors text-[13px]"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
