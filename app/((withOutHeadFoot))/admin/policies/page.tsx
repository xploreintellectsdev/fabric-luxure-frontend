"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Shield, FileText, RotateCcw, Package, ArrowRight } from "lucide-react";

interface PolicyPage {
  page_id: number;
  page_key: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  is_active: number;
}

const policyIcons: Record<string, any> = {
  "shipping-policy": Package,
  "terms-and-conditions": FileText,
  "cancellation-and-refunds": RotateCcw,
  "privacy-policy": Shield,
};

export default function PoliciesListAdmin() {
  const [policies, setPolicies] = useState<PolicyPage[]>([]);
  const [loading, setLoading] = useState(true);

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch policies");
      }
      const data = await res.json();
      if (data.success) {
        setPolicies(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch policies");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error loading policies");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (policy: PolicyPage) => {
    const newActive = policy.is_active === 1 ? 0 : 1;
    
    // Optimistic Update
    setPolicies((prev) =>
      prev.map((p) => (p.page_id === policy.page_id ? { ...p, is_active: newActive } : p))
    );

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies/${policy.page_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hero_eyebrow: policy.hero_eyebrow,
          hero_title: policy.hero_title,
          hero_subtitle: policy.hero_subtitle,
          is_active: newActive,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle policy status");
      }
      toast.success(`${policy.hero_title} ${newActive === 1 ? "enabled" : "disabled"} successfully.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating policy status");
      // Revert optimistic update
      setPolicies((prev) =>
        prev.map((p) => (p.page_id === policy.page_id ? { ...p, is_active: policy.is_active } : p))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#081A42] flex flex-col">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-instrumentserif text-3xl md:text-4xl text-[#D4AF37] uppercase tracking-wider scale-y-110 transform origin-left">
            Policies Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage terms, conditions, privacy, returns, and shipping guidelines.
          </p>
        </div>
      </div>

      {/* Grid of Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {policies.map((policy) => {
          const IconComponent = policyIcons[policy.page_key] || FileText;
          return (
            <div
              key={policy.page_id}
              className="bg-[#102554] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-300 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#081A42] border border-white/10 rounded-lg text-[#D4AF37]">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  {/* Status Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={policy.is_active === 1}
                      onChange={() => handleToggleActive(policy)}
                    />
                    <div className="w-11 h-6 bg-[#081A42] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
                      {policy.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{policy.hero_title}</h3>
                <p className="text-xs font-mono text-[#D4AF37]/70 uppercase tracking-widest mb-3">
                  Key: {policy.page_key}
                </p>
                <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                  {policy.hero_subtitle || "No description provided."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  ID: {policy.page_id}
                </span>
                <Link
                  href={`/admin/policies/${policy.page_key}`}
                  className="flex items-center gap-2 text-sm text-[#D4AF37] hover:text-white transition-colors group font-semibold"
                >
                  Edit Policy Sections
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
