"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, X, Upload } from "lucide-react";
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProductType {
  pro_type_id: number;
  product_type: string;
  is_deleted: number;
}

interface Color {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
  proTypeId: string;
  proTypeName: string;
}

export default function MonogramColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Product types
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProTypeId, setSelectedProTypeId] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals / Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);

  // Delete Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    isActive: true,
    proTypeId: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch product types on mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/product-types`);
        const data = await res.json();
        if (data.success && data.data) {
          const types: ProductType[] = data.data.filter((t: ProductType) => t.is_deleted === 0);
          setProductTypes(types);
          const shirtType = types.find((t) => t.product_type.toLowerCase() === 'shirt');
          const defaultId = shirtType ? shirtType.pro_type_id.toString() : (types[0]?.pro_type_id.toString() ?? "");
          setSelectedProTypeId(defaultId);
        }
      } catch (err) {
        console.error("Failed to fetch product types", err);
      }
    };
    fetchProductTypes();
  }, []);

  const fetchColors = async (proTypeId?: string) => {
    const typeId = proTypeId ?? selectedProTypeId;
    if (!typeId) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/monogram/colors?pro_type_id=${typeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setColors(data.data.map((item: any) => {
          const pt = productTypes.find(t => t.pro_type_id === item.pro_type_id);
          return {
            id: item.color_id.toString(),
            name: item.color_name,
            image: item.color_image?.startsWith("/uploads") ? `${API_URL}${item.color_image}` : (item.color_image || ""),
            isActive: item.is_active === 1,
            proTypeId: item.pro_type_id?.toString() ?? "",
            proTypeName: pt?.product_type ?? ""
          };
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (selectedProTypeId && productTypes.length > 0) {
      fetchColors(selectedProTypeId);
    }
  }, [selectedProTypeId, productTypes]);

  // Filter & Pagination Logic — search across Product Type + Name
  const filteredColors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return colors.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.proTypeName.toLowerCase().includes(q)
    );
  }, [colors, searchQuery]);

  const paginatedColors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredColors.slice(start, start + itemsPerPage);
  }, [filteredColors, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredColors.length / itemsPerPage));

  // Handlers
  const handleOpenDrawer = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setFormData({
        name: color.name,
        image: color.image,
        isActive: color.isActive,
        proTypeId: color.proTypeId
      });
    } else {
      setEditingColor(null);
      setFormData({
        name: "",
        image: "",
        isActive: true,
        proTypeId: selectedProTypeId
      });
    }
    setImageFile(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingColor(null);
    setImageFile(null);
  };

  const handleSave = async () => {
    if (!formData.proTypeId) {
      toast.error("Product Type is required.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Color Name is required.");
      return;
    }
    if (!editingColor && !imageFile) {
      toast.error("Image is required to create a new color.");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const form = new FormData();
      form.append("color_name", formData.name);
      form.append("is_active", formData.isActive ? "1" : "0");
      form.append("pro_type_id", formData.proTypeId);
      if (imageFile) {
        form.append("color_image", imageFile);
      }

      let res;
      if (editingColor) {
        res = await fetch(`${API_URL}/api/admin/monogram/colors/${editingColor.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });
      } else {
        res = await fetch(`${API_URL}/api/admin/monogram/colors`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });
      }

      const textData = await res.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        toast.error(`Server error (${res.status}): ${textData.substring(0, 50)}`);
        return;
      }

      if (data.success) {
        fetchColors();
        handleCloseDrawer();
      } else {
        toast.error(data.message || data.error || `Failed to save (Status: ${res.status})`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`An error occurred: ${err.message || err}`);
    }
  };

  const handleDeleteClick = (c: Color) => {
    setDeleteTargetId(c.id);
    setDeleteTargetName(c.name);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (deleteTargetId) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_URL}/api/admin/monogram/colors/${deleteTargetId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          fetchColors();
        }
      } catch (err) {
        console.error(err);
      }
    }
    setShowConfirmModal(false);
    setDeleteTargetId(null);
    setDeleteTargetName("");
  };

  const toggleStatus = async (id: string) => {
    const color = colors.find(c => c.id === id);
    if (!color) return;

    // Optimistic update
    setColors(prev => prev.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));

    try {
      const token = localStorage.getItem("admin_token");
      const form = new FormData();
      form.append("color_name", color.name);
      form.append("is_active", !color.isActive ? "1" : "0");

      await fetch(`${API_URL}/api/admin/monogram/colors/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
    } catch (err) {
      console.error(err);
      fetchColors(); // revert on error
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
            Monogram Colors
          </h2>
          <p className="text-[14px] text-[#D3D3D3]/80">Manage all embroidery thread colors.</p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#b5952f] text-[#081A42] px-5 py-2.5 rounded-full text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Color
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3">
          <label className="text-[#D4AF37] uppercase font-mono tracking-wider text-[14px] whitespace-nowrap">Product Type</label>
          <select
            value={selectedProTypeId}
            onChange={(e) => {
              setSelectedProTypeId(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#081A42] border border-[#081A42]/50 text-white p-2 rounded-lg outline-none w-48"
          >
            {productTypes.map((type) => (
              <option key={type.pro_type_id} value={type.pro_type_id}>
                {type.product_type}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-[#D3D3D3]/50" />
          <input
            type="text"
            placeholder="Search by color name or product type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none outline-none text-white w-full placeholder-[#D3D3D3]/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden shadow-sm text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#081A42]/50 bg-[#081A42]/20">
                <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Preview</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Product Type</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Color Name</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Status</th>
                <th className="p-4 pr-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
              {paginatedColors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#D3D3D3]/50">
                    No colors found.
                  </td>
                </tr>
              ) : (
                paginatedColors.map((c) => (
                  <tr key={c.id} className="hover:bg-[#081A42]/10 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="w-12 h-12 bg-[#081A42] border border-[#102554] rounded-md overflow-hidden relative">
                        <Image src={c.image} alt={c.name} fill className="object-cover" unoptimized />
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[12px] font-mono uppercase tracking-wider rounded">
                        {c.proTypeName || "—"}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">{c.name}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${c.isActive ? 'bg-[#D4AF37]' : 'bg-[#081A42]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${c.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDrawer(c)}
                          className="p-1.5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded text-yellow-400 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
                          className="p-1.5 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 rounded text-red-400 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-md bg-[#102554] border border-[#081A42]/50 text-[#D3D3D3] hover:bg-[#081A42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="text-[#D3D3D3] text-sm">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-4 py-2 rounded-md bg-[#102554] border border-[#081A42]/50 text-[#D3D3D3] hover:bg-[#081A42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseDrawer} />
          <div className="fixed inset-y-0 right-0 flex max-w-md w-full">
            <div className="w-full h-full bg-[#102554] shadow-2xl flex flex-col border-l border-[#D4AF37]/30 transform transition-transform animate-slide-in-right">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#081A42]/50 flex items-center justify-between">
                <h2 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
                  {editingColor ? 'Edit Color' : 'Add Color'}
                </h2>
                <button onClick={handleCloseDrawer} className="text-[#D3D3D3]/60 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* Product Type */}
                <div className="space-y-2">
                  <label className="text-[12px] uppercase tracking-wider text-[#D3D3D3]/80 font-semibold">
                    Product Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.proTypeId}
                    onChange={(e) => setFormData({ ...formData, proTypeId: e.target.value })}
                    className="w-full bg-[#081A42] border border-[#102554] rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  >
                    <option value="">— Select Product Type —</option>
                    {productTypes.map((type) => (
                      <option key={type.pro_type_id} value={type.pro_type_id}>
                        {type.product_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Name */}
                <div className="space-y-2">
                  <label className="text-[12px] uppercase tracking-wider text-[#D3D3D3]/80 font-semibold">Color Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#081A42] border border-[#102554] rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    placeholder="e.g. Black"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-[12px] uppercase tracking-wider text-[#D3D3D3]/80 font-semibold">Upload Thread Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 bg-[#081A42] border-2 border-dashed border-[#102554] rounded-md flex flex-col items-center justify-center text-[#D3D3D3]/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors cursor-pointer relative overflow-hidden"
                  >
                    {imageFile ? (
                      <div className="w-full h-full relative">
                        <Image src={URL.createObjectURL(imageFile)} alt="preview" fill className="object-cover" unoptimized />
                      </div>
                    ) : formData.image ? (
                      <div className="w-full h-full relative">
                        <Image src={formData.image} alt="preview" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm">Click to upload image</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2">
                  <label className="text-[14px] tracking-wider text-white font-semibold">Status</label>
                  <button
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? 'bg-[#D4AF37]' : 'bg-[#081A42]'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-[#081A42]/50 flex gap-4">
                <button
                  onClick={handleCloseDrawer}
                  className="flex-1 py-3 px-4 bg-transparent border border-[#D3D3D3]/30 rounded-full text-white font-semibold tracking-wider hover:bg-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-[#b5952f] text-[#081A42] rounded-full font-semibold tracking-wider transition-colors"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              Delete Monogram Color
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              Are you sure you want to remove &quot;{deleteTargetName}&quot;?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={executeDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                YES REMOVE
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteTargetId(null);
                  setDeleteTargetName("");
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
