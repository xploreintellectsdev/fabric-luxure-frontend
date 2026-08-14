"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActivities, setActivities } from "../../data/mockStore";
import AddCategoryForm from "../../components/AddCategoryForm";
import { Category } from "../../components/CategoriesTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function EditCategoryFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get("id") : null;

  const [category, setCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/api/product-categories/${id}`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          setCategory(resData.data);
        } else {
          showToast(resData.error || "Failed to load category details.", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Connection error.", "error");
      }
    };
    fetchCategory();
  }, [id]);

  const handleUpdateCategory = async (updatedFields: any) => {
    if (!category) return;

    try {
      const formData = new FormData();
      formData.append("pro_type_id", String(updatedFields.pro_type_id));
      formData.append("category_name", updatedFields.category_name);
      formData.append("category_desc", updatedFields.category_desc);
      formData.append("category_img", updatedFields.category_img);
      
      // New fields
      if (updatedFields.cover_description) formData.append("cover_description", updatedFields.cover_description);
      if (updatedFields.desc1_title) formData.append("desc1_title", updatedFields.desc1_title);
      if (updatedFields.desc1_text) formData.append("desc1_text", updatedFields.desc1_text);
      if (updatedFields.desc2_title) formData.append("desc2_title", updatedFields.desc2_title);
      if (updatedFields.desc2_text) formData.append("desc2_text", updatedFields.desc2_text);
      if (updatedFields.desc3_title) formData.append("desc3_title", updatedFields.desc3_title);
      if (updatedFields.desc3_text) formData.append("desc3_text", updatedFields.desc3_text);
      if (updatedFields.desc4_text) formData.append("desc4_text", updatedFields.desc4_text);

      if (updatedFields.imageFile) {
        formData.append("categoryImage", updatedFields.imageFile);
      }

      const res = await fetch(`${API_URL}/api/product-categories/${category.cat_id}`, {
        method: "PUT",
        body: formData,
      });
      const resData = await res.json();

      if (res.ok) {
        // Track activity
        const act = getActivities();
        const updatedAct = [
          { id: `act-${Date.now()}`, user: "Admin", action: `Edited category '${updatedFields.category_name}'`, time: "Just now" },
          ...act
        ];
        setActivities(updatedAct);

        router.push("/admin/categories");
      } else {
        showToast(resData.error || "Failed to update category.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    }
  };

  if (!category) {
    return (
      <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl text-center">
        <p className="text-[#D3D3D3]/60">Loading category details or category not found...</p>
        <button
          onClick={() => router.push("/admin/categories")}
          className="mt-4 border border-[#102554] px-6 py-2 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors"
        >
          Back to Categories
        </button>
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

  return (
    <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl shadow-md text-left animate-fade-in text-white w-full">
      <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white mb-2">
        Edit Category
      </h2>
      <p className="text-[14px] text-[#D3D3D3]/80 mb-8">Modify the properties and details of this active store category.</p>

      <AddCategoryForm
        initialCategory={category}
        onCancel={() => router.push("/admin/categories")}
        onSave={handleUpdateCategory}
      />

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

export default function EditCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-white w-full h-full overflow-y-auto pb-20">
      <Suspense fallback={
        <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl text-center">
          <p className="text-[#D3D3D3]/60">Initializing category editor...</p>
        </div>
      }>
        <EditCategoryFormWrapper />
      </Suspense>
    </div>
  );
}
