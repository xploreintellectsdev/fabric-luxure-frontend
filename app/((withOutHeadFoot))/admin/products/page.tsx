"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getActivities, setActivities } from "../data/mockStore";
import ProductsTable, { Product } from "../components/ProductsTable";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setLocalProducts] = useState<Product[]>([]);
  const [categories, setLocalCategories] = useState<string[]>([]);

  // Custom Toggle Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toggleTargetId, setToggleTargetId] = useState<string | null>(null);
  const [toggleTargetName, setToggleTargetName] = useState<string>("");
  const [toggleTargetStatus, setToggleTargetStatus] = useState<number>(1);

  const fetchProductsData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setLocalProducts(resData.data);
      } else {
        toast.error(resData.error || "Failed to load products.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend server.");
    }
  };

  const fetchCategoriesData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/product-categories`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setLocalCategories(resData.data.map((c: any) => c.category_name));
      }
    } catch (err) {
      console.error("Failed to load categories for filtering:", err);
    }
  };

  useEffect(() => {
    fetchProductsData();
    fetchCategoriesData();
  }, []);

  const handleToggleStatus = (id: string, currentStatus: number) => {
    const productToToggle = products.find((item) => String(item.pro_id) === id);
    if (!productToToggle) return;
    setToggleTargetId(id);
    setToggleTargetName(productToToggle.pro_name);
    setToggleTargetStatus(currentStatus === 1 ? 0 : 1);
    setShowConfirmModal(true);
  };

  const executeToggleStatus = async () => {
    if (!toggleTargetId) return;
    const id = toggleTargetId;
    const newStatus = toggleTargetStatus;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus === 1 }),
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(`Product ${newStatus === 1 ? 'enabled' : 'disabled'} successfully`);
        fetchProductsData();

        // Track activity
        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `${newStatus === 1 ? 'Enabled' : 'Disabled'} product '${toggleTargetName}'`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
      } else {
        toast.error(resData.error || "Failed to update product status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend server.");
    } finally {
      setShowConfirmModal(false);
      setToggleTargetId(null);
      setToggleTargetName("");
    }
  };

  const handleEditProduct = (id: string) => {
    router.push(`/admin/products/edit?id=${id}`);
  };

  return (
    <div className="flex flex-col h-auto sm:h-full overflow-visible sm:overflow-hidden animate-fade-in text-white w-full px-3.5 sm:px-6">
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            Products Catalog
          </h2>
          <p className="text-xs sm:text-sm text-[#D3D3D3]/80">Manage items currently displayed across home and shop modules.</p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center justify-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-5 py-2.5 rounded-full text-xs sm:text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto h-11 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <ProductsTable
        products={products}
        categories={categories}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditProduct}
      />

      {/* Toggle Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              {toggleTargetStatus === 1 ? "ENABLE" : "DISABLE"} PRODUCT
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              Are you sure you want to {toggleTargetStatus === 1 ? "enable" : "disable"} the product "{toggleTargetName}"?
            </p>
            <p className="text-[14px] text-[#D3D3D3]/60 leading-relaxed">
              {toggleTargetStatus === 1 
                ? "This product will become visible and available for purchase again."
                : "This product will be hidden from the customer website. Existing orders will not be affected."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={executeToggleStatus}
                className={`${toggleTargetStatus === 1 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer`}
              >
                YES {toggleTargetStatus === 1 ? "ENABLE" : "DISABLE"}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setToggleTargetId(null);
                  setToggleTargetName("");
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
