"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Edit2, Search, Power } from "lucide-react";
import Pagination from "./Pagination";
export interface Category {
  cat_id: number;
  pro_type_id: number;
  category_name: string;
  category_desc: string;
  category_img: string;
  product_type_name?: string;
  is_active?: number;
}

interface CategoriesTableProps {
  categories: Category[];
  onToggleStatus: (id: string, currentStatus: number) => void;
  onEdit: (cat: Category) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getCategoryImageUrl = (img: string) => {
  if (!img) return "/images/home/cat-01.webp";
  if (img.startsWith("/uploads")) {
    const encodedImg = img.split('/').map(part => encodeURIComponent(part)).join('/');
    return `${API_URL}${encodedImg}`;
  }
  return img;
};

export default function CategoriesTable({ categories, onToggleStatus, onEdit }: CategoriesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredCategories = categories.filter((c) => {
    return c.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.category_desc && c.category_desc.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#081A42] rounded-xl border border-[#102554] shadow-2xl relative overflow-hidden">
      {/* Controls Header */}
      <div className="shrink-0 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#102554] bg-[#0A1D4A]">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#081A42] border border-[#102554] rounded-lg py-2 pl-10 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-[#102554] border-t border-[#081A42]/50 text-white min-h-0">
        <div className="flex-1 overflow-y-auto">
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#081A42] z-10 shadow-sm border-b border-[#102554]">
                <tr>
                  <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Image</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Category Name</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Description</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Product Type</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#D3D3D3]/50">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((c) => (
                    <tr key={c.cat_id} className={`hover:bg-[#081A42]/10 transition-colors ${c.is_active === 0 ? 'opacity-60' : ''}`}>
                      <td className="p-4 pl-6">
                        <div className="w-12 h-12 bg-[#081A42] border border-[#102554] rounded-md overflow-hidden relative">
                          <img 
                            src={getCategoryImageUrl(c.category_img)} 
                            alt={c.category_name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={c.is_active === 0 ? "text-gray-400" : "text-white"}>{c.category_name}</span>
                          {c.is_active === 0 ? (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30">Inactive</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-sm text-[14px] leading-relaxed">{c.category_desc}</td>
                      <td className="p-4">{c.product_type_name || "Shirt"}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(c)}
                            className="p-1.5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded text-yellow-400 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onToggleStatus(String(c.cat_id), c.is_active ?? 1)}
                            className={`p-1.5 border rounded transition-all cursor-pointer ${
                              c.is_active === 0
                                ? "border-gray-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400"
                                : "border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                            }`}
                            title={c.is_active === 0 ? "Enable" : "Disable"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Categories View (visible on mobile, hidden on desktop) */}
          <div className="md:hidden divide-y divide-[#081A42]/30 text-[#D3D3D3]">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-[#D3D3D3]/50">
                No categories found.
              </div>
            ) : (
              currentItems.map((c) => (
                <div key={c.cat_id} className={`p-4 hover:bg-[#081A42]/10 transition-colors ${c.is_active === 0 ? 'opacity-60' : ''} flex flex-col gap-3 min-w-0`}>
                  {/* Top segment: Image, Category Name, Product Type, Status */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 bg-[#081A42] border border-[#102554] rounded-md overflow-hidden relative shrink-0">
                      <img 
                        src={getCategoryImageUrl(c.category_img || "")} 
                        alt={c.category_name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[14px] font-semibold ${c.is_active === 0 ? "text-gray-400" : "text-white"} break-words`}>{c.category_name}</span>
                        {c.is_active === 0 ? (
                          <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">Inactive</span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/50 font-mono mt-0.5">Type: {c.product_type_name || "Shirt"}</p>
                    </div>
                  </div>

                  {/* Middle segment: Description */}
                  {c.category_desc && (
                    <p className="text-[12px] text-[#D3D3D3]/80 leading-relaxed text-left break-words overflow-wrap-anywhere">
                      {c.category_desc}
                    </p>
                  )}

                  {/* Bottom Actions segment (ALWAYS visible) */}
                  <div className="flex items-center justify-end gap-2 border-t border-[#081A42]/30 pt-2.5">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-1.5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded text-yellow-400 transition-all cursor-pointer flex items-center gap-1.5 text-[12px] px-2.5 py-1"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onToggleStatus(String(c.cat_id), c.is_active ?? 1)}
                      className={`p-1.5 border rounded transition-all cursor-pointer flex items-center gap-1.5 text-[12px] px-2.5 py-1 ${
                        c.is_active === 0
                          ? "border-gray-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400"
                          : "border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                      }`}
                      title={c.is_active === 0 ? "Enable" : "Disable"}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{c.is_active === 0 ? "Enable" : "Disable"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
