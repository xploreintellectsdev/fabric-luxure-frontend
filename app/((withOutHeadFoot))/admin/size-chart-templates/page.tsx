"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import SizeChartModal, { SizeChartTemplate } from "../components/SizeChartModal";
import { getActivities, setActivities } from "../data/mockStore";
import { confirmAction, showAlert } from '../../../../utils/modalUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SizeChartTemplatesPage() {
  const [templates, setTemplates] = useState<SizeChartTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SizeChartTemplate | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/size-chart-templates`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates(data.data || []);
      } else {
        toast.error(data.error || "Failed to load templates.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (formData: FormData) => {
    try {
      const isEdit = selectedTemplate !== null;
      const url = isEdit
        ? `${API_URL}/api/admin/size-chart-templates/${selectedTemplate?.template_id}`
        : `${API_URL}/api/admin/size-chart-templates`;
      
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Template ${isEdit ? "updated" : "created"} successfully`
        );
        setIsModalOpen(false);
        fetchTemplates();

        // Log admin activity
        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `${isEdit ? "Updated" : "Created"} size chart template '${formData.get("template_name")}'`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
      } else {
        toast.error(data.error || "Failed to save template.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const handleDeleteTrigger = async (id: number, name: string) => {
    const confirmed = await confirmAction(
      "Delete?",
      "Deleting this record will not remove any existing products that reference it. It will simply be hidden from future selections.",
      "Delete"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/size-chart-templates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Template deleted successfully");
        fetchTemplates();

        // Log admin activity
        const act = getActivities();
        const updatedAct = [
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `Deleted size chart template '${name}'`,
            time: "Just now",
          },
          ...act,
        ];
        setActivities(updatedAct);
      } else {
        toast.error(data.error || "Failed to delete template.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const toggleStatus = async (tpl: SizeChartTemplate) => {
    try {
      const fd = new FormData();
      fd.append("pro_type_id", String(tpl.pro_type_id));
      fd.append("template_name", tpl.template_name);
      fd.append("is_active", String(!tpl.is_active));

      const res = await fetch(`${API_URL}/api/admin/size-chart-templates/${tpl.template_id}`, {
        method: "PUT",
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Template ${!tpl.is_active ? "enabled" : "disabled"} successfully`);
        fetchTemplates();
      } else {
        toast.error(data.error || "Failed to update template status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return "/images/home/cat-01.webp";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full px-3.5 sm:px-6">
      {/* Title Header Card */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            Size Chart Templates
          </h2>
          <p className="text-xs sm:text-[14px] text-[#D3D3D3]/80">Manage static size chart layout images linked to product types.</p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      {/* Templates List Table */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden shadow-sm text-white">
        <div className="flex-1 overflow-auto w-full">
          <table className="w-full min-w-[700px] lg:min-w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#081A42]">
              <tr className="border-b border-[#081A42]/50">
              <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] w-12">#</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] w-24">Image Preview</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Template Name</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Product Type</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] w-24">Status</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Created Date</th>
              <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#D3D3D3]/50 italic">
                  Loading templates...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#D3D3D3]/50">
                  No templates found.
                </td>
              </tr>
            ) : (
              templates.map((tpl, index) => (
                <tr key={tpl.template_id} className="hover:bg-[#081A42]/10 transition-colors">
                  <td className="p-4 pl-6 font-mono text-[14px]">{index + 1}</td>
                  <td className="p-4">
                    <div className="w-20 h-20 bg-[#081A42] border border-[#102554] rounded-md overflow-hidden relative flex items-center justify-center">
                      <img
                        src={getImageUrl(tpl.image_path)}
                        alt={tpl.template_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-white">{tpl.template_name}</td>
                  <td className="p-4">
                    <span className="bg-[#081A42] px-2.5 py-1 rounded text-[14px] border border-[#102554] text-white">
                      {tpl.product_type || "Shirt"}
                    </span>
                  </td>
                  <td className="p-4">
                    {tpl.is_active ? (
                      <span className="text-emerald-400 text-[14px] font-semibold flex items-center gap-1 select-none">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    ) : (
                      <span className="text-red-400 text-[14px] font-semibold flex items-center gap-1 select-none">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[14px] font-mono">
                    {tpl.created_at ? new Date(tpl.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(tpl)}
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer border ${
                          tpl.is_active
                            ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                            : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                        title={tpl.is_active ? "Disable" : "Enable"}
                      >
                        {tpl.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate(tpl);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded text-yellow-400 transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (tpl.template_id) handleDeleteTrigger(tpl.template_id, tpl.template_name);
                        }}
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

      {/* Dynamic Add/Edit Modal */}
      <SizeChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedTemplate}
      />
    </div>
  );
}
