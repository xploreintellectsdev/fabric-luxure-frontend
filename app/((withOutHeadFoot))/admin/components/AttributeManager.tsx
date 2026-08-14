"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";

interface Attribute {
  id: number;
  name: string;
  is_active: number;
  color_code?: string;
}

interface AttributeManagerProps {
  type: "fabric-types" | "fabric-origins" | "styles" | "weaves" | "colors" | "patterns";
  title: string;
  description: string;
  hasColorCode?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AttributeManager({ type, title, description, hasColorCode }: AttributeManagerProps) {
  const [items, setItems] = useState<Attribute[]>([]);
  const [newName, setNewName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColorCode, setEditingColorCode] = useState("");
  const [deactivateMsg, setDeactivateMsg] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/attributes/${type}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        // Map the diverse ID/name fields to a standard format for UI
        const mapped = resData.data.map((item: any) => {
          let id, name, color_code;
          if (type === "fabric-types") { id = item.fabric_type_id; name = item.fabric_type_name; }
          else if (type === "fabric-origins") { id = item.origin_id; name = item.origin_name; }
          else if (type === "styles") { id = item.style_id; name = item.style_name; }
          else if (type === "weaves") { id = item.weave_id; name = item.weave_name; }
          else if (type === "colors") { id = item.color_id; name = item.color_name; color_code = item.color_code; }
          else if (type === "patterns") { id = item.pattern_id; name = item.pattern_name; }
          return { id, name, is_active: item.is_active, color_code };
        });
        setItems(mapped);
      } else {
        toast.error(resData.error || `Failed to load ${title}.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const payload: any = { name: newName.trim() };
      if (hasColorCode) payload.color_code = newColorCode;

      const res = await fetch(`${API_URL}/api/admin/attributes/${type}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(`${title} created successfully`);
        setNewName("");
        setNewColorCode("#000000");
        setIsAdding(false);
        fetchItems();
      } else {
        toast.error(resData.error || `Failed to create ${title}.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const handleStartEdit = (item: Attribute) => {
    setEditingId(item.id);
    setEditingName(item.name);
    if (hasColorCode) setEditingColorCode(item.color_code || "#000000");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) return;

    try {
      const payload: any = { name: editingName.trim() };
      if (hasColorCode) payload.color_code = editingColorCode;

      const res = await fetch(`${API_URL}/api/admin/attributes/${type}/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(`${title} updated successfully`);
        setEditingId(null);
        fetchItems();
      } else {
        toast.error(resData.error || `Failed to update ${title}.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (deleteTargetId === null) return;
    const id = deleteTargetId;
    try {
      const res = await fetch(`${API_URL}/api/admin/attributes/${type}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(`${title} deleted successfully`);
        fetchItems();
        setShowConfirmModal(false);
      } else if (res.status === 409 && resData.isUsed) {
        setShowConfirmModal(false);
        setDeactivateMsg(resData.error);
        setShowDeactivateModal(true);
      } else {
        toast.error(resData.error || `Failed to delete ${title}.`);
        setShowConfirmModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
      setShowConfirmModal(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const res = await fetch(`${API_URL}/api/admin/attributes/${type}/${id}/toggle`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({ is_active: newStatus }),
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(`Status updated successfully`);
        fetchItems();
        setShowDeactivateModal(false);
        setDeleteTargetId(null);
      } else {
        toast.error(resData.error || `Failed to update status.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full max-w-4xl mx-auto relative px-3.5 sm:px-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          .responsive-table tr {
            display: grid !important;
            grid-template-columns: ${hasColorCode ? "minmax(80px, 1fr) 72px 72px 64px" : "minmax(120px, 1fr) 78px 64px"} !important;
            align-items: center !important;
          }
          .responsive-table th, .responsive-table td {
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .responsive-table th.justify-center, .responsive-table td.justify-center {
            justify-content: center !important;
          }
        }
      `}} />
      {/* Page Header */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            {title}
          </h2>
          <p className="text-[12px] sm:text-[14px] text-[#D3D3D3]/80">{description}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? "Cancel" : "Add New"}
        </button>
      </div>

      {/* Add New Panel */}
      {isAdding && (
        <form onSubmit={handleAdd} className="shrink-0 mb-6 bg-[#102554] border border-[#081A42]/50 p-4 sm:p-6 rounded-xl shadow-md text-left flex flex-col sm:flex-row gap-4 items-stretch sm:items-end w-full">
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <label className="text-[12px] sm:text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`e.g. ${hasColorCode ? "Navy Blue" : "Example"}`}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-2.5 sm:p-3 text-[14px] sm:text-[15px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
              autoFocus
            />
          </div>
          {hasColorCode && (
            <div className="w-full sm:w-44 flex flex-col gap-2">
              <label className="text-[12px] sm:text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Color</label>
              <div className="flex items-center bg-[#081A42] border border-[#102554] rounded-lg overflow-hidden px-2 h-11 sm:h-12 w-full gap-2">
                <input
                  type="color"
                  required
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none outline-none bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  placeholder="#000000"
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white font-mono min-w-0 flex-1"
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-[13px] sm:text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white shrink-0 w-full sm:w-auto"
          >
            Save
          </button>
        </form>
      )}

      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#102554] rounded-xl border border-[#081A42]/50 shadow-sm min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse responsive-table">
            {hasColorCode ? (
              <colgroup>
                <col className="w-[35%] sm:w-[40%]" />
                <col className="w-[25%] sm:w-[25%]" />
                <col className="w-[20%] sm:w-[15%]" />
                <col className="w-[20%] sm:w-[20%]" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="w-[55%] sm:w-[60%]" />
                <col className="w-[20%] sm:w-[20%]" />
                <col className="w-[25%] sm:w-[20%]" />
              </colgroup>
            )}
            <thead className="sticky top-0 z-10 bg-[#081A42] border-b border-[#102554]">
              <tr>
                <th className="p-[12px_10px] pl-4 sm:p-4 sm:pl-6 text-[12px] sm:text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] break-words">Name</th>
                {hasColorCode && <th className="p-[12px_10px] sm:p-4 text-[12px] sm:text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] break-words">Color Code</th>}
                <th className="p-[12px_10px] sm:p-4 text-[12px] sm:text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center justify-center">Status</th>
                <th className="p-[12px_10px] sm:p-4 text-[12px] sm:text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center justify-center">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-[#081A42]/30 text-[14px] sm:text-[15px] text-[#D3D3D3]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={hasColorCode ? 4 : 3} className="p-8 text-center text-[#D3D3D3]/50">
                  No records found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={`transition-colors ${item.is_active ? "hover:bg-[#081A42]/10" : "bg-red-900/10 text-gray-500 hover:bg-red-900/20"}`}>
                  <td className={`p-[12px_10px] pl-4 sm:p-4 sm:pl-6 font-semibold ${item.is_active ? "text-white" : ""} break-words whitespace-normal`}>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-[#081A42] border border-[#D4AF37] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-[13px] sm:text-[15px] text-white focus:outline-none w-full"
                        autoFocus
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                        <span className="break-words leading-tight">{item.name}</span>
                        {!item.is_active && <span className="text-[9px] sm:text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Inactive</span>}
                      </div>
                    )}
                  </td>
                  {hasColorCode && (
                    <td className="p-[12px_10px] sm:p-4">
                      {editingId === item.id ? (
                        <div className="flex items-center bg-[#081A42] border border-[#D4AF37] rounded overflow-hidden pr-1 w-full max-w-[65px] sm:max-w-none">
                          <input
                            type="color"
                            value={editingColorCode}
                            onChange={(e) => setEditingColorCode(e.target.value)}
                            className="w-6 h-6 p-0.5 bg-transparent cursor-pointer border-none outline-none shrink-0"
                          />
                          <span className="text-[10px] font-mono shrink-0">{editingColorCode}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: item.color_code }} />
                          <span className="text-[11px] sm:text-sm font-mono opacity-75">{item.color_code}</span>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="p-[12px_10px] sm:p-4 text-center justify-center">
                    <button
                      onClick={() => handleToggleStatus(item.id, item.is_active)}
                      className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-colors w-full ${
                        item.is_active ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                      title={item.is_active ? "Click to Deactivate" : "Click to Activate"}
                    >
                      {item.is_active ? <Power size={9} className="shrink-0" /> : <PowerOff size={9} className="shrink-0" />}
                      <span className="truncate">{item.is_active ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="p-[12px_10px] sm:p-4 justify-center">
                    <div className="flex items-center justify-center gap-[10px] w-full">
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(item.id)} className="p-1 text-green-400 hover:bg-green-400/10 rounded transition-colors shrink-0" title="Save">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors shrink-0" title="Cancel">
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEdit(item)} className="p-1 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors shrink-0" title="Edit">
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(item.id, item.name)} className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors shrink-0" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-[#102554] border border-[#081A42]/50 p-5 sm:p-8 rounded-xl shadow-2xl w-[90%] max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-wider">Confirm Deletion</h3>
            </div>
            <p className="text-[#D3D3D3] mb-6 sm:mb-8 text-[14px] sm:text-[15px] leading-relaxed">
              Deleting this record will not remove any existing products that reference it. It will simply be hidden from future selections.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowConfirmModal(false); setDeleteTargetId(null); setDeleteTargetName(""); }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded border border-[#D3D3D3]/20 text-[#D3D3D3] hover:bg-white/5 transition-colors text-[13px] sm:text-[14px] uppercase tracking-wider font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors text-[13px] sm:text-[14px] uppercase tracking-wider font-semibold shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Prompt Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/50 p-5 sm:p-8 rounded-xl shadow-2xl w-[90%] max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-[#D4AF37] mb-4">
              <PowerOff className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-wider">Cannot Delete</h3>
            </div>
            <p className="text-[#D3D3D3] mb-6 sm:mb-8 text-[14px] sm:text-[15px] leading-relaxed">
              {deactivateMsg}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeactivateModal(false); setDeleteTargetId(null); setDeleteTargetName(""); }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded border border-[#D3D3D3]/20 text-[#D3D3D3] hover:bg-white/5 transition-colors text-[13px] sm:text-[14px] uppercase tracking-wider font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleStatus(deleteTargetId!, 1)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded bg-[#D4AF37] hover:bg-[#B9952E] text-white transition-colors text-[13px] sm:text-[14px] uppercase tracking-wider font-semibold shadow-lg shadow-[#D4AF37]/20"
              >
                Deactivate Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
