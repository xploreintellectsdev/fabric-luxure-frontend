"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getActivities, setActivities } from "../../data/mockStore";
import AddCategoryForm from "../../components/AddCategoryForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AddCategoryPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSaveCategory = async (newCat: any) => {
    try {
      const formData = new FormData();
      formData.append("pro_type_id", String(newCat.pro_type_id));
      formData.append("category_name", newCat.category_name);
      formData.append("category_desc", newCat.category_desc);
      formData.append("category_img", newCat.category_img);
      
      // New fields
      if (newCat.cover_description) formData.append("cover_description", newCat.cover_description);
      if (newCat.desc1_title) formData.append("desc1_title", newCat.desc1_title);
      if (newCat.desc1_text) formData.append("desc1_text", newCat.desc1_text);
      if (newCat.desc2_title) formData.append("desc2_title", newCat.desc2_title);
      if (newCat.desc2_text) formData.append("desc2_text", newCat.desc2_text);
      if (newCat.desc3_title) formData.append("desc3_title", newCat.desc3_title);
      if (newCat.desc3_text) formData.append("desc3_text", newCat.desc3_text);
      if (newCat.desc4_text) formData.append("desc4_text", newCat.desc4_text);

      if (newCat.imageFile) {
        formData.append("categoryImage", newCat.imageFile);
      }

      const res = await fetch(`${API_URL}/api/product-categories`, {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();

      if (res.ok) {
        const act = getActivities();
        const updatedAct = [
          { id: `act-${Date.now()}`, user: "Admin", action: `Created category '${newCat.category_name}'`, time: "Just now" },
          ...act
        ];
        setActivities(updatedAct);
        router.push("/admin/categories");
      } else {
        showToast(resData.error || "Failed to create category.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-white w-full h-full overflow-y-auto pb-20">
      <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl shadow-md text-left">
        <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white mb-2">
          Add New Category
        </h2>
        <p className="text-[14px] text-[#D3D3D3]/80 mb-8">Register a design group, e.g. Be Spoke, Suit materials, Accessories.</p>

        <AddCategoryForm
          onCancel={() => router.push("/admin/categories")}
          onSave={handleSaveCategory}
        />
      </div>

      {/* Premium Toast Overlay */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30" 
            : "bg-red-950/90 text-red-400 border-red-500/30"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
