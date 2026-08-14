"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Check, X, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";

interface ProductType {
  pro_type_id: number;
  product_type: string;
}

interface FitStyle {
  fit_style_id: number;
  pro_type_id: number;
  product_type_name?: string;
  fit_style_name: string;
  display_order: number;
  is_active: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminFitStylesPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [fitStyles, setFitStyles] = useState<FitStyle[]>([]);

  // Add/Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    pro_type_id: "",
    fit_style_name: "",
    display_order: "0",
    is_active: true
  });

  // Toggle State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [deactivateMsg, setDeactivateMsg] = useState("");
  const [deactivateAction, setDeactivateAction] = useState<number>(0); // 0 or 1

  const fetchProductTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/product-types`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setProductTypes(resData.data);
      }
    } catch (err) {
      console.error("Error fetching product types", err);
    }
  };

  const fetchFitStyles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/fit-styles`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setFitStyles(resData.fitStyles);
      } else {
        toast.error(resData.message || "Failed to load fit styles.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  useEffect(() => {
    fetchProductTypes();
    fetchFitStyles();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ pro_type_id: "", fit_style_name: "", display_order: "0", is_active: true });
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: FitStyle) => {
    setFormData({
      pro_type_id: item.pro_type_id.toString(),
      fit_style_name: item.fit_style_name,
      display_order: item.display_order.toString(),
      is_active: item.is_active === 1
    });
    setIsEditing(true);
    setEditId(item.fit_style_id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pro_type_id || !formData.fit_style_name.trim()) {
      toast.error("Product Type and Fit Style Name are required");
      return;
    }

    try {
      const payload = {
        pro_type_id: Number(formData.pro_type_id),
        fit_style_name: formData.fit_style_name.trim(),
        display_order: Number(formData.display_order),
        is_active: formData.is_active ? 1 : 0
      };

      const url = isEditing 
        ? `${API_URL}/api/admin/fit-styles/${editId}`
        : `${API_URL}/api/admin/fit-styles`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success(resData.message || `Fit Style ${isEditing ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        fetchFitStyles();
      } else {
        toast.error(resData.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const promptToggleStatus = (id: number, currentStatus: number, name: string) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    setDeactivateId(id);
    setDeactivateAction(newStatus);
    setDeactivateMsg(`Are you sure you want to ${newStatus === 1 ? 'activate' : 'deactivate'} Fit Style '${name}'?`);
    setShowDeactivateModal(true);
  };

  const executeToggleStatus = async () => {
    if (!deactivateId) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/fit-styles/${deactivateId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: deactivateAction })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Status updated successfully");
        fetchFitStyles();
      } else {
        toast.error(resData.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error");
    } finally {
      setShowDeactivateModal(false);
      setDeactivateId(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full px-3.5 sm:px-6">
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            Fit Styles
          </h2>
          <p className="text-xs sm:text-[14px] text-[#D3D3D3]/80">Manage product fit styles mapping to specific product types.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Fit Style
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden">
        <div className="flex-1 overflow-auto w-full">
          <table className="w-full min-w-[650px] lg:min-w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#081A42]">
              <tr className="bg-[#081A42]/80 border-b border-[#081A42]/50">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 w-16 text-center">ID</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60">Product Type</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60">Fit Style Name</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 text-center">Display Order</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 text-center">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fitStyles.map((item) => (
                <tr key={item.fit_style_id} className="border-b border-[#081A42]/30 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 text-sm text-[#D3D3D3]/50 text-center font-mono">{item.fit_style_id}</td>
                  <td className="py-4 px-6 text-[15px] font-medium text-white">{item.product_type_name || "N/A"}</td>
                  <td className="py-4 px-6 text-[15px] font-medium text-white">{item.fit_style_name}</td>
                  <td className="py-4 px-6 text-[15px] font-medium text-white text-center">{item.display_order}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      item.is_active === 1 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptToggleStatus(item.fit_style_id, item.is_active, item.fit_style_name)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          item.is_active === 1 
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" 
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                        }`}
                        title={item.is_active === 1 ? "Deactivate" : "Activate"}
                      >
                        {item.is_active === 1 ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {fitStyles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#D3D3D3]/50 text-sm">
                    No fit styles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#102554] border border-[#081A42] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-[#0c1b40]">
              <h3 className="font-instrumentserif text-2xl tracking-wider text-white">
                {isEditing ? "Edit Fit Style" : "Add Fit Style"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto grow">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/70 block">
                  Product Type
                </label>
                <select
                  value={formData.pro_type_id}
                  onChange={(e) => setFormData({ ...formData, pro_type_id: e.target.value })}
                  className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg p-3 text-[14px] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all outline-none"
                  required
                >
                  <option value="" disabled>Select Product Type</option>
                  {productTypes.map((pt) => (
                    <option key={pt.pro_type_id} value={pt.pro_type_id}>
                      {pt.product_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/70 block">
                  Fit Style Name
                </label>
                <input
                  type="text"
                  value={formData.fit_style_name}
                  onChange={(e) => setFormData({ ...formData, fit_style_name: e.target.value })}
                  placeholder="e.g. Classic, Slim, Regular"
                  className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all outline-none placeholder:text-white/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/70 block">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  className="w-full bg-[#081A42]/50 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-[13px] font-semibold text-[#D3D3D3]">Status: {formData.is_active ? 'Active' : 'Inactive'}</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-[13px] font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition-colors border border-[#102554] text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
              Confirm Action
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">
              {deactivateMsg}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivateId(null);
                }}
                className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeToggleStatus}
                className={`${deactivateAction === 1 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors cursor-pointer`}
              >
                {deactivateAction === 1 ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
