"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "../components/AdminContext";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ShieldCheck, Loader2, X, AlertTriangle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

export default function AdministratorsPage() {
  const { admin } = useAdmin();
  const router = useRouter();
  
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", current_password: "", confirm_password: "", role: "ADMIN", is_active: 1 });
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (admin && admin.role === "ADMIN") {
      toast.error("You are not authorized to access this page.");
      router.push("/admin");
    } else if (admin && admin.role === "SUPERADMIN") {
      fetchAdmins();
    }
  }, [admin, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/administrators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.data || []);
      } else {
        toast.error("Failed to load administrators.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error fetching administrators.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/administrators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Administrator created successfully.");
        setIsAddModalOpen(false);
        setFormData({ full_name: "", email: "", password: "", current_password: "", confirm_password: "", role: "ADMIN", is_active: 1 });
        fetchAdmins();
      } else {
        toast.error(data.error || "Failed to create administrator.");
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.current_password) {
      toast.error("Current password is required to send OTP.");
      return;
    }
    if (!formData.password || formData.password !== formData.confirm_password) {
      toast.error("New passwords must be provided and match.");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("admin_token");
      
      const otpRes = await fetch(`${API_URL}/api/admin/administrators/password/verify-current`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: formData.current_password })
      });
      const otpData = await otpRes.json();
      
      if (otpRes.ok) {
        toast.success(otpData.message);
        setMaskedEmail(otpData.maskedEmail || "");
        setIsOtpModalOpen(true);
        setResendTimer(60);
      } else {
        toast.error(otpData.error || "Failed to verify current password.");
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    const isSelf = selectedAdmin.id === admin?.id;
    if (isSelf && formData.password && !isOtpVerified) {
      toast.error("You must verify your email with OTP before saving.");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("admin_token");
      
      const res = await fetch(`${API_URL}/api/admin/administrators/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: formData.full_name, email: formData.email, is_active: formData.is_active, password: formData.password })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Administrator updated successfully.");
        setIsEditModalOpen(false);
        fetchAdmins();
        
        if (isSelf && formData.password) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
        }
      } else {
        toast.error(data.error || "Failed to update administrator.");
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem("admin_token");
      
      const res = await fetch(`${API_URL}/api/admin/administrators/password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP verified successfully.");
        setIsOtpVerified(true);
        setIsOtpModalOpen(false);
      } else {
        toast.error(data.error || "Invalid OTP.");
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/administrators/${selectedAdmin.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Administrator deleted successfully.");
        setIsDeleteModalOpen(false);
        fetchAdmins();
      } else {
        toast.error(data.error || "Failed to delete administrator.");
      }
    } catch (err) {
      toast.error("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (adminRecord: any) => {
    setSelectedAdmin(adminRecord);
    setFormData({
      full_name: adminRecord.full_name,
      email: adminRecord.email,
      password: "",
      current_password: "",
      confirm_password: "",
      role: adminRecord.role,
      is_active: adminRecord.is_active
    });
    setIsOtpVerified(false);
    setMaskedEmail("");
    setResendTimer(0);
    setOtp("");
    setIsEditModalOpen(true);
  };

  const openDelete = (adminRecord: any) => {
    setSelectedAdmin(adminRecord);
    setIsDeleteModalOpen(true);
  };

  if (!admin || admin.role !== "SUPERADMIN") return null;

  return (
    <div className="p-4 md:p-8 animate-fade-in w-full text-white max-w-[2000px] mx-auto min-h-screen relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-8 border-b border-white/10 pb-6 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#D4AF37] uppercase tracking-wider mb-2 break-words">
            Administrator Accounts
          </h1>
          <p className="text-Pinball/70 text-[12px] md:text-base">
            Manage admin access, roles, and security policies.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ full_name: "", email: "", password: "", current_password: "", confirm_password: "", role: "ADMIN", is_active: 1 });
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A1128] font-bold py-2.5 px-4 md:py-3 md:px-6 rounded-lg transition-all text-xs md:text-base self-start sm:self-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add New Admin
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-[#D4AF37]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block bg-[#111A3A] rounded-xl border border-white/5 overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-[#0A1128] text-[#D4AF37] text-xs font-mono uppercase tracking-widest border-b border-white/10">
                    <th className="py-5 px-6 font-semibold w-24">ID</th>
                    <th className="py-5 px-6 font-semibold">Administrator</th>
                    <th className="py-5 px-6 font-semibold">Role</th>
                    <th className="py-5 px-6 font-semibold">Status</th>
                    <th className="py-5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-sans divide-y divide-white/5">
                  {admins.map((adminRecord) => (
                    <tr key={adminRecord.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-5 px-6 text-white/50 font-mono">#{adminRecord.id}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-white/10 bg-[#0A1128] flex items-center justify-center font-bold text-[#D4AF37] uppercase">
                            {adminRecord.full_name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{adminRecord.full_name}</p>
                            <p className="text-white/50 text-xs mt-0.5">{adminRecord.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
                          adminRecord.role === "SUPERADMIN" 
                            ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20" 
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {adminRecord.role}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`flex items-center gap-2 ${adminRecord.is_active ? "text-green-400" : "text-red-400"}`}>
                          <span className={`w-2 h-2 rounded-full ${adminRecord.is_active ? "bg-green-400" : "bg-red-400"}`}></span>
                          {adminRecord.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(adminRecord)}
                            className="p-2 bg-[#0A1128] text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {adminRecord.role !== "SUPERADMIN" && adminRecord.id !== admin.id && (
                            <button
                              onClick={() => openDelete(adminRecord)}
                              className="p-2 bg-[#0A1128] text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (visible on mobile, hidden on desktop) */}
          <div className="md:hidden space-y-4 w-full">
            {admins.map((adminRecord) => (
              <div key={adminRecord.id} className="bg-[#111A3A] rounded-xl border border-white/5 p-4 flex flex-col gap-3.5 min-w-0">
                {/* Top segment: ID, Avatar, Name & Email */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-[9px] font-mono text-white/40 mt-1 shrink-0">#{adminRecord.id}</span>
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-[#0A1128] flex items-center justify-center font-bold text-[12px] text-[#D4AF37] uppercase shrink-0">
                    {adminRecord.full_name.substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-[13px] font-semibold text-white break-words">{adminRecord.full_name}</h3>
                    <p className="text-[10px] text-white/50 mt-0.5 break-all">{adminRecord.email}</p>
                  </div>
                </div>

                {/* Middle segment: Role & Status badges */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-white/40">Role:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                      adminRecord.role === "SUPERADMIN" 
                        ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20" 
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {adminRecord.role}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] ${adminRecord.is_active ? "text-green-400" : "text-red-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${adminRecord.is_active ? "bg-green-400" : "bg-red-400"}`}></span>
                    {adminRecord.is_active ? "Active" : "Disabled"}
                  </span>
                </div>

                {/* Bottom Actions segment (ALWAYS visible) */}
                <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                  <button
                    onClick={() => openEdit(adminRecord)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1128] text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {adminRecord.role !== "SUPERADMIN" && adminRecord.id !== admin.id && (
                    <button
                      onClick={() => openDelete(adminRecord)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1128] text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111A3A] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0A1128] px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-[#D4AF37] font-serif text-xl tracking-wider uppercase">Add Administrator</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="flex flex-col max-h-[85vh]">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-[#0A1128] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#0A1128] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Role</label>
                <select
                  disabled
                  value="ADMIN"
                  className="w-full bg-[#0A1128]/50 border border-white/5 rounded-lg px-4 py-2.5 text-white/50 cursor-not-allowed appearance-none"
                >
                  <option value="ADMIN">ADMIN</option>
                </select>
                <p className="text-[10px] text-white/40 mt-1">Only ADMIN role can be created.</p>
              </div>
              </div>
              <div className="p-6 pt-4 border-t border-white/10 flex justify-end gap-3 bg-[#111A3A] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-sm font-semibold tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A1128] font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111A3A] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0A1128] px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-[#D4AF37] font-serif text-xl tracking-wider uppercase">Edit Administrator</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col max-h-[85vh]">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Status</label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Role</label>
                <input
                  type="text"
                  disabled
                  value={formData.role}
                  className="w-full bg-[#0A1128]/50 border border-white/5 rounded-lg px-4 py-2.5 text-white/50 cursor-not-allowed uppercase"
                />
                <p className="text-[10px] text-white/40 mt-1">Role cannot be changed.</p>
              </div>

              {/* Password Fields */}
              <div className="pt-2 border-t border-white/10 mt-4">
                <h3 className="text-[#D4AF37] font-serif text-sm tracking-wider uppercase mb-3">Change Password (Optional)</h3>
                
                {selectedAdmin?.id === admin?.id && (
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.current_password}
                        onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                        className="w-full bg-[#0A1128] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="Required to change your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-[#0A1128] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="Leave blank to keep unchanged"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        className="w-full bg-[#0A1128] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Verification Section for Self */}
                {selectedAdmin?.id === admin?.id && formData.password && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h3 className="text-[#D4AF37] font-serif text-sm tracking-wider uppercase mb-3">Email Verification</h3>
                    <div className="bg-[#0A1128] border border-white/10 rounded-lg p-4 flex flex-col items-center text-center">
                      {!isOtpVerified ? (
                        <>
                          <div className="flex items-center gap-2 text-red-400 font-semibold mb-3">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            Not Verified
                          </div>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={submitting}
                            className="px-6 py-2 rounded border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-sm font-semibold tracking-wide disabled:opacity-50"
                          >
                            Verify Identity
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Verified Successfully
                          </div>
                          <p className="text-[10px] text-white/40">Verified just now</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              </div>

              <div className="p-6 pt-4 border-t border-white/10 flex justify-end gap-3 bg-[#111A3A] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-sm font-semibold tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (selectedAdmin?.id === admin?.id && formData.password !== "" && !isOtpVerified)}
                  className="px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A1128] font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#111A3A] border border-white/10 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Email Verification</h2>
            <p className="text-white/60 text-sm mb-6">
              A verification code has been sent to your registered email.<br />
              <strong className="text-white mt-1 block">{maskedEmail}</strong>
            </p>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] font-mono text-2xl bg-[#0A1128] border border-white/10 rounded-lg px-4 py-3 text-[#D4AF37] focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="------"
              />
              <div className="flex flex-col gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting || otp.length !== 6}
                  className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A1128] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Verify OTP
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={submitting || resendTimer > 0}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpModalOpen(false);
                      setOtp("");
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111A3A] border border-white/10 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden text-center p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Administrator?</h2>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{selectedAdmin?.full_name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
