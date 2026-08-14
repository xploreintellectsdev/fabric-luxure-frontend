"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: string) => Promise<void>;
  productName: string;
  currentStock: number;
  stockUnit: string;
  isSaving: boolean;
}

export default function UpdateStockModal({
  isOpen,
  onClose,
  onSave,
  productName,
  currentStock,
  stockUnit,
  isSaving,
}: UpdateStockModalProps) {
  const [stockQuantity, setStockQuantity] = useState(String(currentStock));

  useEffect(() => {
    setStockQuantity(String(currentStock));
  }, [currentStock, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-[#081A42] border border-[#102554] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#102554] shrink-0">
          <h3 className="text-xl font-bold text-white tracking-wider font-mono">
            Update Stock
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto grow">
          <div className="mb-6">
            <h4 className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-mono">
              Product
            </h4>
            <p className="text-white text-lg font-medium leading-tight break-words">
              {productName}
            </p>
          </div>
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="w-full sm:flex-1 bg-[#102554]/50 p-4 rounded-xl border border-[#102554]">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-mono mb-1">
                Current Stock
              </p>
              <p className="text-white font-bold text-xl">
                {currentStock} <span className="text-sm font-normal text-gray-400">{stockUnit}</span>
              </p>
            </div>
            <div className="w-full sm:flex-1">
              <label className="text-gray-400 text-xs uppercase tracking-wider font-mono mb-1 block">
                New Stock
              </label>
              <input
                type="number"
                step={stockUnit === "METER" ? "0.01" : "1"}
                min="0"
                value={stockQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (Number(val) >= 0 || val === "") setStockQuantity(val);
                }}
                className="w-full bg-[#102554]/50 border border-[#102554] rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37] h-[66px] text-xl font-bold"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:flex-1 py-3 px-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all border border-[#102554] hover:bg-[#102554] text-white disabled:opacity-50 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(stockQuantity)}
              disabled={isSaving || stockQuantity === "" || Number(stockQuantity) < 0}
              className="w-full sm:flex-1 py-3 px-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all bg-[#D4AF37] hover:bg-[#C5A028] text-[#081A42] disabled:opacity-50 disabled:bg-[#102554] disabled:text-gray-500 cursor-pointer text-center"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
