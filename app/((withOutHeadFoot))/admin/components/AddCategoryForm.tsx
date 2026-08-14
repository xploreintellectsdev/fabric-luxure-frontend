"use client";

import React, { useState, useEffect } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { Category } from "./CategoriesTable";

interface AddCategoryFormProps {
  initialCategory?: any; // changed to any to avoid importing and extending Category type in multiple files right now, or I can update Category interface.
  onCancel: () => void;
  onSave: (cat: any) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImageUrl = (img: string) => {
  if (!img) return "";
  if (img.startsWith("/uploads")) {
    return `${API_URL}${img}`;
  }
  return img;
};

export default function AddCategoryForm({ initialCategory, onCancel, onSave }: AddCategoryFormProps) {
  const [types, setTypes] = useState<{ pro_type_id: number; product_type: string }[]>([]);
  const [name, setName] = useState(initialCategory?.category_name || "");
  const [desc, setDesc] = useState(initialCategory?.category_desc || "");
  const [proTypeId, setProTypeId] = useState<number>(initialCategory?.pro_type_id || 0);

  // New fields
  const [coverDesc, setCoverDesc] = useState(initialCategory?.cover_description || "");
  const [desc1Title, setDesc1Title] = useState(initialCategory?.desc1_title || "");
  const [desc1Text, setDesc1Text] = useState(initialCategory?.desc1_text || "");
  const [desc2Title, setDesc2Title] = useState(initialCategory?.desc2_title || "");
  const [desc2Text, setDesc2Text] = useState(initialCategory?.desc2_text || "");
  const [desc3Title, setDesc3Title] = useState(initialCategory?.desc3_title || "");
  const [desc3Text, setDesc3Text] = useState(initialCategory?.desc3_text || "");
  const [desc4Text, setDesc4Text] = useState(initialCategory?.desc4_text || "");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialCategory?.category_img ? resolveImageUrl(initialCategory.category_img) : ""
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/product-types`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          setTypes(resData.data);
          if (!initialCategory && resData.data.length > 0) {
            setProTypeId(resData.data[0].pro_type_id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product types for dropdown:", err);
      }
    };
    fetchTypes();
  }, [initialCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !proTypeId) return;
    onSave({
      pro_type_id: proTypeId,
      category_name: name,
      category_desc: desc,
      category_img: initialCategory?.category_img || "/images/home/cat-01.webp",
      cover_description: coverDesc,
      desc1_title: desc1Title,
      desc1_text: desc1Text,
      desc2_title: desc2Title,
      desc2_text: desc2Text,
      desc3_title: desc3Title,
      desc3_text: desc3Text,
      desc4_text: desc4Text,
      imageFile: selectedFile
    });
  };

  const handleCardClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="flex flex-col gap-2">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Category Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Linen Accessories"
          className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Category Description</label>
        <p className="text-[12px] text-[#D3D3D3]/70 -mt-1 font-mono">(This description is displayed on the Home Page 'Shop by Category' section.)</p>
        <textarea
          required
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. Premium handcrafted accessories matching standard suit styles."
          rows={3}
          className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
        />
      </div>

      {/* NEW SECTION: Default Product Description Template */}
      <div className="border-t border-[#102554] pt-6 mt-6 space-y-6">
        <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-white mb-4">
          Default Product Description Template
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Cover Description</label>
          <p className="text-[12px] text-[#D3D3D3]/70 -mt-1 font-mono">This will automatically populate the Product Cover Description when a product is created.</p>
          <textarea
            value={coverDesc}
            onChange={(e) => setCoverDesc(e.target.value)}
            rows={3}
            className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description Title 1</label>
            <input
              type="text"
              value={desc1Title}
              onChange={(e) => setDesc1Title(e.target.value)}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description 1</label>
            <textarea
              value={desc1Text}
              onChange={(e) => setDesc1Text(e.target.value)}
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description Title 2</label>
            <input
              type="text"
              value={desc2Title}
              onChange={(e) => setDesc2Title(e.target.value)}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description 2</label>
            <textarea
              value={desc2Text}
              onChange={(e) => setDesc2Text(e.target.value)}
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description Title 3</label>
            <input
              type="text"
              value={desc3Title}
              onChange={(e) => setDesc3Title(e.target.value)}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description 3</label>
            <textarea
              value={desc3Text}
              onChange={(e) => setDesc3Text(e.target.value)}
              rows={2}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Description 4</label>
            <textarea
              value={desc4Text}
              onChange={(e) => setDesc4Text(e.target.value)}
              rows={3}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-[#102554] pt-6 mt-6 space-y-6"></div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Product Type Dropdown</label>
        <div className="relative">
          <select
            value={proTypeId}
            onChange={(e) => setProTypeId(Number(e.target.value))}
            className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none"
          >
            {types.map((t) => (
              <option key={t.pro_type_id} value={t.pro_type_id} className="bg-[#102554]">
                {t.product_type}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#D3D3D3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Real Image Uploader */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex flex-col gap-2">
        <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Category Image</label>
        <div 
          onClick={handleCardClick}
          className="relative bg-[#081A42] border-2 border-dashed border-[#102554] rounded-xl p-8 h-48 text-center flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/50 overflow-hidden transition-colors"
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Category Preview" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Upload className="w-6 h-6 text-[#D4AF37] mb-1" />
                <span className="text-[10px] uppercase font-mono tracking-wider">Change Image</span>
                {selectedFile && (
                  <span className="text-[9px] text-[#D3D3D3]/70 mt-1 truncate max-w-[80%] font-mono">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#D4AF37] mb-2" />
              <span className="text-[14px] font-mono uppercase tracking-wider text-white mb-1">
                Category Card Image
              </span>
              <span className="text-[10px] text-[#D3D3D3]/50">
                JPG/PNG up to 3MB
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#102554]/30">
        <button
          type="button"
          onClick={onCancel}
          className="border border-[#102554] px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white"
        >
          Save Category
        </button>
      </div>
    </form>
  );
}
