"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface SizeChartRow {
  size_chart_id?: number;
  pro_type_id: number;
  fit_style_id: number;
  size_name: string;
  [key: string]: any;
  display_order: number | string;
  is_active: boolean | number;
}

interface DynamicSizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sizeData: Omit<SizeChartRow, "size_chart_id">) => void;
  measurementColumns: string[];
  productTypeName: string;
  fitStyleName: string;
  proTypeId: number;
  fitStyleId: number;
  initialData?: SizeChartRow | null;
}

export default function DynamicSizeChartModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  productTypeName, 
  fitStyleName,
  proTypeId,
  fitStyleId,
  measurementColumns
}: DynamicSizeChartModalProps) {
  const [sizeName, setSizeName] = useState<string>("");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [displayOrder, setDisplayOrder] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data for Edit Mode
  useEffect(() => {
    if (initialData) {
      setSizeName(initialData.size_name || "");
      const initMeasurements: Record<string, string> = {};
      measurementColumns.forEach(col => {
        initMeasurements[col] = initialData[col] !== undefined ? String(initialData[col]) : "";
      });
      setMeasurements(initMeasurements);
      setDisplayOrder(String(initialData.display_order || ""));
      setIsActive(Boolean(initialData.is_active));
    } else {
      // Clear fields for Add Mode
      setSizeName("");
      const emptyMeasurements: Record<string, string> = {};
      measurementColumns.forEach(col => {
        emptyMeasurements[col] = "";
      });
      setMeasurements(emptyMeasurements);
      setDisplayOrder("");
      setIsActive(true);
    }
    setErrors({});
  }, [initialData, isOpen, measurementColumns]);



  const handleDisplayOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]*$/.test(val)) {
      setDisplayOrder(val);
      setErrors((prev) => ({ ...prev, display_order: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!sizeName.trim()) newErrors.size_name = "Size Name is required.";
    if (!displayOrder.trim()) newErrors.display_order = "Display Order is required.";

    measurementColumns.forEach(col => {
      if (!measurements[col] || !measurements[col].trim()) {
        newErrors[col] = `${col.replace(/_/g, ' ')} is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      pro_type_id: proTypeId,
      fit_style_id: fitStyleId,
      size_name: sizeName.trim(),
      display_order: Number(displayOrder),
      is_active: isActive
    };

    measurementColumns.forEach(col => {
      payload[col] = Number(measurements[col]);
    });

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-left">
      <div 
        className="relative bg-[#102554] border border-[#D4AF37]/30 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col p-4 sm:p-8 shadow-2xl text-white overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#081A42]/50 mb-4">
          <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
            {initialData ? "Edit Size Chart Row" : "Add Size Chart Row"}
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
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 grow scrollbar-thin">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 opacity-70">
              <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-semibold">Product Type</label>
              <input type="text" value={productTypeName} disabled className="w-full px-4 py-2.5 text-[15px] text-white rounded-lg border border-[#102554] bg-[#081A42] cursor-not-allowed" />
            </div>
            <div className="flex flex-col gap-1.5 opacity-70">
              <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-semibold">Fit Style</label>
              <input type="text" value={fitStyleName} disabled className="w-full px-4 py-2.5 text-[15px] text-white rounded-lg border border-[#102554] bg-[#081A42] cursor-not-allowed" />
            </div>
          </div>

          {/* Size Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-semibold">Size Name *</label>
            <input
              type="text"
              value={sizeName}
              onChange={(e) => {
                setSizeName(e.target.value);
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, size_name: "" }));
              }}
              placeholder="e.g. S, M, XXL, 3XL"
              className={`w-full px-4 py-2.5 text-[15px] placeholder:text-[#D3D3D3]/30 text-white rounded-lg border bg-[#081A42] focus:outline-none transition-colors ${
                errors.size_name ? "border-red-500" : "border-[#102554] focus:border-[#D4AF37]"
              }`}
            />
            {errors.size_name && <span className="text-[14px] text-red-400 font-semibold">{errors.size_name}</span>}
          </div>

          {/* Measurements grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {measurementColumns.map(col => (
              <div key={col} className="flex flex-col gap-1.5">
                <label className="text-[14px] uppercase tracking-wider text-[#D3D3D3]/60 font-semibold">{col.replace(/_/g, ' ')} (inches) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={measurements[col] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
                      setMeasurements(prev => ({ ...prev, [col]: val }));
                      setErrors(prev => ({ ...prev, [col]: "" }));
                    }
                  }}
                  placeholder={`e.g. 32`}
                  className={`w-full px-4 py-2.5 text-[15px] placeholder:text-[#D3D3D3]/30 text-white rounded-lg border bg-[#081A42] focus:outline-none transition-colors ${
                    errors[col] ? "border-red-500" : "border-[#102554] focus:border-[#D4AF37]"
                  }`}
                />
                {errors[col] && <span className="text-[14px] text-red-400 font-semibold">{errors[col]}</span>}
              </div>
            ))}
          </div>

          {/* Display Order */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D3D3D3]/60 font-semibold">Display Order *</label>
            <input
              type="text"
              inputMode="numeric"
              value={displayOrder}
              onChange={handleDisplayOrderChange}
              placeholder="e.g. 1, 2, 3..."
              className={`w-full px-4 py-2.5 text-[15px] placeholder:text-[#D3D3D3]/30 text-white rounded-lg border bg-[#081A42] focus:outline-none transition-colors ${
                errors.display_order ? "border-red-500" : "border-[#102554] focus:border-[#D4AF37]"
              }`}
            />
            {errors.display_order && <span className="text-[14px] text-red-400 font-semibold">{errors.display_order}</span>}
          </div>

          {/* Active Status toggle */}
          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-[14px] font-semibold text-[#D3D3D3]">Status: {isActive ? 'Active' : 'Inactive'}</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-[#102554] border-t border-[#081A42]/50 mt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-[14px] font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition-colors border border-transparent text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-6 py-2.5 rounded-full text-[14px] font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-black/20 text-center"
            >
              {initialData ? "Save Changes" : "Create Row"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
