"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Check, X, Power } from "lucide-react";
import { getActivities, setActivities } from "../data/mockStore";

interface ProductType {
  pro_type_id: number;
  product_type: string;
  is_active: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminProductTypesPage() {
  const [types, setLocalTypes] = useState<ProductType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Custom Toggle Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toggleTargetId, setToggleTargetId] = useState<number | null>(null);
  const [toggleTargetName, setToggleTargetName] = useState<string>("");
  const [toggleTargetStatus, setToggleTargetStatus] = useState<number>(1);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/product-types`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setLocalTypes(resData.data);
      } else {
        showToast(resData.error || "Failed to load product types.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to connect to backend server.", "error");
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    const name = newTypeName.trim();

    try {
      const res = await fetch(`${API_URL}/api/product-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const resData = await res.json();

      if (res.ok) {
        showToast("Product type created successfully", "success");
        setNewTypeName("");
        setIsAdding(false);
        fetchTypes();

        // Track activity
        const act = getActivities();
        setActivities([
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Created product type '${name}'`,
            time: "Just now"
          },
          ...act
        ]);
      } else {
        showToast(resData.error || "Failed to create product type.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    }
  };

  const handleStartEdit = (id: number, val: string) => {
    setEditingId(id);
    setEditingValue(val);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingValue.trim()) return;
    const name = editingValue.trim();

    try {
      const res = await fetch(`${API_URL}/api/product-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const resData = await res.json();

      if (res.ok) {
        showToast("Product type updated successfully", "success");
        setEditingId(null);
        fetchTypes();

        // Track activity
        const act = getActivities();
        setActivities([
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Updated product type ID ${id} to '${name}'`,
            time: "Just now"
          },
          ...act
        ]);
      } else {
        showToast(resData.error || "Failed to update product type.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    }
  };

  const handleToggleStatus = (id: number, name: string, currentStatus: number) => {
    setToggleTargetId(id);
    setToggleTargetName(name);
    setToggleTargetStatus(currentStatus === 1 ? 0 : 1);
    setShowConfirmModal(true);
  };

  const executeToggleStatus = async () => {
    if (toggleTargetId === null) return;
    const id = toggleTargetId;
    const newStatus = toggleTargetStatus;
    try {
      const res = await fetch(`${API_URL}/api/product-types/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus === 1 }),
      });
      const resData = await res.json();

      if (res.ok) {
        showToast(`Product type ${newStatus === 1 ? 'enabled' : 'disabled'} successfully`, "success");
        fetchTypes();

        // Track activity
        const act = getActivities();
        setActivities([
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `${newStatus === 1 ? 'Enabled' : 'Disabled'} product type '${toggleTargetName}'`,
            time: "Just now"
          },
          ...act
        ]);
      } else {
        showToast(resData.error || "Failed to update status.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error.", "error");
    } finally {
      setShowConfirmModal(false);
      setToggleTargetId(null);
      setToggleTargetName("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white w-full max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
            Product Types
          </h2>
          <p className="text-[14px] text-[#D3D3D3]/80">Manage different types of catalog outfits, such as Shirts or Blazers.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? "Cancel" : "Add Type"}
        </button>
      </div>

      {/* Add New Product Type Panel */}
      {isAdding && (
        <form onSubmit={handleAddType} className="bg-[#102554] border border-[#081A42]/50 p-6 rounded-xl shadow-md text-left flex gap-4 items-end">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Product Type Name</label>
            <input
              type="text"
              required
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. Jacket"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-3 rounded-lg text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white shrink-0"
          >
            Save Type
          </button>
        </form>
      )}

      {/* Table Catalog */}
      <div className="bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#081A42]/50 bg-[#081A42]/20">
              <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Product Type Name</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
            {types.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-8 text-center text-[#D3D3D3]/50">
                  No product types registered.
                </td>
              </tr>
            ) : (
              types.map((t) => (
                <tr key={t.pro_type_id} className={`hover:bg-[#081A42]/10 transition-colors ${t.is_active === 0 ? 'opacity-60' : ''}`}>
                  <td className="p-4 pl-6 font-semibold">
                    {editingId === t.pro_type_id ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="bg-[#081A42] border border-[#D4AF37] rounded px-3 py-1.5 text-[15px] text-white focus:outline-none w-full max-w-sm"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={t.is_active === 0 ? "text-gray-400" : "text-white"}>{t.product_type}</span>
                        {t.is_active === 0 ? (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30">Inactive</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {editingId === t.pro_type_id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(t.pro_type_id)}
                            className="p-1.5 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded text-emerald-400 transition-all cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 border border-gray-500/20 hover:border-gray-500/50 hover:bg-gray-500/10 rounded text-gray-400 transition-all cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(t.pro_type_id, t.product_type)}
                            className="p-1.5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 rounded text-[#D4AF37] transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(t.pro_type_id, t.product_type, t.is_active)}
                            className={`p-1.5 border rounded transition-all cursor-pointer ${
                              t.is_active === 0
                                ? "border-gray-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400"
                                : "border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                            }`}
                            title={t.is_active === 0 ? "Enable" : "Disable"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              {toggleTargetStatus === 1 ? "Enable" : "Disable"} Product Type?
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              Are you sure you want to {toggleTargetStatus === 1 ? "enable" : "disable"} the Product Type <strong>"{toggleTargetName}"</strong>?
            </p>
            <p className="text-[14px] text-[#D3D3D3]/60 leading-relaxed">
              {toggleTargetStatus === 1 
                ? "This will allow products of this type to be visible on the customer website again (if their category and the products themselves are also active)."
                : "Products under this type will be immediately hidden from the customer website. Existing orders will not be affected."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setToggleTargetId(null);
                  setToggleTargetName("");
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeToggleStatus}
                className={`${toggleTargetStatus === 1 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer`}
              >
                {toggleTargetStatus === 1 ? "Enable" : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Toast Overlay */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30" 
            : "bg-red-950/90 text-red-400 border-red-500/30"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
