"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Search, X } from "lucide-react";
import toast from "react-hot-toast";

interface FAQ {
  faq_id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | string>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toggleTargetId, setToggleTargetId] = useState<number | null>(null);
  const [toggleTargetStatus, setToggleTargetStatus] = useState<number>(1);

  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/faqs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFaqs(data.data);
        setTotal(data.total);
      } else {
        toast.error(data.error || "Failed to load FAQs.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFaqs();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const openDrawer = (faq?: FAQ) => {
    if (faq) {
      setEditingId(faq.faq_id);
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setDisplayOrder(faq.display_order);
      setIsActive(faq.is_active === 1);
    } else {
      setEditingId(null);
      setQuestion("");
      setAnswer("");
      setDisplayOrder(1);
      setIsActive(true);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and Answer are required.");
      return;
    }
    
    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      display_order: Number(displayOrder) || 1,
      is_active: isActive ? 1 : 0
    };

    try {
      const url = editingId ? `${API_URL}/api/admin/faqs/${editingId}` : `${API_URL}/api/admin/faqs`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`FAQ ${editingId ? "updated" : "created"} successfully`);
        closeDrawer();
        fetchFaqs();
      } else {
        toast.error(data.error || "Failed to save FAQ.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const handleToggleClick = (id: number, currentStatus: number) => {
    setToggleTargetId(id);
    setToggleTargetStatus(currentStatus === 1 ? 0 : 1);
    setShowConfirmModal(true);
  };

  const executeToggleStatus = async () => {
    if (!toggleTargetId) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/faqs/${toggleTargetId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({ is_active: toggleTargetStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`FAQ ${toggleTargetStatus === 1 ? "enabled" : "disabled"} successfully`);
        fetchFaqs();
      } else {
        toast.error(data.error || "Failed to update status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    } finally {
      setShowConfirmModal(false);
      setToggleTargetId(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full relative">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
            FAQs
          </h2>
          <p className="text-[14px] text-[#D3D3D3]/80">Manage Frequently Asked Questions for the website.</p>
        </div>
        <button
          onClick={() => openDrawer()}
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Search and Table */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#102554] border border-[#081A42]/50 rounded-xl shadow-md p-6">
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D3D3D3]/50" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg pl-10 pr-4 py-2 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] placeholder-[#D3D3D3]/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#081A42]/50 bg-[#081A42]/20">
                <th className="p-4 text-[13px] uppercase font-mono tracking-wider text-[#D4AF37]">FAQ ID</th>
                <th className="p-4 text-[13px] uppercase font-mono tracking-wider text-[#D4AF37]">Question</th>
                <th className="p-4 text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] max-w-xs">Answer</th>
                <th className="p-4 text-[13px] uppercase font-mono tracking-wider text-[#D4AF37]">Order</th>
                <th className="p-4 text-[13px] uppercase font-mono tracking-wider text-[#D4AF37]">Status</th>
                <th className="p-4 text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#081A42]/30 text-[14px] text-[#D3D3D3]">
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#D3D3D3]/50">No FAQs found.</td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.faq_id} className="hover:bg-[#081A42]/10 transition-colors group">
                    <td className="p-4 font-mono">#{faq.faq_id}</td>
                    <td className="p-4 text-white font-medium">{faq.question}</td>
                    <td className="p-4 max-w-xs truncate" title={faq.answer}>{faq.answer}</td>
                    <td className="p-4">{faq.display_order}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleClick(faq.faq_id, faq.is_active)}
                          className={`w-10 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${faq.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${faq.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-[12px] font-semibold ${faq.is_active ? 'text-green-400' : 'text-red-400'}`}>
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openDrawer(faq)}
                        className="p-1.5 border border-bg-blue/20 hover:border-bg-blue/50 hover:bg-bg-blue/10 rounded text-bg-blue transition-all cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-[#081A42]/50 flex justify-between items-center text-[14px]">
            <div className="text-[#D3D3D3]/60">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-[#081A42] border border-[#102554] rounded hover:border-[#D4AF37]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-[#081A42] border border-[#102554] rounded hover:border-[#D4AF37]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-[#102554] h-full shadow-2xl flex flex-col border-l border-[#081A42] animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-[#081A42]/50">
              <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37]">
                {editingId ? "Edit FAQ" : "Add FAQ"}
              </h3>
              <button onClick={closeDrawer} className="text-[#D3D3D3]/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <form id="faq-form" onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] uppercase tracking-wider text-[#D4AF37] font-mono">Question *</label>
                  <textarea
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] min-h-[80px]"
                    placeholder="Enter the FAQ question"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] uppercase tracking-wider text-[#D4AF37] font-mono">Answer *</label>
                  <textarea
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] min-h-[150px]"
                    placeholder="Enter the FAQ answer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] uppercase tracking-wider text-[#D4AF37] font-mono">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[14px] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-[#081A42]/50">
                  <span className="text-[13px] uppercase tracking-wider text-[#D4AF37] font-mono">Status</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-[14px] font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-[#081A42]/50 flex justify-end gap-4 bg-[#102554]/95">
              <button
                type="button"
                onClick={closeDrawer}
                className="px-6 py-2.5 rounded-full text-[14px] font-semibold tracking-wider uppercase border border-[#D3D3D3]/20 hover:bg-[#D3D3D3]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="faq-form"
                className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowConfirmModal(false)} />
          <div className="bg-[#102554] border border-[#081A42]/50 rounded-xl shadow-2xl w-full max-w-sm relative z-10 animate-fade-in text-center p-6">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37] mb-2">Confirm Action</h3>
            <p className="text-[#D3D3D3] mb-6">
              Are you sure you want to {toggleTargetStatus === 1 ? "enable" : "disable"} this FAQ?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2 rounded border border-[#D3D3D3]/20 hover:bg-[#D3D3D3]/10 transition-colors text-[14px]"
              >
                Cancel
              </button>
              <button
                onClick={executeToggleStatus}
                className="px-5 py-2 rounded bg-bg-blue hover:bg-bg-blue/80 text-white font-medium text-[14px]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
