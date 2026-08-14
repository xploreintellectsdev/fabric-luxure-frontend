"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActivities, setActivities } from "../../data/mockStore";
import AddProductForm from "../../components/AddProductForm";
import { Product } from "../../components/ProductsTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function EditProductFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get("id") : null;

  const [product, setProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          setProduct(resData.data);
        } else {
          showToast(resData.error || "Failed to load product details.", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Connection error.", "error");
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdateProduct = async (updatedFields: {
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
    if (!product) return;

    try {
      const formData = new FormData();
      formData.append("pro_name", updatedFields.pro_name);
      formData.append("cat_id", String(updatedFields.cat_id));
      formData.append("price", String(updatedFields.price));
      if (updatedFields.stitching_price !== undefined && updatedFields.stitching_price !== "") {
        formData.append("stitching_price", String(updatedFields.stitching_price));
      } else {
        formData.append("stitching_price", "");
      }
      formData.append("stock_quantity", String(updatedFields.stock_quantity));
      formData.append("stock_unit", updatedFields.stock_unit);
      formData.append("cover_description", updatedFields.cover_description);
      formData.append("is_top_pics", String(updatedFields.is_top_pics));
      formData.append("is_exclusive", String(updatedFields.is_exclusive));
      if (updatedFields.fabric_type_id) formData.append("fabric_type_id", String(updatedFields.fabric_type_id));
      else formData.append("fabric_type_id", "");
      if (updatedFields.origin_id) formData.append("origin_id", String(updatedFields.origin_id));
      else formData.append("origin_id", "");
      if (updatedFields.style_id) formData.append("style_id", String(updatedFields.style_id));
      else formData.append("style_id", "");
      if (updatedFields.weave_id) formData.append("weave_id", String(updatedFields.weave_id));
      else formData.append("weave_id", "");
      if (updatedFields.color_id) formData.append("color_id", String(updatedFields.color_id));
      else formData.append("color_id", "");
      if (updatedFields.pattern_id) formData.append("pattern_id", String(updatedFields.pattern_id));
      else formData.append("pattern_id", "");
      if (updatedFields.standard_size) formData.append("standard_size", updatedFields.standard_size);
      else formData.append("standard_size", "");
      formData.append("descriptions", JSON.stringify(updatedFields.descriptions));
      formData.append("specifications", JSON.stringify(updatedFields.specifications));
      if (updatedFields.disclaimer !== undefined) {
        formData.append("disclaimer", updatedFields.disclaimer);
      }

      if (updatedFields.coverImage) {
        formData.append("coverImage", updatedFields.coverImage);
      } else {
        formData.append("pro_img", product.pro_img);
      }

      const existingImages: string[] = [];
      if (updatedFields.additionalImages) {
        updatedFields.additionalImages.forEach((img) => {
          if (typeof img === "string") {
            existingImages.push(img);
          } else if (img instanceof File) {
            formData.append("additionalImages", img);
          }
        });
      }
      formData.append("existingImages", JSON.stringify(existingImages));

      const res = await fetch(`${API_URL}/api/products/${product.pro_id}`, {
        method: "PUT",
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
            action: `Edited product '${updatedFields.pro_name}'`,
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
        showToast(resData.error || "Failed to update product.", "error");
        return { success: false, error: resData.error };
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
      return { success: false, error: err.message };
    }
  };

  if (!product) {
    return (
      <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl text-center">
        <p className="text-[#D3D3D3]/60">Loading product details or product not found...</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 border border-[#102554] px-6 py-2 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors"
        >
          Back to Catalog
        </button>
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${toast.type === "success"
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

  return (
    <div className="bg-[#102554] border border-[#081A42]/50 p-4 sm:p-8 rounded-xl shadow-md text-left text-white w-full">
      <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white mb-2">
        Edit Product
      </h2>
      <p className="text-[14px] text-[#D3D3D3]/80 mb-8">Modify the properties and details of this active catalog item.</p>

      <AddProductForm
        initialProduct={product}
        onCancel={() => router.push("/admin/products")}
        onSave={handleUpdateProduct}
      />

      {/* Premium Toast Overlay */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${toast.type === "success"
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

export default function EditProductPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-white w-full h-auto sm:h-full overflow-y-visible sm:overflow-y-auto pb-10 sm:pb-20 px-3.5 sm:px-0">
      <Suspense
        fallback={
          <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl text-center">
            <p className="text-[#D3D3D3]/60">Initializing product editor...</p>
          </div>
        }
      >
        <EditProductFormWrapper />
      </Suspense>
    </div>
  );
}
