"use client";

import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { ContactRequest } from "../contact-us/page";

interface ContactsTableProps {
  contacts: ContactRequest[];
  onView: (contact: ContactRequest) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

export default function ContactsTable({ contacts, onView, onDelete, onStatusChange }: ContactsTableProps) {
  const statusClass = (status: string) =>
    status === "Resolved"
      ? "bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/50"
      : status === "Closed"
      ? "bg-gray-500/10 text-gray-400 hover:border-gray-500/50"
      : "bg-amber-500/10 text-amber-300 hover:border-amber-500/50";

  return (
    <div className="text-white">
      {/* ═══════════════════════════════════════════════
          DESKTOP TABLE — hidden below lg (1024px)
      ═══════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#081A42]/50 bg-[#081A42]/20">
                <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Name</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Email</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Phone</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Date</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Status</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#D3D3D3]/50">
                    No contact requests found.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.contact_id} className="hover:bg-[#081A42]/10 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white">{c.name}</td>
                    <td className="p-4 break-all">{c.email}</td>
                    <td className="p-4">{c.phone_number}</td>
                    <td className="p-4 font-mono text-[14px]">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <select
                        value={c.status}
                        onChange={(e) => onStatusChange(c.contact_id, e.target.value)}
                        className={`px-2 py-1 rounded text-[10px] uppercase font-semibold font-mono border border-transparent outline-none cursor-pointer appearance-none ${statusClass(c.status)}`}
                      >
                        <option value="Pending" className="bg-[#102554] text-white">Pending</option>
                        <option value="Resolved" className="bg-[#102554] text-white">Resolved</option>
                        <option value="Closed" className="bg-[#102554] text-white">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onView(c)}
                          className="p-1.5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 rounded text-[#D4AF37] transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(c.contact_id)}
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

      {/* ═══════════════════════════════════════════════
          MOBILE / TABLET CARDS — visible below lg
      ═══════════════════════════════════════════════ */}
      <div className="lg:hidden space-y-3">
        {contacts.length === 0 ? (
          <div className="bg-[#102554] rounded-xl border border-[#081A42]/50 p-8 text-center text-[#D3D3D3]/50">
            No contact requests found.
          </div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.contact_id}
              className="bg-[#102554] rounded-xl border border-[#081A42]/50 p-4 space-y-3 shadow-sm"
            >
              {/* Name */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono mb-0.5">Name</p>
                <p className="text-white font-semibold text-[15px] break-words">{c.name}</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono mb-0.5">Email</p>
                <p
                  className="text-[#D3D3D3] text-[14px]"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                >
                  {c.email}
                </p>
              </div>

              {/* Phone + Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono mb-0.5">Phone</p>
                  <p className="text-[#D3D3D3] text-[14px]">{c.phone_number}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono mb-0.5">Date</p>
                  <p className="text-[#D3D3D3] text-[14px] font-mono">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-mono mb-0.5">Status</p>
                <select
                  value={c.status}
                  onChange={(e) => onStatusChange(c.contact_id, e.target.value)}
                  className={`px-3 py-2 rounded text-[12px] uppercase font-semibold font-mono border border-transparent outline-none cursor-pointer appearance-none min-h-[44px] ${statusClass(c.status)}`}
                >
                  <option value="Pending" className="bg-[#102554] text-white">Pending</option>
                  <option value="Resolved" className="bg-[#102554] text-white">Resolved</option>
                  <option value="Closed" className="bg-[#102554] text-white">Closed</option>
                </select>
              </div>

              {/* Divider */}
              <div className="border-t border-[#081A42]/40 pt-3 flex gap-3">
                {/* View button */}
                <button
                  onClick={() => onView(c)}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-[#D4AF37] rounded-lg text-[13px] font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  View
                </button>

                {/* Delete button */}
                <button
                  onClick={() => onDelete(c.contact_id)}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded-lg text-[13px] font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
