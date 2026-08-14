"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActivities, setActivities } from "../data/mockStore";
import { Product } from "../components/ProductsTable";
import { confirmAction } from "../../../../utils/modalUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "/images/home/cat-01.webp";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

export default function AdminTopPicksPage() {
  const router = useRouter();
  const [products, setLocalProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setLocalProducts(resData.data);
      } else {
        showToast(resData.error || "Failed to load products.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to connect to backend server.", "error");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!selectedProductId) return;
    const targetProd = products.find((item) => String(item.pro_id) === selectedProductId);
    if (!targetProd) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${selectedProductId}/flags`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_top_pics: true,
        }),
      });
      const resData = await res.json();

      if (res.ok) {
        showToast("Added to Top Picks successfully", "success");
        setSelectedProductId("");
        fetchProducts();

        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Added '${targetProd.pro_name}' to Top Picks`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
      } else {
        showToast(resData.error || "Failed to add to Top Picks.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    }
  };

  const handleConfirmRemove = async (id: string) => {
    const targetProd = products.find((item) => String(item.pro_id) === id);
    if (!targetProd) return;

    const confirmed = await confirmAction(
      "REMOVE PRODUCT",
      "Are you sure you want to remove this product from Top Picks?",
      "YES REMOVE"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}/flags`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_top_pics: false,
        }),
      });
      const resData = await res.json();

      if (res.ok) {
        showToast("Removed from Top Picks successfully", "success");
        fetchProducts();

        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Removed '${targetProd.pro_name}' from Top Picks`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
      } else {
        showToast(resData.error || "Failed to remove from Top Picks.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    }
  };

  const topPicks = products.filter((p) => p.is_top_pics === 1 || p.is_top_pics === true);
  const nonTopPicks = products.filter((p) => p.is_top_pics !== 1 && p.is_top_pics !== true);

  return (
    <div className="space-y-6 animate-fade-in text-white w-full">
      <div className="bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
            Top Picks Collection
          </h2>
          <p className="text-[14px] text-[#D3D3D3]/80">Currently featured trending items on the homepage carousel grid.</p>
        </div>

        {/* Dynamic Add Product Input Frame */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="bg-[#081A42] border border-[#102554] rounded-lg p-2 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] min-w-[200px]"
          >
            <option value="">Select product to add...</option>
            {nonTopPicks.map((p) => (
              <option key={p.pro_id} value={p.pro_id}>
                {p.pro_name} (Rs. {p.price}/-)
              </option>
            ))}
          </select>
          <button
            onClick={handleAddProduct}
            disabled={!selectedProductId}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#102554] disabled:opacity-50 disabled:hover:bg-[#D4AF37] font-bold px-4 py-2 rounded-lg text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {topPicks.length === 0 ? (
        <div className="bg-[#102554] p-12 text-center rounded-xl border border-[#081A42]/50 text-[#D3D3D3]/50">
          No top pick products found. Use the dropdown above or Products tab to select active ones.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topPicks.map((p) => (
            <div
              key={p.pro_id}
              className="bg-[#102554] border border-[#081A42]/50 rounded-xl overflow-hidden shadow-sm hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between"
            >
              <div className="aspect-square relative w-full bg-[#081A42] overflow-hidden">
                <img src={resolveImageUrl(p.pro_img)} alt={p.pro_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 text-left flex flex-col grow justify-between">
                <div>
                  <h4 className="font-semibold text-[15px] text-white mb-1 line-clamp-1">{p.pro_name}</h4>
                  <span className="text-[14px] text-[#D3D3D3]/80 font-mono">{p.category_name}</span>
                  {p.cover_description && (
                    <p className="text-[14px] text-[#D3D3D3]/60 line-clamp-2 mt-2 leading-relaxed">
                      {p.cover_description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#081A42]/30">
                  <span className="text-[15px] font-semibold text-[#D4AF37] font-mono">Rs. {p.price}/-</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmRemove(String(p.pro_id))}
                      className="text-[14px] text-red-400 hover:underline hover:text-red-300 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Premium Toast Overlay */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30"
              : "bg-red-950/90 text-red-400 border-red-500/30"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
