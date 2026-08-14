"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getActivities, setActivities } from "../data/mockStore";
import CategoriesTable, { Category } from "../components/CategoriesTable";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setLocalCategories] = useState<Category[]>([]);

  // Custom Toggle Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toggleTargetId, setToggleTargetId] = useState<string | null>(null);
  const [toggleTargetName, setToggleTargetName] = useState<string>("");
  const [toggleTargetStatus, setToggleTargetStatus] = useState<number>(1);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/product-categories`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setLocalCategories(resData.data);
      } else {
        toast.error(resData.error || "Failed to load categories.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend server.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleStatus = (id: string, currentStatus: number) => {
    const categoryToToggle = categories.find((c) => String(c.cat_id) === id);
    if (!categoryToToggle) return;
    setToggleTargetId(id);
    setToggleTargetName(categoryToToggle.category_name);
    setToggleTargetStatus(currentStatus === 1 ? 0 : 1);
    setShowConfirmModal(true);
  };

  const executeToggleStatus = async () => {
    if (!toggleTargetId) return;
    const id = toggleTargetId;
    const newStatus = toggleTargetStatus;
    try {
      const res = await fetch(`${API_URL}/api/product-categories/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus === 1 }),
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(`Category ${newStatus === 1 ? 'enabled' : 'disabled'} successfully`);
        fetchCategories();

        const act = getActivities();
        const updatedAct = [
          { id: `act-${Date.now()}`, user: "Admin", action: `${newStatus === 1 ? 'Enabled' : 'Disabled'} category '${toggleTargetName}'`, time: "Just now" },
          ...act
        ];
        setActivities(updatedAct);
      } else {
        toast.error(resData.error || "Failed to update status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    } finally {
      setShowConfirmModal(false);
      setToggleTargetId(null);
      setToggleTargetName("");
    }
  };

  const handleEditCategory = (cat: Category) => {
    router.push(`/admin/categories/edit?id=${cat.cat_id}`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full">
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            Store Categories
          </h2>
          <p className="text-[12px] sm:text-[14px] text-[#D3D3D3]/80">Define catalog categories such as Fabric, Ready to wear, etc.</p>
        </div>
        <Link
          href="/admin/categories/add"
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <CategoriesTable categories={categories} onToggleStatus={handleToggleStatus} onEdit={handleEditCategory} />

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-5 md:p-6 w-[calc(100%-32px)] max-w-[288px] md:max-w-sm shadow-2xl space-y-4 md:space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-xl md:text-2xl uppercase tracking-wider text-[#D4AF37]">
              {toggleTargetStatus === 1 ? "Enable" : "Disable"} Category?
            </h3>
            <p className="text-[13px] md:text-[15px] text-[#D3D3D3]/80 leading-normal">
              Are you sure you want to {toggleTargetStatus === 1 ? "enable" : "disable"} the category <strong>"{toggleTargetName}"</strong>?
            </p>
            <p className="text-[12px] md:text-[14px] text-[#D3D3D3]/60 leading-normal">
              {toggleTargetStatus === 1 
                ? "This will allow products in this category to be visible on the customer website again (if their product type and the products themselves are also active)."
                : "Products under this category will be immediately hidden from the customer website. Existing orders will not be affected."}
            </p>
            <div className="flex gap-2 justify-center pt-1 md:pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setToggleTargetId(null);
                  setToggleTargetName("");
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-full text-[12px] md:text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeToggleStatus}
                className={`${toggleTargetStatus === 1 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-full text-[12px] md:text-[14px] uppercase tracking-wider transition-colors cursor-pointer`}
              >
                {toggleTargetStatus === 1 ? "Enable" : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
