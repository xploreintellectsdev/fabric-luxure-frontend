"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getActivities, setActivities } from "../../data/mockStore";
import AddProductForm from "../../components/AddProductForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AddProductPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSaveProduct = async (newProduct: {
    cat_id: number;
    pro_name: string;
    price: number;
    stock_quantity: number;
    stock_unit: string;
    cover_description: string;
    is_top_pics: boolean;
    is_exclusive: boolean;
    fabric_type_id: number | null;
    origin_id: number | null;
    style_id: number | null;
    weave_id: number | null;
    color_id: number | null;
    pattern_id: number | null;
    standard_size: string | null;
    descriptions: { title?: string | null; text: string; number: number }[];
    specifications: { key: string; value: string }[];
    stitching_price?: string | number;
    coverImage?: File | null;
    additionalImages?: (File | string)[];
    disclaimer?: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("pro_name", newProduct.pro_name);
      formData.append("cat_id", String(newProduct.cat_id));
      formData.append("price", String(newProduct.price));
      if (newProduct.stitching_price !== undefined && newProduct.stitching_price !== "") {
        formData.append("stitching_price", String(newProduct.stitching_price));
      }
      formData.append("stock_quantity", String(newProduct.stock_quantity));
      formData.append("stock_unit", newProduct.stock_unit);
      formData.append("cover_description", newProduct.cover_description);
      formData.append("is_top_pics", String(newProduct.is_top_pics));
      formData.append("is_exclusive", String(newProduct.is_exclusive));
      if (newProduct.fabric_type_id) formData.append("fabric_type_id", String(newProduct.fabric_type_id));
      if (newProduct.origin_id) formData.append("origin_id", String(newProduct.origin_id));
      if (newProduct.style_id) formData.append("style_id", String(newProduct.style_id));
      if (newProduct.weave_id) formData.append("weave_id", String(newProduct.weave_id));
      if (newProduct.color_id) formData.append("color_id", String(newProduct.color_id));
      if (newProduct.pattern_id) formData.append("pattern_id", String(newProduct.pattern_id));
      if (newProduct.standard_size) formData.append("standard_size", newProduct.standard_size);
      formData.append("descriptions", JSON.stringify(newProduct.descriptions));
      formData.append("specifications", JSON.stringify(newProduct.specifications));
      if (newProduct.disclaimer !== undefined) {
        formData.append("disclaimer", newProduct.disclaimer);
      }

      if (newProduct.coverImage) {
        formData.append("coverImage", newProduct.coverImage);
      }

      if (newProduct.additionalImages) {
        newProduct.additionalImages.forEach((img) => {
          if (img instanceof File) {
            formData.append("additionalImages", img);
          }
        });
      }

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();

      if (res.ok) {
        // Track activity
        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Added product '${newProduct.pro_name}'`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
        return {
          success: true,
          topPicksLimitReached: resData.topPicksLimitReached,
          exclusiveLimitReached: resData.exclusiveLimitReached,
        };
      } else {
        showToast(resData.error || "Failed to create product.", "error");
        return { success: false, error: resData.error };
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
      return { success: false, error: err.message };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-white w-full h-auto sm:h-full overflow-y-visible sm:overflow-y-auto pb-10 sm:pb-20 px-3.5 sm:px-0">
      <div className="bg-[#102554] border border-[#081A42]/50 p-4 sm:p-8 rounded-xl shadow-md text-left">
        <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white mb-2">
          Add New Product
        </h2>
        <p className="text-[14px] text-[#D3D3D3]/80 mb-8">Craft a premium fabric, ready-to-wear, or bespoke design listing.</p>

        <AddProductForm onCancel={() => router.push("/admin/products")} onSave={handleSaveProduct} />
      </div>

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
