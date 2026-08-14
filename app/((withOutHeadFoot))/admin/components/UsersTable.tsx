"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Search } from "lucide-react";
import { UserAccount } from "../data/mockStore";
import Pagination from "./Pagination";

interface UsersTableProps {
  users: UserAccount[];
  onViewDetails: (user: UserAccount) => void;
}

export default function UsersTable({ users, onViewDetails }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get("search") || "");
  
  // Pagination State — initialize from URL
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams?.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const itemsPerPage = 20;

  // Sync search + page to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());
    const qs = params.toString();
    router.replace(`/admin/users${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchQuery, currentPage]);

  const filteredUsers = users.filter((u) => {
    return (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (u.phone || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#081A42] rounded-xl border border-[#102554] shadow-2xl relative overflow-hidden">
      {/* Controls Header */}
      <div className="shrink-0 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#102554] bg-[#0A1D4A]">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#081A42] border border-[#102554] rounded-lg py-2 pl-10 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-[#102554] border-t border-[#081A42]/50 text-white min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#081A42] z-10 shadow-sm border-b border-[#102554]">
              <tr>
                <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">User</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Email</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Phone</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Signup Date</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Last Login</th>
                <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
              </tr>
            </thead>
        <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-[#D3D3D3]/50">
                No users registered.
              </td>
            </tr>
          ) : (
            currentItems.map((u) => (
              <tr key={u.id} className="hover:bg-[#081A42]/10 transition-colors">
                <td className="p-4 pl-6 font-semibold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#081A42] border border-[#D4AF37] flex items-center justify-center font-bold text-[14px] text-[#D4AF37]">
                    {(() => {
                      const name = u.name;
                      if (!name || !name.trim()) return 'U';
                      const parts = name.trim().split(/\s+/);
                      if (parts.length === 1) return parts[0][0].toUpperCase();
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    })()}
                  </div>
                  {u.name || "Unknown User"}
                </td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.phone}</td>
                <td className="p-4 font-mono text-[14px]">{u.signupDate}</td>
                <td className="p-4 font-mono text-[14px]">{u.lastLogin}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onViewDetails(u)}
                    className="flex items-center gap-1 bg-[#081A42] hover:bg-[#081A42]/80 border border-[#102554]/30 text-[14px] px-3 py-1.5 rounded-full font-semibold transition-colors mx-auto cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
