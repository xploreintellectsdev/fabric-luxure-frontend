"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import ContactsTable from "../components/ContactsTable";

export interface ContactRequest {
  contact_id: number;
  name: string;
  email: string;
  phone_number: string;
  message: string;
  createdAt: string;
  status: string;
}

export default function AdminContactUsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;
  
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<number | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/contacts?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.data.contacts);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDeleteConfirm = async () => {
    if (!deleteContactId) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/contacts/${deleteContactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
    } finally {
      setDeleteContactId(null);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/contacts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchContacts();
        if (selectedContact && selectedContact.contact_id === id) {
           setSelectedContact(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in text-white w-full min-h-screen h-auto overflow-x-hidden">
      <div className="bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            Contact Requests
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#D3D3D3]/80 mt-1">Enquiries sent by guests and registered customers on our /contact page.</p>
        </div>
        <div className="relative w-full lg:w-72 min-w-0">
          <input
            type="text"
            placeholder="Search by Name, Email, Phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full min-w-0 bg-[#081A42] border border-[#102554] rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#D3D3D3]/50 outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#D3D3D3]/50" />
        </div>
      </div>

      <ContactsTable 
        contacts={contacts} 
        onView={setSelectedContact} 
        onDelete={(id) => setDeleteContactId(id)} 
        onStatusChange={handleStatusChange} 
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 bg-[#102554] rounded-full hover:bg-bg-blue disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono text-[#D4AF37]">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 bg-[#102554] rounded-full hover:bg-bg-blue disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Details View Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in text-white">
          <div className="bg-[#102554] border border-[#081A42]/50 max-w-lg w-full rounded-2xl p-8 relative shadow-2xl">
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-5 right-5 text-[#D3D3D3]/60 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white mb-2 text-left">
              Contact Enquiry
            </h3>
            <p className="text-[14px] text-[#D3D3D3]/60 mb-6 font-mono text-left">
              ID: {selectedContact.contact_id} | Date: {new Date(selectedContact.createdAt).toLocaleDateString()}
            </p>

            <div className="space-y-4 text-[15px] text-[#D3D3D3] text-left">
              <div>
                <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">From</span>
                <span className="font-semibold text-white">{selectedContact.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Email</span>
                  <span>{selectedContact.email}</span>
                </div>
                <div>
                  <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Phone</span>
                  <span>{selectedContact.phone_number}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#081A42]/40">
                <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block mb-1">Message</span>
                <p className="bg-[#081A42] p-4 rounded-lg border border-[#102554]/30 leading-relaxed text-[14px]">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <select 
                value={selectedContact.status} 
                onChange={(e) => handleStatusChange(selectedContact.contact_id, e.target.value)}
                className="bg-[#081A42] border border-[#102554] text-white text-sm rounded-lg px-4 py-2 outline-none cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                onClick={() => setSelectedContact(null)}
                className="border border-[#102554] px-6 py-2.5 rounded-lg text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteContactId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in text-white">
          <div className="bg-[#102554] border border-[#081A42]/50 max-w-sm w-full rounded-2xl p-8 relative shadow-2xl text-center">
            <h3 className="font-instrumentserif text-3xl font-normal tracking-wider text-white mb-2">
              Delete Contact Request?
            </h3>
            <p className="text-[15px] text-[#D3D3D3]/80 mb-8">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteContactId(null)}
                className="border border-[#102554] px-6 py-2.5 rounded-lg text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-lg text-[14px] uppercase tracking-wider font-semibold cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
