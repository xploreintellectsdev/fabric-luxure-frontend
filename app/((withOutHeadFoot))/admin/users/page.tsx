"use client";

import React, { useState, useEffect } from "react";
import { UserAccount } from "../data/mockStore";
import UsersTable from "../components/UsersTable";
import UserDetailsModal from "../components/UserDetailsModal";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const [users, setLocalUsers] = useState<UserAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          "Authorization": `Bearer ${adminToken || ""}`
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const formattedUsers = resData.data.map((u: any) => ({
          id: String(u.userId),
          name: u.name || "Unknown User",
          email: u.email,
          phone: u.mobile,
          signupDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never",
          status: u.isActive === 1 || u.isActive === true ? "Active" : "Inactive",
          address: "No saved address registered."
        }));
        setLocalUsers(formattedUsers);
      } else {
        toast.error(resData.error || "Failed to load registered shoppers.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend server.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full">
      <div className="shrink-0 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
          User Accounts
        </h2>
        <p className="text-[14px] text-[#D3D3D3]/80">List of all registered shoppers on our e-mart site.</p>
      </div>

      <UsersTable users={users} onViewDetails={setSelectedUser} />

      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
