"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActivities, setActivities } from "../data/mockStore";
import { Product } from "../components/ProductsTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "/images/home/cat-01.webp";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

export default function AdminExclusiveLinensPage() {
  const router = useRouter();
  const [products, setLocalProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Remove confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

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

  const triggerRemoveConfirm = (id: string) => {
    setConfirmTargetId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!confirmTargetId) return;
    const id = confirmTargetId;
    const targetProd = products.find((item) => String(item.pro_id) === id);
    if (!targetProd) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}/flags`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_exclusive: false,
        }),
      });
      const resData = await res.json();

      if (res.ok) {
        showToast("Removed from Exclusive Linens successfully", "success");
        fetchProducts();

        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Removed '${targetProd.pro_name}' from Exclusive Linens`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
      } else {
        showToast(resData.error || "Failed to remove from Exclusive Linens.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    } finally {
      setShowConfirmModal(false);
      setConfirmTargetId(null);
    }
  };

  const handleEditProduct = (id: string) => {
    router.push(`/admin/products/edit?id=${id}`);
  };

  const exclusives = products.filter((p) => p.is_exclusive === 1 || p.is_exclusive === true);

  return (
    <div className="space-y-6 animate-fade-in text-white w-full">
      <div className="bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left">
        <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
          Exclusive Summer Linens
        </h2>
        <p className="text-[14px] text-[#D3D3D3]/80">Premium products marked exclusive, displayed with detailed overlay design.</p>
      </div>

      {exclusives.length === 0 ? (
        <div className="bg-[#102554] p-12 text-center rounded-xl border border-[#081A42]/50 text-[#D3D3D3]/50">
          No exclusive products found. Use the Products tab to select active ones.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {exclusives.map((p) => (
            <div
              key={p.pro_id}
              className="bg-[#102554] border border-[#081A42]/50 rounded-xl overflow-hidden shadow-sm hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between"
            >
              <div className="aspect-square relative w-full bg-[#081A42] overflow-hidden">
                <img src={resolveImageUrl(p.pro_img)} alt={p.pro_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 text-left">
                <h4 className="font-semibold text-[15px] text-white mb-1 line-clamp-1">{p.pro_name}</h4>
                <span className="text-[14px] text-[#D3D3D3]/80 font-mono">{p.category_name}</span>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#081A42]/30">
                  <span className="text-[15px] font-semibold text-[#D4AF37] font-mono">Rs. {p.price}/-</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditProduct(String(p.pro_id))}
                      className="text-[14px] text-[#D4AF37] hover:underline font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => triggerRemoveConfirm(String(p.pro_id))}
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

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              REMOVE PRODUCT
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              Are you sure you want to remove this product from Exclusive Linens?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleConfirmRemove}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                YES REMOVE
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmTargetId(null);
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
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
