"use client";

import React, { useState, useEffect } from "react";
import { Plus, Upload, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Category, Product } from "./ProductsTable";

interface AddProductFormProps {
  categoriesList?: string[];
  initialProduct?: Product;
  onCancel: () => void;
  onSave: (product: {
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
    coverImage?: File | null;
    additionalImages?: (File | string)[];
    stitching_price?: number | string | null;
    disclaimer?: string;
  }) => Promise<any>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

export default function AddProductForm({ initialProduct, onCancel, onSave }: AddProductFormProps) {
  const router = useRouter();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<"topPicks" | "exclusive">("topPicks");
  const [confirmCategoryModal, setConfirmCategoryModal] = useState<{ show: boolean; newCatId: number } | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number>(initialProduct?.cat_id || 0);
  const [type, setType] = useState(initialProduct?.product_type_name || "");

  const [name, setName] = useState(initialProduct?.pro_name || "");

  const [fabricTypeId, setFabricTypeId] = useState<number | "">((initialProduct as any)?.fabric_type_id || "");
  const [originId, setOriginId] = useState<number | "">((initialProduct as any)?.origin_id || "");
  const [styleId, setStyleId] = useState<number | "">((initialProduct as any)?.style_id || "");
  const [weaveId, setWeaveId] = useState<number | "">((initialProduct as any)?.weave_id || "");
  const [colorId, setColorId] = useState<number | "">((initialProduct as any)?.color_id || "");
  const [patternId, setPatternId] = useState<number | "">((initialProduct as any)?.pattern_id || "");
  
  const [standardSize, setStandardSize] = useState((initialProduct as any)?.standard_size || "");

  const [masterData, setMasterData] = useState({
    fabricTypes: [] as any[],
    origins: [] as any[],
    styles: [] as any[],
    weaves: [] as any[],
    colors: [] as any[],
    patterns: [] as any[],
  });

  // Load initial product descriptions safely supporting both formats
  const getInitialDesc = (num: number, field: "title" | "text"): string => {
    if (!initialProduct?.descriptions) return "";
    const item = initialProduct.descriptions.find(d => d && d.number === num);
    if (!item) {
      const fallbackItem = initialProduct.descriptions[num - 1];
      if (!fallbackItem) return "";
      if (typeof fallbackItem === "string") {
        return field === "text" ? fallbackItem : "";
      }
      return field === "title" ? (fallbackItem.title || "") : (fallbackItem.text || "");
    }
    if (typeof item === "string") {
      return field === "text" ? item : "";
    }
    return field === "title" ? (item.title || "") : (item.text || "");
  };

  // Fixed Description State
  const [coverDescription, setCoverDescription] = useState(initialProduct?.cover_description || "");
  const [disclaimer, setDisclaimer] = useState(
    initialProduct ? (initialProduct.disclaimer || "") : "Due to variations in screen settings, lighting conditions, and the natural characteristics of linen fabric, the actual product colour may vary slightly from the colour displayed on the website."
  );
  const [desc1Title, setDesc1Title] = useState(getInitialDesc(1, "title"));
  const [desc1Text, setDesc1Text] = useState(getInitialDesc(1, "text"));

  const [desc2Title, setDesc2Title] = useState(getInitialDesc(2, "title"));
  const [desc2Text, setDesc2Text] = useState(getInitialDesc(2, "text"));

  const [desc3Title, setDesc3Title] = useState(getInitialDesc(3, "title"));
  const [desc3Text, setDesc3Text] = useState(getInitialDesc(3, "text"));

  const [desc4Text, setDesc4Text] = useState(getInitialDesc(4, "text"));

  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(
    initialProduct?.specifications || []
  );
  const [showSpecs, setShowSpecs] = useState(!!initialProduct?.specifications && initialProduct.specifications.length > 0);
  const [topPick, setTopPick] = useState(initialProduct?.is_top_pics === 1 || initialProduct?.is_top_pics === true);
  const [exclusive, setExclusive] = useState(initialProduct?.is_exclusive === 1 || initialProduct?.is_exclusive === true);
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : "2999");
  const [stitchingPercentage, setStitchingPercentage] = useState(initialProduct?.stitching_price !== undefined && initialProduct?.stitching_price !== null ? String(initialProduct.stitching_price) : "");
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stock_quantity !== undefined ? String(initialProduct.stock_quantity) : "");

  // File Upload State
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(
    initialProduct?.pro_img ? resolveImageUrl(initialProduct.pro_img) : ""
  );

  // Fixed 4 Additional Image States
  const [addImage1, setAddImage1] = useState<File | string | null>(initialProduct?.additionalImages?.[0] || null);
  const [addImage2, setAddImage2] = useState<File | string | null>(initialProduct?.additionalImages?.[1] || null);
  const [addImage3, setAddImage3] = useState<File | string | null>(initialProduct?.additionalImages?.[2] || null);
  const [addImage4, setAddImage4] = useState<File | string | null>(initialProduct?.additionalImages?.[3] || null);

  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const addon1Ref = React.useRef<HTMLInputElement>(null);
  const addon2Ref = React.useRef<HTMLInputElement>(null);
  const addon3Ref = React.useRef<HTMLInputElement>(null);
  const addon4Ref = React.useRef<HTMLInputElement>(null);

  const getAddonRef = (num: number) => {
    if (num === 1) return addon1Ref;
    if (num === 2) return addon2Ref;
    if (num === 3) return addon3Ref;
    return addon4Ref;
  };

  // Load Categories and Master Data on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/product-categories`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          setCategories(resData.data);
          if (!initialProduct) {
            setSelectedCatId(0);
            setType("");
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    const fetchMasters = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const headers = { "Authorization": `Bearer ${token}` };
        const endpoints = [
          "fabric-types", "fabric-origins", "styles", "weaves", "colors", "patterns"
        ];
        const resList = await Promise.all(
          endpoints.map(ep => fetch(`${API_URL}/api/admin/attributes/${ep}`, { headers }).then(r => r.json()))
        );
        
        const activeOnly = (data: any[]) => (data || []).filter(d => d.is_active === 1);

        setMasterData({
          fabricTypes: activeOnly(resList[0]?.data),
          origins: activeOnly(resList[1]?.data),
          styles: activeOnly(resList[2]?.data),
          weaves: activeOnly(resList[3]?.data),
          colors: activeOnly(resList[4]?.data),
          patterns: activeOnly(resList[5]?.data),
        });
      } catch (err) {
        console.error("Failed to load masters:", err);
      }
    };

    fetchCategories();
    fetchMasters();
  }, [initialProduct]);

  // Determine Product Type dynamically
  useEffect(() => {
    if (selectedCatId && categories.length > 0) {
      const match = categories.find((c) => c.cat_id === selectedCatId);
      if (match) {
        setType(match.product_type_name || "Shirt");
      }
    }
  }, [selectedCatId, categories]);

  const loadCategoryTemplate = (catId: number, catList: any[] = categories) => {
    const match = catList.find((c: any) => c.cat_id === catId);
    if (match) {
      setCoverDescription(match.cover_description || "");
      setDesc1Title(match.desc1_title || "");
      setDesc1Text(match.desc1_text || "");
      setDesc2Title(match.desc2_title || "");
      setDesc2Text(match.desc2_text || "");
      setDesc3Title(match.desc3_title || "");
      setDesc3Text(match.desc3_text || "");
      setDesc4Text(match.desc4_text || "");
    }
  };

  const handleCategoryChange = (newCatId: number) => {
    // If a category is already selected and we're changing to a new one, show confirmation
    if (selectedCatId && selectedCatId !== newCatId) {
      setConfirmCategoryModal({ show: true, newCatId });
    } else {
      // First time selecting a category for a New Product
      setSelectedCatId(newCatId);
      loadCategoryTemplate(newCatId);
    }
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specifications];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setSpecifications(updated);
  };

  const handleAddSpecRow = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  const handleToggleSpecs = () => {
    if (showSpecs) {
      setSpecifications([]);
      setShowSpecs(false);
    } else {
      setSpecifications([{ key: "", value: "" }]);
      setShowSpecs(true);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalSelect = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (index === 1) setAddImage1(file);
      else if (index === 2) setAddImage2(file);
      else if (index === 3) setAddImage3(file);
      else if (index === 4) setAddImage4(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedCatId) return;
    try {
      const res = await onSave({
        cat_id: selectedCatId,
        pro_name: name,
        price: parseFloat(price) || 0,
        stock_quantity: parseFloat(stockQuantity) || 0,
        stock_unit: type === "Fabric" ? "METER" : "PCS",
        cover_description: coverDescription,
        is_top_pics: topPick,
        is_exclusive: exclusive,
        fabric_type_id: fabricTypeId ? Number(fabricTypeId) : null,
        origin_id: originId ? Number(originId) : null,
        style_id: styleId ? Number(styleId) : null,
        weave_id: weaveId ? Number(weaveId) : null,
        color_id: colorId ? Number(colorId) : null,
        pattern_id: patternId ? Number(patternId) : null,
        standard_size: type === "Towel" ? standardSize.trim() : null,
        descriptions: [
          { title: desc1Title.trim(), text: desc1Text.trim(), number: 1 },
          { title: desc2Title.trim(), text: desc2Text.trim(), number: 2 },
          { title: desc3Title.trim(), text: desc3Text.trim(), number: 3 },
          { title: null, text: desc4Text.trim(), number: 4 }
        ],
        specifications: showSpecs ? specifications.filter((s) => s.key.trim() !== "" || s.value.trim() !== "") : [],
        stitching_price: stitchingPercentage,
        coverImage: coverImageFile,
        additionalImages: [addImage1, addImage2, addImage3, addImage4].filter(Boolean) as (File | string)[],
        disclaimer: disclaimer.trim(),
      });

      if (res && res.success) {
        if (res.topPicksLimitReached) {
          setTopPick(false);
          setLimitModalType("topPicks");
          setShowLimitModal(true);
        } else if (res.exclusiveLimitReached) {
          setExclusive(false);
          setLimitModalType("exclusive");
          setShowLimitModal(true);
        } else {
          router.push("/admin/products");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#102554] p-4 sm:p-8 rounded-xl border border-[#081A42]/50 text-white space-y-6">
      {/* Category Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Category</label>
          <div className="relative">
            <select
              value={selectedCatId}
              onChange={(e) => handleCategoryChange(Number(e.target.value))}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value={0} disabled>Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.cat_id} value={cat.cat_id} className="bg-[#081A42] text-white">
                  {cat.category_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Product Type Readonly */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Product Type (Auto-assigned)</label>
          <input
            type="text"
            readOnly
            value={type || "Shirt"}
            className="w-full bg-[#081A42]/50 border border-[#102554]/40 rounded-lg p-3 text-[15px] text-[#D3D3D3]/60 focus:outline-none select-none font-semibold"
          />
        </div>
      </div>

      {/* 6 Attribute Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left border-b border-[#102554]/30 pb-6">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Fabric Type</label>
          <div className="relative">
            <select
              value={fabricTypeId}
              onChange={(e) => setFabricTypeId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {masterData.fabricTypes.map((item) => (
                <option key={item.fabric_type_id} value={item.fabric_type_id} className="bg-[#081A42] text-white">
                  {item.fabric_type_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Origin</label>
          <div className="relative">
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {masterData.origins.map((item) => (
                <option key={item.origin_id} value={item.origin_id} className="bg-[#081A42] text-white">
                  {item.origin_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Style</label>
          <div className="relative">
            <select
              value={styleId}
              onChange={(e) => setStyleId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {masterData.styles.map((item) => (
                <option key={item.style_id} value={item.style_id} className="bg-[#081A42] text-white">
                  {item.style_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Weave</label>
          <div className="relative">
            <select
              value={weaveId}
              onChange={(e) => setWeaveId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {masterData.weaves.map((item) => (
                <option key={item.weave_id} value={item.weave_id} className="bg-[#081A42] text-white">
                  {item.weave_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Color</label>
          <div className="relative">
            <select
              value={colorId}
              onChange={(e) => setColorId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {masterData.colors.map((item) => (
                <option key={item.color_id} value={item.color_id} className="bg-[#081A42] text-white">
                  {item.color_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Pattern</label>
          <div className="relative">
            <select
              value={patternId}
              onChange={(e) => setPatternId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {masterData.patterns.map((item) => (
                <option key={item.pattern_id} value={item.pattern_id} className="bg-[#081A42] text-white">
                  {item.pattern_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Towel Specific Fields */}
      {type === "Towel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left border-b border-[#102554]/30 pb-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Standard Size (Inches)</label>
            <input
              type="text"
              required={type === "Towel"}
              value={standardSize}
              onChange={(e) => setStandardSize(e.target.value)}
              placeholder="Example: 30 × 60 Inches"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
            />
          </div>
        </div>
      )}

      {/* Product Name */}
      <div className="flex flex-col gap-2 text-left">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Product Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Riviera Classic Shirt — Sage Green"
          className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-2 text-left">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">
          {type === "Fabric" ? "Price (Per Meter)" : "Price (Rs.)"}
        </label>
        <input
          type="number"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="2999"
          className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
        />
        {type === "Fabric" && (
          <span className="text-[12px] text-[#D3D3D3]/60 mt-1 italic">Example: 1000 = ₹1000 per Meter</span>
        )}
      </div>

      {/* Stitching Charge */}
      <div className="flex flex-col gap-2 text-left">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">
          Stitching Charge (₹)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={stitchingPercentage}
          onChange={(e) => setStitchingPercentage(e.target.value)}
          placeholder="Enter stitching charge"
          className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
        />
        <span className="text-[12px] text-[#D3D3D3]/60 mt-1 italic">
          Leave empty or 0 if stitching is free.
        </span>
      </div>

      {/* Inventory Stock */}
      <div className="flex flex-col gap-2 text-left">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">
          {type === "Fabric" ? "Available Stock (Meters)" : "Available Stock (Pieces)"}
        </label>
        <input
          type="number"
          required
          step={type === "Fabric" ? "0.01" : "1"}
          min="0"
          value={stockQuantity}
          onChange={(e) => {
            const val = e.target.value;
            // Prevent negative values
            if (Number(val) < 0) return;
            // Prevent decimals for Piece products
            if (type !== "Fabric" && val.includes(".")) return;
            setStockQuantity(val);
          }}
          placeholder={type === "Fabric" ? "250.50" : "50"}
          className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
        />
      </div>

      {/* Fixed Product Descriptions Section */}
      <div className="space-y-6 pt-2 border-t border-[#102554]/30 text-left">
        <h3 className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono font-semibold">
          Product Descriptions
        </h3>

        {/* Cover Description */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Cover Description</label>
          <textarea
            required
            value={coverDescription}
            onChange={(e) => setCoverDescription(e.target.value)}
            placeholder="Riviera classic Sage Green shirt in premium linen fabric..."
            rows={2}
            className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
          />
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Disclaimer</label>
          <textarea
            value={disclaimer}
            onChange={(e) => setDisclaimer(e.target.value)}
            placeholder="Due to variations in screen settings, lighting conditions, and the natural characteristics of linen fabric, the actual product colour may vary slightly from the colour displayed on the website."
            rows={3}
            className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
          />
        </div>

        {/* Description 1 */}
        <div className="space-y-3 bg-[#081A42]/30 p-4 rounded-xl border border-[#102554]/30">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block font-bold">Description 1</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              required
              value={desc1Title}
              onChange={(e) => setDesc1Title(e.target.value)}
              placeholder="Title for Description 1"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
            />
            <textarea
              required
              value={desc1Text}
              onChange={(e) => setDesc1Text(e.target.value)}
              placeholder="Description text for paragraph 1"
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
            />
          </div>
        </div>

        {/* Description 2 */}
        <div className="space-y-3 bg-[#081A42]/30 p-4 rounded-xl border border-[#102554]/30">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block font-bold">Description 2</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              required
              value={desc2Title}
              onChange={(e) => setDesc2Title(e.target.value)}
              placeholder="Title for Description 2"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
            />
            <textarea
              required
              value={desc2Text}
              onChange={(e) => setDesc2Text(e.target.value)}
              placeholder="Description text for paragraph 2"
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
            />
          </div>
        </div>

        {/* Description 3 */}
        <div className="space-y-3 bg-[#081A42]/30 p-4 rounded-xl border border-[#102554]/30">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block font-bold">Description 3</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              required
              value={desc3Title}
              onChange={(e) => setDesc3Title(e.target.value)}
              placeholder="Title for Description 3"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
            />
            <textarea
              required
              value={desc3Text}
              onChange={(e) => setDesc3Text(e.target.value)}
              placeholder="Description text for paragraph 3"
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
            />
          </div>
        </div>

        {/* Description 4 */}
        <div className="space-y-3 bg-[#081A42]/30 p-4 rounded-xl border border-[#102554]/30">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block font-bold">Description 4</label>
          <div className="flex flex-col gap-2">
            <textarea
              required
              value={desc4Text}
              onChange={(e) => setDesc4Text(e.target.value)}
              placeholder="Description text for paragraph 4 (No Title)"
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="space-y-4 pt-2 border-t border-[#102554]/30 text-left">
        {!showSpecs ? (
          <button
            type="button"
            onClick={handleToggleSpecs}
            className="flex items-center gap-1.5 text-[14px] text-[#D4AF37] hover:underline font-semibold font-mono cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Specifications
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Specifications (Optional)</label>
              <button
                type="button"
                onClick={handleToggleSpecs}
                className="text-[14px] text-red-400 hover:underline font-semibold font-mono cursor-pointer"
              >
                Remove Specifications
              </button>
            </div>

            <div className="space-y-3">
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center bg-[#081A42]/20 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#102554]/30 sm:border-none">
                  <input
                    type="text"
                    required
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    placeholder="Spec Name (e.g. Material)"
                    className="w-full sm:w-1/3 bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
                  />
                  <input
                    type="text"
                    required
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    placeholder="Value (e.g. 100% Linen)"
                    className="w-full sm:flex-1 bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecRow(idx)}
                    className="w-full sm:w-auto p-3 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-lg cursor-pointer text-[14px] uppercase font-semibold font-mono shrink-0 text-center"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSpecRow}
              className="flex items-center gap-1.5 text-[14px] text-[#D4AF37] hover:underline font-semibold font-mono cursor-pointer pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Specification Row
            </button>
          </div>
        )}
      </div>

      {/* Image Uploader Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#102554]/30">
        {/* Cover Image Upload */}
        <div className="space-y-2 text-left">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Cover Image</label>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverSelect}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative bg-[#081A42] border-2 border-dashed border-[#102554] hover:border-[#D4AF37]/50 rounded-xl p-6 h-48 text-center flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
          >
            {coverImagePreview ? (
              <>
                <img src={coverImagePreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Upload className="w-6 h-6 text-[#D4AF37] mb-1" />
                  <span className="text-[10px] uppercase font-mono tracking-wider">Change Cover Image</span>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[#D4AF37] mb-2" />
                <span className="text-[14px] font-mono uppercase tracking-wider text-white mb-1">Upload Cover Image</span>
                <span className="text-[10px] text-[#D3D3D3]/50">JPG/PNG (Ratio 16:9)</span>
              </>
            )}
          </div>
        </div>

        {/* 4 Fixed Additional Images Upload */}
        <div className="space-y-2 text-left">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Additional Images</label>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => {
              const fileOrUrl = num === 1 ? addImage1 : num === 2 ? addImage2 : num === 3 ? addImage3 : addImage4;
              const inputRef = getAddonRef(num);
              const preview = fileOrUrl instanceof File ? URL.createObjectURL(fileOrUrl) : (fileOrUrl ? resolveImageUrl(fileOrUrl) : "");
              
              return (
                <div key={num} className="space-y-1">
                  <input
                    type="file"
                    ref={inputRef}
                    onChange={handleAdditionalSelect(num)}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="relative bg-[#081A42] border border-[#102554] hover:border-[#D4AF37]/50 rounded-xl p-3 h-20 text-center flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
                  >
                    {preview ? (
                      <>
                        <img src={preview} alt={`Addon ${num}`} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <Upload className="w-4 h-4 text-[#D4AF37] mb-1" />
                          <span className="text-[8px] uppercase font-mono tracking-wider">Change {num}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#D4AF37] mb-1" />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#D3D3D3]/70 text-center px-1">
                          {num === 1 ? "Image 1 (Ratio 21:9)" : num === 2 ? "Image 2 (Ratio 1:1)" : num === 3 ? "Image 3 (Ratio 3:4)" : "Image 4 (Ratio 16:9)"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Checkboxes for Features */}
      <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-[#102554]/30 select-none text-left">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={topPick}
            onChange={(e) => setTopPick(e.target.checked)}
            className="w-4 h-4 border border-[#102554] rounded bg-[#081A42] accent-[#D4AF37]"
          />
          <span className="text-[14px] uppercase tracking-wider text-[#D3D3D3] font-mono">Feature in Top Picks</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={exclusive}
            onChange={(e) => setExclusive(e.target.checked)}
            className="w-4 h-4 border border-[#102554] rounded bg-[#081A42] accent-[#D4AF37]"
          />
          <span className="text-[14px] uppercase tracking-wider text-[#D3D3D3] font-mono">Exclusive Summer Linen</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#102554]/30">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto border border-[#102554] px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors text-center h-11 flex items-center justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white text-center h-11 flex items-center justify-center"
        >
          Save Product
        </button>
      </div>

      {/* Premium Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              {limitModalType === "topPicks" ? "Maximum Top Picks Limit Reached" : "Maximum Exclusive Limit Reached"}
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              {limitModalType === "topPicks"
                ? "Only 10 products can be marked as Top Picks. Please remove an existing Top Picks Product before selecting another one."
                : "Only 4 products can be marked as Exclusive. Please remove an existing Exclusive Product before selecting another one."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLimitModal(false);
                  if (limitModalType === "topPicks") {
                    router.push("/admin/top-picks");
                  } else {
                    router.push("/admin/exclusive-linens");
                  }
                }}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#081A42] font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                {limitModalType === "topPicks" ? "Go To Top Picks" : "Go To Exclusive Products"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLimitModal(false);
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Template Change Confirmation Modal */}
      {confirmCategoryModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              Replace Product Description Template?
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              Changing the category will replace the current Cover Description and Product Descriptions with the selected Category's default template.
            </p>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              Any unsaved description changes will be lost.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmCategoryModal(null)}
                className="w-full sm:w-auto border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCatId(confirmCategoryModal.newCatId);
                  loadCategoryTemplate(confirmCategoryModal.newCatId);
                  setConfirmCategoryModal(null);
                }}
                className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#b08d2c] text-[#081A42] font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Replace Template
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
