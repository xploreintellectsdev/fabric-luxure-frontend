"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Percent
} from "lucide-react";

interface WalletSummary {
  totalWalletBalance: number;
  totalWalletRecharges: number;
  totalWalletRefunds: number;
  totalWalletPayments: number;
}

interface WalletUser {
  user_id: number;
  name: string;
  email: string;
  wallet_id: number;
  balance: number;
  status: string;
  last_txn_date: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminWalletsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [wallets, setWallets] = useState<WalletUser[]>([]);
  const [summary, setSummary] = useState<WalletSummary>({
    totalWalletBalance: 0,
    totalWalletRecharges: 0,
    totalWalletRefunds: 0,
    totalWalletPayments: 0
  });
  const [loading, setLoading] = useState(true);

  // Search & Filters — initialize from URL
  const [search, setSearch] = useState(() => searchParams?.get("search") || "");
  const [status, setStatus] = useState(() => searchParams?.get("status") || "All");
  const [sort, setSort] = useState(() => searchParams?.get("sort") || "balance_desc");

  // Pagination — initialize from URL
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams?.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [limit, setLimit] = useState(() => {
    const l = parseInt(searchParams?.get("limit") || "10", 10);
    return isNaN(l) ? 10 : l;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync filter + page state back to URL so refresh restores them
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "All") params.set("status", status);
    if (sort !== "balance_desc") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    if (limit !== 10) params.set("limit", limit.toString());
    const qs = params.toString();
    router.replace(`/admin/wallets${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, status, sort, page, limit]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(
        `${API_URL}/api/admin/wallets?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&status=${status}&sort=${sort}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (data.success) {
        setWallets(data.data.wallets);
        setSummary(data.data.summary);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalCount(data.data.pagination.total || 0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch admin wallets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [page, limit, status, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWallets();
  };

  return (
    <div className="space-y-6 animate-fade-in text-white w-full min-h-screen h-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-instrumentserif text-3xl text-white tracking-wide scale-y-110">Wallet Management</h1>
          <p className="text-[14px] text-slate-300 font-mono">Monitor and audit customer wallet balances and statistics.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Balance */}
        <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-16 h-16 text-[#D4AF37]" />
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]/80">
            Total Wallet Balance
          </div>
          <div className="text-3xl font-extrabold mt-2 font-mono">
            ₹{summary.totalWalletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-white/50 mt-2 font-mono">
            Across all active users
          </div>
        </div>

        {/* Total Recharges */}
        <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
            Total Wallet Recharges
          </div>
          <div className="text-3xl font-extrabold mt-2 font-mono text-emerald-400">
            ₹{summary.totalWalletRecharges.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-white/50 mt-2 font-mono">
            Completed gateway top-ups
          </div>
        </div>

        {/* Total Refunds */}
        <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Percent className="w-16 h-16 text-blue-500" />
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-blue-400">
            Total Wallet Refunds
          </div>
          <div className="text-3xl font-extrabold mt-2 font-mono text-blue-400">
            ₹{summary.totalWalletRefunds.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-white/50 mt-2 font-mono">
            Order cancellation returns
          </div>
        </div>

        {/* Total Wallet Payments */}
        <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown className="w-16 h-16 text-red-500" />
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-red-400">
            Total Wallet Payments
          </div>
          <div className="text-3xl font-extrabold mt-2 font-mono text-red-400">
            ₹{summary.totalWalletPayments.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-white/50 mt-2 font-mono">
            Deducted during checkout
          </div>
        </div>
      </div>

      {/* CRM Filters Controls */}
      <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-4 sm:p-6 space-y-4 text-left">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-0 bg-[#081A42]/80 border border-[#081A42]/50 rounded-full px-5 py-2.5 pl-11 text-[14px] text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] font-mono"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-white/40 shrink-0" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="flex-1 sm:flex-none bg-[#081A42] border border-[#081A42]/50 rounded-full px-4 py-2 text-[14px] font-mono focus:outline-none text-white cursor-pointer min-w-0"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-white/40 shrink-0" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="flex-1 sm:flex-none bg-[#081A42] border border-[#081A42]/50 rounded-full px-4 py-2 text-[14px] font-mono focus:outline-none text-white cursor-pointer min-w-0"
              >
                <option value="balance_desc">Highest Balance</option>
                <option value="balance_asc">Lowest Balance</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* ── DESKTOP TABLE ── hidden below lg */}
      <div className="hidden lg:block bg-[#102554] border border-[#081A42]/50 rounded-2xl overflow-hidden shadow-xl text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[14px] min-w-[700px]">
            <thead className="bg-[#081A42]">
              <tr className="border-b border-white/5 uppercase tracking-widest text-[#D4AF37] font-mono">
                <th className="p-4 pl-6 font-bold">User Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Current Wallet Balance</th>
                <th className="p-4 font-bold">Wallet Status</th>
                <th className="p-4 font-bold">Last Transaction Date</th>
                <th className="p-4 pr-6 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50 font-sans">
                    Loading customer wallets...
                  </td>
                </tr>
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/50 font-sans">
                    No registered users with wallets match the query.
                  </td>
                </tr>
              ) : (
                wallets.map((w) => (
                  <tr key={w.user_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white font-sans">{w.name}</td>
                    <td className="p-4 text-white/80 break-all">{w.email}</td>
                    <td className="p-4 font-extrabold text-[15px] text-[#D4AF37]">
                      ₹{parseFloat(String(w.balance || 0)).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4 text-white/60">
                      {w.last_txn_date
                        ? new Date(w.last_txn_date).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short"
                          })
                        : "No transactions"}
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <Link
                        href={`/admin/wallets/${w.user_id}`}
                        className="inline-flex items-center gap-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] px-3.5 py-1.5 rounded-full transition-all uppercase tracking-widest text-[9px] font-bold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#081A42]/60 border-t border-white/5 flex items-center justify-between font-mono">
            <div className="text-[10px] text-white/50">
              Showing {wallets.length} of {totalCount} users
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-white/10 hover:bg-white/5 disabled:opacity-30 rounded-lg text-[#D4AF37] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-[14px] border border-white/10 rounded-lg text-white font-bold bg-[#081A42]">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-white/10 hover:bg-white/5 disabled:opacity-30 rounded-lg text-[#D4AF37] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE / TABLET CARDS ── visible below lg */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-8 text-center text-white/50">
            Loading customer wallets...
          </div>
        ) : wallets.length === 0 ? (
          <div className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-8 text-center text-white/50">
            No registered users with wallets match the query.
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.user_id}
              className="bg-[#102554] border border-[#081A42]/50 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              {/* Name */}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-mono mb-0.5">Name</p>
                <p className="text-white font-bold text-[15px] break-words">{w.name}</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-mono mb-0.5">Email</p>
                <p
                  className="text-white/80 text-[14px] font-mono"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                >
                  {w.email}
                </p>
              </div>

              {/* Balance + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-mono mb-0.5">Wallet Balance</p>
                  <p className="text-[#D4AF37] font-extrabold text-[16px] font-mono">
                    ₹{parseFloat(String(w.balance || 0)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-mono mb-0.5">Status</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      w.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              </div>

              {/* Last Transaction */}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-mono mb-0.5">Last Transaction</p>
                <p className="text-white/60 text-[13px] font-mono">
                  {w.last_txn_date
                    ? new Date(w.last_txn_date).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })
                    : "No transactions"}
                </p>
              </div>

              {/* View Button */}
              <div className="border-t border-[#081A42]/40 pt-3 flex justify-end">
                <Link
                  href={`/admin/wallets/${w.user_id}`}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] rounded-full transition-all uppercase tracking-widest text-[11px] font-bold"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between font-mono py-2">
            <div className="text-[11px] text-white/50">
              {wallets.length} of {totalCount} users
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-white/10 hover:bg-white/5 disabled:opacity-30 rounded-lg text-[#D4AF37] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-[13px] border border-white/10 rounded-lg text-white font-bold bg-[#081A42]">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-white/10 hover:bg-white/5 disabled:opacity-30 rounded-lg text-[#D4AF37] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
