"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import UpdateStockModal from "../components/UpdateStockModal";
import Pagination from "../components/Pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  pro_id: number;
  pro_name: string;
  pro_img: string;
  product_type_name: string;
  stock_quantity: number;
  stock_unit: string;
  [key: string]: any;
}

export default function InventoryDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams?.get("search") || "");
  const [filterType, setFilterType] = useState(() => searchParams?.get("type") || "All");
  const [filterStatus, setFilterStatus] = useState(() => searchParams?.get("status") || "All");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination State — initialize from URL
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams?.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const itemsPerPage = 20;

  // Sync filters + page to URL so refresh restores them
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterType !== "All") params.set("type", filterType);
    if (filterStatus !== "All") params.set("status", filterStatus);
    if (currentPage > 1) params.set("page", currentPage.toString());
    const qs = params.toString();
    router.replace(`/admin/inventory${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, filterType, filterStatus, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatus = (stock: number) => {
    if (stock > 10) return { label: "In Stock", color: "bg-green-500", text: "text-green-500", border: "border-green-500" };
    if (stock <= 10 && stock > 5) return { label: "Low Stock", color: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500" };
    if (stock <= 5 && stock > 0) return { label: "Critical Stock", color: "bg-orange-500", text: "text-orange-500", border: "border-orange-500" };
    return { label: "Out Of Stock", color: "bg-red-500", text: "text-red-500", border: "border-red-500" };
  };

  const handleUpdateStock = async (newStock: string) => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${selectedProduct.pro_id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_quantity: newStock }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Stock updated successfully");
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to update stock");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Compute Dashboard Cards
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock_quantity > 10).length,
    lowStock: products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 5).length,
    criticalStock: products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0).length,
    outOfStock: products.filter(p => p.stock_quantity === 0 || p.stock_quantity == null).length,
  };

  const productTypes = ["All", ...Array.from(new Set(products.map(p => p.product_type_name || "Unknown").filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.pro_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || (p.product_type_name || "Unknown") === filterType;
    const pStatus = getStatus(p.stock_quantity || 0).label;
    const matchesStatus = filterStatus === "All" || pStatus === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination Logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterStatus]);

  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // helper func for image
  const resolveImageUrl = (path: string | undefined | null) => {
    if (!path) return "/images/placeholder.jpg";
    if (path.startsWith("http")) return path;
    const encodedPath = path.split('/').map(part => encodeURIComponent(part)).join('/');
    return `${API_URL}${encodedPath}`;
  };

  return (
    <div className="flex flex-col h-auto sm:h-full overflow-visible sm:overflow-hidden animate-fade-in text-white w-full px-3.5 sm:px-6">
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider font-mono uppercase leading-tight">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Monitor and update product stock levels.</p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white rounded-lg transition-colors w-full sm:w-auto shrink-0 text-sm font-semibold uppercase tracking-wider h-11"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-[#081A42] p-4 sm:p-5 rounded-xl border border-[#102554] text-left col-span-1 sm:col-span-2 lg:col-span-1 min-w-0">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-mono mb-2 whitespace-normal break-words text-wrap leading-tight">Total Products</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#081A42] p-4 sm:p-5 rounded-xl border border-[#102554] text-left col-span-1 sm:col-span-2 lg:col-span-1 min-w-0">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-mono mb-2 whitespace-normal break-words text-wrap leading-tight">In Stock</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-500">{stats.inStock}</p>
        </div>
        <div className="bg-[#081A42] p-4 sm:p-5 rounded-xl border border-[#102554] text-left col-span-1 sm:col-span-2 lg:col-span-1 min-w-0">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-mono mb-2 whitespace-normal break-words text-wrap leading-tight">Low Stock</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{stats.lowStock}</p>
        </div>
        <div className="bg-[#081A42] p-4 sm:p-5 rounded-xl border border-[#102554] text-left col-span-1 sm:col-span-3 lg:col-span-1 min-w-0">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-mono mb-2 whitespace-normal break-words text-wrap leading-tight">Critical Stock</p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-500">{stats.criticalStock}</p>
        </div>
        <div className="bg-[#081A42] p-4 sm:p-5 rounded-xl border border-[#102554] text-left col-span-2 sm:col-span-3 lg:col-span-1 min-w-0">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-mono mb-2 whitespace-normal break-words text-wrap leading-tight">Out Of Stock</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-500">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 bg-[#081A42] p-3 rounded-xl border border-[#102554]">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#102554]/50 border border-[#102554] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 sm:flex-none bg-[#102554]/50 border border-[#102554] rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer text-center"
          >
            {productTypes.map(pt => (
              <option key={pt} value={pt} className="bg-[#081A42] text-white">{pt}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none bg-[#102554]/50 border border-[#102554] rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer text-center"
          >
            <option value="All" className="bg-[#081A42] text-white">All Statuses</option>
            <option value="In Stock" className="bg-[#081A42] text-white">In Stock</option>
            <option value="Low Stock" className="bg-[#081A42] text-white">Low Stock</option>
            <option value="Critical Stock" className="bg-[#081A42] text-white">Critical Stock</option>
            <option value="Out Of Stock" className="bg-[#081A42] text-white">Out Of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#081A42] border border-[#102554] rounded-xl overflow-visible sm:overflow-hidden flex flex-col min-h-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400 flex-1 flex items-center justify-center">Loading inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex-1 flex items-center justify-center">No products found matching your filters.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block flex-1 overflow-auto w-full">
              <table className="w-full min-w-[800px] lg:min-w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#102554] z-10 shadow-sm">
                  <tr className="text-gray-300 text-[10px] uppercase tracking-wider font-mono">
                    <th className="p-4 font-semibold">Image</th>
                    <th className="p-4 font-semibold">Product Name</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold text-center">Stock</th>
                    <th className="p-4 font-semibold">Unit</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102554]/50">
                  {currentItems.map((p) => {
                    const status = getStatus(p.stock_quantity || 0);
                    return (
                      <tr key={p.pro_id} className="hover:bg-[#102554]/30 transition-colors">
                        <td className="p-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#102554]">
                            <Image
                              src={resolveImageUrl(p.pro_img)}
                              alt={p.pro_name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="p-4 text-white font-medium max-w-[200px] truncate">{p.pro_name}</td>
                        <td className="p-4 text-gray-400 text-sm">{p.product_type_name || "-"}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-white text-lg">{p.stock_quantity || 0}</span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">{p.stock_unit || "-"}</td>
                        <td className="p-4">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#081A42] border ${status.border} ${status.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${status.color}`}></div>
                            {status.label}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-[#102554] hover:bg-[#D4AF37] hover:text-[#081A42] text-white text-sm font-semibold rounded-lg transition-colors border border-[#102554]"
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3 p-3">
              {currentItems.map((p) => {
                const status = getStatus(p.stock_quantity || 0);
                return (
                  <div key={p.pro_id} className="bg-[#102554]/30 border border-[#102554] rounded-xl p-4 flex flex-col gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#102554] shrink-0">
                        <Image
                          src={resolveImageUrl(p.pro_img)}
                          alt={p.pro_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-semibold text-sm break-words leading-snug">{p.pro_name}</h4>
                        <p className="text-gray-400 text-xs mt-0.5">Type: {p.product_type_name || "-"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#102554]/50 pt-2.5">
                      <div>
                        <span className="text-gray-400">Stock: </span>
                        <span className="font-bold text-white">{p.stock_quantity || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Unit: </span>
                        <span className="text-white font-medium">{p.stock_unit || "-"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-[#102554]/50 pt-2.5">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#081A42] border ${status.border} ${status.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.color}`}></div>
                        {status.label}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#102554] hover:bg-[#D4AF37] hover:text-[#081A42] text-white text-xs font-semibold rounded-lg transition-colors border border-[#102554] shrink-0 active:scale-95 cursor-pointer"
                      >
                        Update Stock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <UpdateStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateStock}
        productName={selectedProduct?.pro_name || ""}
        currentStock={selectedProduct?.stock_quantity || 0}
        stockUnit={selectedProduct?.stock_unit || "PCS"}
        isSaving={isSaving}
      />
    </div>
  );
}
