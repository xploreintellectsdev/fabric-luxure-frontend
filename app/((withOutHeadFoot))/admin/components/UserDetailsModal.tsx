"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { UserAccount } from "../data/mockStore";

interface UserDetailsModalProps {
  user: UserAccount | null;
  onClose: () => void;
}

export default function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setLoginHistory([]);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const adminToken = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/users/${user.id}`, {
          headers: {
            "Authorization": `Bearer ${adminToken || ""}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAddresses(data.addresses || []);
          setLoginHistory(data.login_history || []);
        } else {
          console.error("Failed to load user details:", data.error);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in text-white">
      <div className="bg-[#102554] border border-[#081A42]/50 max-w-4xl w-full rounded-2xl overflow-hidden relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#D3D3D3]/60 hover:text-white cursor-pointer z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header Panel */}
        <div className="bg-[#081A42]/40 p-8 border-b border-[#081A42]/50 flex gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-[#102554] border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-bold text-[#D4AF37] shrink-0">
            {(() => {
              const name = user.name;
              if (!name || !name.trim()) return 'U';
              const parts = name.trim().split(/\s+/);
              if (parts.length === 1) return parts[0][0].toUpperCase();
              return (parts[0][0] + parts[1][0]).toUpperCase();
            })()}
          </div>
          <div className="text-left">
            <h3 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
              {user.name || "Unknown User"}
            </h3>
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono bg-emerald-500/10 text-emerald-300">
              {user.status} Member
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-[#D3D3D3]/50 font-mono text-[15px]">
              Loading details from server...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] text-left">
                <div>
                  <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Email Address</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div>
                  <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Phone Contact</span>
                  <span className="text-white">{user.phone}</span>
                </div>
                <div>
                  <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Signup Registered</span>
                  <span className="text-white">{user.signupDate}</span>
                </div>
                <div>
                  <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block">Last Active Session</span>
                  <span className="text-white">{user.lastLogin}</span>
                </div>
              </div>

              {/* Saved Address Table */}
              <div className="pt-4 border-t border-[#081A42]/40 text-left">
                <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block mb-3">Saved Addresses</span>
                
                {addresses.length === 0 ? (
                  <p className="bg-[#081A42] p-3 rounded-lg border border-[#102554]/30 text-[14px] text-[#D3D3D3]/50 italic">
                    No saved addresses found.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#102554]/30">
                    <table className="w-full text-left border-collapse min-w-[800px] text-[14px]">
                      <thead>
                        <tr className="bg-[#081A42]/40 border-b border-[#102554]/30">
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Recipient Name</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Mobile</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Alt Mobile</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">House / Building</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Street / Locality</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Landmark</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">City</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">State</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Country</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Postal Code</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider">Type</th>
                          <th className="p-3 text-[#D4AF37] font-mono uppercase tracking-wider text-center">Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#102554]/20 text-white">
                        {addresses.map((addr, idx) => (
                          <tr key={idx} className="hover:bg-[#081A42]/10 transition-colors">
                            <td className="p-3 font-semibold">{addr.full_name}</td>
                            <td className="p-3 font-mono">{addr.mobile}</td>
                            <td className="p-3 font-mono">{addr.alternate_mobile || "-"}</td>
                            <td className="p-3">{addr.house_building}</td>
                            <td className="p-3">{addr.street_locality}</td>
                            <td className="p-3">{addr.landmark || "-"}</td>
                            <td className="p-3">{addr.city}</td>
                            <td className="p-3">{addr.state}</td>
                            <td className="p-3">{addr.country}</td>
                            <td className="p-3 font-mono">{addr.postal_code}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-white/5 text-[#D3D3D3]">
                                {addr.address_type}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {addr.is_default ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[9px] uppercase font-bold border border-emerald-500/20">
                                  Default
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Login Timeline */}
              <div className="pt-4 border-t border-[#081A42]/40 text-left">
                <span className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono block mb-3">Login History Timeline</span>
                <div className="space-y-4 relative pl-4 border-l border-[#102554]">
                  {loginHistory.length === 0 ? (
                    <p className="text-[14px] text-[#D3D3D3]/50 italic">No login activity recorded.</p>
                  ) : (
                    loginHistory.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] absolute -left-[22px] top-1 border border-[#102554]" />
                        <p className="text-[14px] font-semibold text-white leading-none">
                          {evt.loginStatus === "SUCCESS" ? "Login successful" : "Failed login attempt"}
                        </p>
                        <p className="text-[10px] text-[#D3D3D3]/50 mt-1 font-mono">
                          {evt.loginTime ? new Date(evt.loginTime).toLocaleString() : "N/A"} | IP: {evt.ipAddress || "Unknown"} | {evt.deviceInfo || "Unknown Device"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-6 bg-[#081A42]/20 border-t border-[#081A42]/50 flex justify-end">
          <button
            onClick={onClose}
            className="border border-[#102554] px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white hover:bg-white/5 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
