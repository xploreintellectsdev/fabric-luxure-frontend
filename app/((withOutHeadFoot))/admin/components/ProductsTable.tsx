"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Edit2, Power } from "lucide-react";
import Pagination from "./Pagination";

export interface Category {
  cat_id: number;
  category_name: string;
  category_desc: string;
  category_img: string;
  product_type_name: string;
}

export interface Product {
  pro_id: number;
  cat_id: number;
  pro_name: string;
  price: number;
  pro_img: string;
  cover_description?: string;
  is_top_pics: number | boolean;
  is_exclusive: number | boolean;
  category_name: string;
  product_type_name: string;
  descriptions: { title?: string | null; text: string; number: number }[];
  specifications: { key: string; value: string }[];
  additionalImages?: string[];
  stock_quantity: number;
  stitching_price?: number | string | null;
  is_active?: number;
  disclaimer?: string;
}

interface ProductsTableProps {
  products: Product[];
  categories: string[];
  onToggleStatus: (id: string, currentStatus: number) => void;
  onEdit: (id: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getProductImageUrl = (img: string) => {
  if (!img) return "/images/home/cat-01.webp";
  if (img.startsWith("/uploads")) {
    // Split the path and encode components to handle spaces correctly
    const encodedImg = img.split('/').map(part => encodeURIComponent(part)).join('/');
    return `${API_URL}${encodedImg}`;
  }
  return img;
};

export default function ProductsTable({ products, categories, onToggleStatus, onEdit }: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams?.get("category") || "All");
  
  // Pagination State — initialize from URL
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams?.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const itemsPerPage = 20;

  // Sync search, category, page to URL so refresh restores them
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (currentPage > 1) params.set("page", currentPage.toString());
    const qs = params.toString();
    router.replace(`/admin/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, selectedCategory, currentPage]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.pro_name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#081A42] rounded-xl border border-[#102554] shadow-2xl relative overflow-visible sm:overflow-hidden">
      {/* Filtering Bar */}
      <div className="shrink-0 p-4 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 items-stretch sm:items-center bg-[#102554] border-b border-[#081A42]/50 text-white">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#081A42] border border-[#102554] rounded-full py-1.5 pl-10 pr-4 text-[15px] text-white placeholder-[#D3D3D3]/40 focus:outline-none focus:border-[#D4AF37]"
          />
          <Search className="w-4 h-4 text-[#D3D3D3]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <div className="relative w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-2 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#102554]">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-visible sm:overflow-hidden flex flex-col bg-[#102554] border-t border-[#081A42]/50 text-white min-h-0">
        <div className="flex-1 overflow-y-auto hidden sm:block">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#081A42] z-10 shadow-sm border-b border-[#102554]">
              <tr>
                <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Image</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Product Name</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Descriptions</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Specifications</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Category</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Product Type</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Top Pick</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Exclusive</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Status</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#D3D3D3]/50">
                    No products found.
                  </td>
                </tr>
              ) : (
                currentItems.map((p) => (
                  <tr key={p.pro_id} className={`hover:bg-[#081A42]/10 transition-colors ${p.is_active === 0 ? 'opacity-60 text-gray-400' : ''}`}>
                    <td className="p-4 pl-6">
                      <div className="w-12 h-12 bg-[#081A42] border border-[#102554] rounded-md overflow-hidden relative">
                        <img
                          src={getProductImageUrl(p.pro_img)}
                          alt={p.pro_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className={`p-4 font-semibold ${p.is_active === 0 ? 'text-gray-400' : 'text-white'}`}>{p.pro_name}</td>
                    <td className="p-4 max-w-xs text-[14px] leading-relaxed truncate">
                      {p.descriptions && p.descriptions.length > 0 ? (
                        <>
                          <span className="truncate inline-block max-w-[120px] align-middle">{p.descriptions[0].text}</span>
                          {p.descriptions.length > 1 && (
                            <span className="ml-1.5 text-[9px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1 py-0.5 rounded font-mono align-middle">
                              +{p.descriptions.length - 1} More
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs text-[14px] leading-relaxed truncate">
                      {p.specifications && p.specifications.length > 0 ? (
                        <>
                          <span className="truncate inline-block max-w-[120px] align-middle">{`${p.specifications[0].key}: ${p.specifications[0].value}`}</span>
                          {p.specifications.length > 1 && (
                            <span className="ml-1.5 text-[9px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1 py-0.5 rounded font-mono align-middle">
                              +{p.specifications.length - 1} More
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">{p.category_name}</td>
                    <td className="p-4">{p.product_type_name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono ${p.is_top_pics ? "bg-yellow-500/10 text-yellow-300" : "bg-transparent text-Pinball/50"}`}>
                        {p.is_top_pics ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono ${p.is_exclusive ? "bg-purple-500/10 text-purple-300" : "bg-transparent text-Pinball/50"}`}>
                        {p.is_exclusive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.is_active === 0 ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono bg-red-500/10 text-red-300">
                          Inactive
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono bg-emerald-500/10 text-emerald-300">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(String(p.pro_id))}
                          className="p-1.5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 rounded text-[#D4AF37] transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(String(p.pro_id), p.is_active ?? 1)}
                          className={`p-1.5 border rounded transition-all cursor-pointer ${
                            p.is_active === 0
                              ? "border-gray-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400"
                              : "border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                          }`}
                          title={p.is_active === 0 ? "Enable" : "Disable"}
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

        {/* Mobile Cards View */}
        <div className="block sm:hidden space-y-4 p-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-[#D3D3D3]/50 py-8">
              No products found.
            </div>
          ) : (
            currentItems.map((p) => {
              return (
                <div key={p.pro_id} className={`bg-[#081A42]/40 border border-[#102554] rounded-2xl p-4 flex flex-col gap-4 transition-colors text-left ${p.is_active === 0 ? 'opacity-60 text-gray-400' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-[#081A42] border border-[#102554] rounded-xl overflow-hidden relative shrink-0">
                      <img
                        src={getProductImageUrl(p.pro_img)}
                        alt={p.pro_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-bold text-base break-words leading-tight ${p.is_active === 0 ? 'text-gray-400' : 'text-white'}`}>{p.pro_name}</h4>
                      <p className="text-gray-400 text-xs mt-1">Product Type: <span className="text-white">{p.product_type_name}</span></p>
                      <p className="text-gray-400 text-xs mt-0.5">Category: <span className="text-white">{p.category_name}</span></p>
                    </div>
                  </div>

                  {p.descriptions && p.descriptions.length > 0 && (
                    <div className="border-t border-[#102554]/50 pt-3">
                      <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-wider block mb-1">Description</span>
                      <p className="text-gray-300 text-xs leading-relaxed break-words whitespace-normal">
                        {p.descriptions[0].text}
                        {p.descriptions.length > 1 && (
                          <span className="ml-1.5 text-[9px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1.5 py-0.5 rounded font-mono inline-block">
                            +{p.descriptions.length - 1} More
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {p.specifications && p.specifications.length > 0 && (
                    <div className="border-t border-[#102554]/50 pt-3">
                      <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-wider block mb-1">Specifications</span>
                      <p className="text-gray-300 text-xs leading-relaxed break-words whitespace-normal">
                        <span className="font-semibold">{p.specifications[0].key}:</span> {p.specifications[0].value}
                        {p.specifications.length > 1 && (
                          <span className="ml-1.5 text-[9px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1.5 py-0.5 rounded font-mono inline-block">
                            +{p.specifications.length - 1} More
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 border-t border-[#102554]/50 pt-3 text-[10px] font-semibold font-mono text-center">
                    <div className="bg-[#102554]/30 border border-[#102554] rounded-lg py-1 px-1.5">
                      <span className="text-gray-400 block text-[9px] mb-0.5">Top Pick</span>
                      <span className={p.is_top_pics ? "text-yellow-300" : "text-gray-500"}>
                        {p.is_top_pics ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="bg-[#102554]/30 border border-[#102554] rounded-lg py-1 px-1.5">
                      <span className="text-gray-400 block text-[9px] mb-0.5">Exclusive</span>
                      <span className={p.is_exclusive ? "text-purple-300" : "text-gray-500"}>
                        {p.is_exclusive ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="bg-[#102554]/30 border border-[#102554] rounded-lg py-1 px-1.5">
                      <span className="text-gray-400 block text-[9px] mb-0.5">Status</span>
                      <span className={p.is_active === 0 ? "text-red-300" : "text-emerald-300"}>
                        {p.is_active === 0 ? "INACTIVE" : "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-[#102554]/50 pt-3">
                    <button
                      onClick={() => onEdit(String(p.pro_id))}
                      className="flex-1 py-2 px-3 bg-[#102554] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-[#D4AF37] font-semibold rounded-lg transition-colors cursor-pointer text-xs uppercase tracking-wider text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onToggleStatus(String(p.pro_id), p.is_active ?? 1)}
                      className={`flex-1 py-2 px-3 border font-semibold rounded-lg transition-colors cursor-pointer text-xs uppercase tracking-wider text-center ${
                        p.is_active === 0
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {p.is_active === 0 ? "Enable" : "Disable"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
