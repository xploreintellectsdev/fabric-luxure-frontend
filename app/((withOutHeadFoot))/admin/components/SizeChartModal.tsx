"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";

export interface SizeChartTemplate {
  template_id?: number;
  pro_type_id: number;
  template_name: string;
  image_path?: string;
  is_active: boolean | number;
  product_type?: string;
  created_at?: string;
}

interface ProductType {
  pro_type_id: number;
  product_type: string;
}

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialData: SizeChartTemplate | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SizeChartModal({ isOpen, onClose, onSave, initialData }: SizeChartModalProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [proTypeId, setProTypeId] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product types on mount/open
  useEffect(() => {
    if (!isOpen) return;

    const fetchProductTypes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/product-types`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProductTypes(data.data || []);
        }
      } catch (err) {
        console.error("❌ Failed to load product types:", err);
      }
    };

    fetchProductTypes();
  }, [isOpen]);

  // Load initial data for Edit Mode
  useEffect(() => {
    if (initialData) {
      setProTypeId(String(initialData.pro_type_id));
      setTemplateName(initialData.template_name || "");
      setIsActive(Boolean(initialData.is_active));
      setSelectedFile(null);
      
      if (initialData.image_path) {
        const path = initialData.image_path;
        const fullUrl = path.startsWith("http")
          ? path
          : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
        setPreviewUrl(fullUrl);
      } else {
        setPreviewUrl("");
      }
    } else {
      // Clear fields for Add Mode
      setProTypeId("");
      setTemplateName("");
      setIsActive(true);
      setSelectedFile(null);
      setPreviewUrl("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 2MB." }));
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!proTypeId) newErrors.pro_type_id = "Product Type is required.";
    if (!templateName.trim()) newErrors.template_name = "Template Name is required.";
    
    // Image is required for new templates
    if (!initialData && !selectedFile) {
      newErrors.image = "Image is required.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("pro_type_id", proTypeId);
    fd.append("template_name", templateName);
    fd.append("is_active", String(isActive));
    if (selectedFile) {
      fd.append("image", selectedFile);
    }

    onSave(fd);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-left">
      <div 
        className="relative bg-[#102554] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-8 shadow-2xl text-white overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#081A42]/50 mb-6">
          <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
            {initialData ? "Edit Template" : "Add Size Chart Template"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#D3D3D3]/75 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 grow scrollbar-thin">
          {/* Product Type Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-semibold">Product Type *</label>
            <select
              value={proTypeId}
              onChange={(e) => {
                setProTypeId(e.target.value);
                if (e.target.value) setErrors((prev) => ({ ...prev, pro_type_id: "" }));
              }}
              className={`w-full px-4 py-3 text-[15px] text-white rounded-lg border bg-[#081A42] focus:outline-none transition-colors ${
                errors.pro_type_id ? "border-red-500" : "border-[#102554] focus:border-[#D4AF37]"
              }`}
            >
              <option value="" className="bg-[#081A42] text-[#D3D3D3]/50">-- Select Product Type --</option>
              {productTypes.map((t) => (
                <option key={t.pro_type_id} value={t.pro_type_id} className="bg-[#081A42] text-white">
                  {t.product_type}
                </option>
              ))}
            </select>
            {errors.pro_type_id && <span className="text-[14px] text-red-400 font-semibold">{errors.pro_type_id}</span>}
          </div>

          {/* Template Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-semibold">Template Name *</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, template_name: "" }));
              }}
              placeholder="e.g. Regular Shirt Size Chart"
              className={`w-full px-4 py-3 text-[15px] placeholder:text-[#D3D3D3]/30 text-white rounded-lg border bg-[#081A42] focus:outline-none transition-colors ${
                errors.template_name ? "border-red-500" : "border-[#102554] focus:border-[#D4AF37]"
              }`}
            />
            {errors.template_name && <span className="text-[14px] text-red-400 font-semibold">{errors.template_name}</span>}
          </div>

          {/* Image Upload field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-semibold">Template Image *</label>
            
            {/* Live Preview & Area */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-1">              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-1/2 min-h-[120px] sm:aspect-video bg-[#081A42] border border-dashed border-[#102554] hover:border-[#D4AF37]/50 rounded-lg flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-all select-none hover:bg-[#081A42]/50"
              >
                <Upload size={24} className="text-[#D4AF37] mb-2" />
                <span className="text-[14px] text-[#D3D3D3] font-semibold">Choose file or drag here</span>
                <span className="text-[10px] text-[#D3D3D3]/40 mt-1">JPG, JPEG, PNG, WEBP up to 2MB</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
              </div>
 
              {/* Preview Block */}
              {previewUrl && (
                <div className="w-full sm:w-1/2 flex flex-col items-center gap-1.5">
                  <div className="relative w-full aspect-video border border-[#102554] rounded-lg overflow-hidden bg-[#081A42]">
                    <img 
                      src={previewUrl} 
                      alt="Preview template" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <span className="text-[10px] text-[#D4AF37] font-mono tracking-wider font-semibold">LIVE PREVIEW</span>
                </div>
              )}
            </div>
            {errors.image && <span className="text-[14px] text-red-400 font-semibold mt-1">{errors.image}</span>}
          </div>
 
          {/* Status Checkbox */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#D4AF37] w-4 h-4 rounded bg-[#081A42] border-[#102554]"
            />
            <label htmlFor="isActive" className="text-[14px] uppercase tracking-wider text-[#D3D3D3] cursor-pointer font-semibold select-none">
              Mark this template as active
            </label>
          </div>
 
          {/* Form Footer Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-[#081A42]/50 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 h-11 border border-[#102554] hover:bg-white/5 text-[#D3D3D3]/90 hover:text-white text-[14px] uppercase tracking-widest rounded-full cursor-pointer transition-all font-semibold text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 h-11 bg-bg-blue border border-bg-blue/50 text-white text-[14px] uppercase tracking-widest rounded-full cursor-pointer font-semibold hover:opacity-90 transition-all shadow-lg text-center"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
