"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Tag,
  Star,
  Award,
  Users
} from "lucide-react";
import {
  getActivities,
  Activity
} from "./data/mockStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LoginHistoryEntry {
  id: number;
  user_id: number;
  user_name: string;
  login_time: string;
  login_status: "SUCCESS" | "FAILED";
  ip_address: string;
}

export default function AdminDashboardHome() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    products: 0,
    categories: 0,
    productTypes: 0,
    topPicks: 0,
    exclusives: 0,
    users: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);

  const fetchDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: {
          "Authorization": `Bearer ${adminToken || ""}`
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMetrics({
          products: resData.data.products,
          categories: resData.data.categories,
          productTypes: resData.data.productTypes,
          topPicks: resData.data.topPicks,
          exclusives: resData.data.exclusives,
          users: resData.data.users
        });
        setLoginHistory(resData.data.userLoginHistory || []);
        
        if (resData.data.recentActivities) {
          const localAct = getActivities();
          const merged = [...localAct];
          resData.data.recentActivities.forEach((act: any) => {
            if (!merged.some(m => m.id === act.id)) {
              merged.push(act);
            }
          });
          setActivities(merged);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in text-white w-full">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Total Products", value: metrics.products, icon: ShoppingBag, color: "text-[#D4AF37]", route: "/admin/products" },
          { title: "Total Categories", value: metrics.categories, icon: Tag, color: "text-blue-400", route: "/admin/categories" },
          { title: "Product Types", value: metrics.productTypes, icon: Tag, color: "text-teal-400", route: "/admin/product-types" },
          { title: "Top Picks", value: metrics.topPicks, icon: Star, color: "text-yellow-400", route: "/admin/top-picks" },
          { title: "Exclusive Products", value: metrics.exclusives, icon: Award, color: "text-purple-400", route: "/admin/exclusive-linens" },
          { title: "Total Users", value: metrics.users, icon: Users, color: "text-emerald-400", route: "/admin/users" }
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (stat.route) {
                router.push(stat.route);
              }
            }}
            className="bg-[#102554] border border-[#102554]/50 p-6 rounded-xl hover:border-[#D4AF37]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm flex items-center justify-between select-none cursor-pointer"
          >
            <div>
              <p className="text-[14px] text-[#D3D3D3]/80 font-semibold uppercase tracking-wider mb-2">{stat.title}</p>
              <h3 className="text-3xl font-light font-instrumentserif text-white leading-none">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-lg bg-[#081A42]/50 border border-[#102554]/20">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Activities and Signups section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activities */}
        <div className="col-span-1 lg:col-span-7 bg-[#102554] border border-[#102554]/50 p-4 md:p-6 rounded-xl shadow-sm flex flex-col h-[450px]">
          <h2 className="font-instrumentserif text-xl md:text-2xl font-normal uppercase tracking-wider text-white mb-4 md:mb-6 text-left">
            Recent Activities
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 text-left custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-[14px] text-[#D3D3D3]/50 italic">No recent admin activities recorded.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex justify-between items-start gap-2 py-2 md:py-3 border-b border-[#081A42]/30 last:border-0 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="w-[30px] h-[30px] md:w-8 md:h-8 rounded-full bg-[#081A42]/80 flex items-center justify-center text-[12px] md:text-[14px] font-bold text-[#D4AF37] shrink-0">
                      {act.user[0]}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-[13px] md:text-[15px] font-semibold text-white break-words">{act.action}</p>
                      <p className="text-[11px] md:text-[14px] text-[#D3D3D3]/60 mt-0.5">by {act.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] md:text-[14px] text-[#D3D3D3]/50 font-mono shrink-0 mt-0.5">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Login History */}
        <div className="col-span-1 lg:col-span-5 bg-[#102554] border border-[#102554]/50 p-4 md:p-6 rounded-xl shadow-sm flex flex-col h-[450px]">
          <h2 className="font-instrumentserif text-xl md:text-2xl font-normal uppercase tracking-wider text-white mb-4 md:mb-6 text-left">
            User Login History
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar text-left">
            {loginHistory.length === 0 ? (
              <p className="text-[14px] text-[#D3D3D3]/50 italic">No login history records found.</p>
            ) : (
              loginHistory.map((lh) => (
                <div
                  key={lh.id}
                  className="flex items-start sm:items-center justify-between gap-2 p-2 md:p-3 rounded-lg bg-[#081A42]/50 border border-[#102554]/20 hover:border-[#D4AF37]/20 transition-all min-w-0"
                >
                  <div className="flex items-start gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#102554] border border-[#D4AF37] flex items-center justify-center font-bold text-[12px] md:text-[14px] text-[#D4AF37] shrink-0">
                      {(() => {
                        const name = lh.user_name;
                        if (!name || !name.trim()) return 'LH';
                        const parts = name.trim().split(/\s+/);
                        if (parts.length === 1) return parts[0][0].toUpperCase();
                        return (parts[0][0] + parts[1][0]).toUpperCase();
                      })()}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[13px] md:text-[15px] font-semibold text-white break-words">{lh.user_name || "Unknown User"}</p>
                      <div className="flex flex-col gap-0.5 mt-0.5 min-w-0">
                        <span className="text-[11px] md:text-[14px] text-[#D3D3D3]/60 break-words">Time: {new Date(lh.login_time).toLocaleString()}</span>
                        {lh.ip_address && (
                          <span className="text-[10px] md:text-[14px] text-[#D3D3D3]/40 font-mono break-all">IP: {lh.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] md:text-[14px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap self-start sm:self-center mt-0.5 sm:mt-0 ${
                      lh.login_status === "SUCCESS"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-950/40 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {lh.login_status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
