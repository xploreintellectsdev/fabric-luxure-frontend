"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      // Save token to localStorage specifically for admin
      localStorage.setItem("admin_token", data.token);
      toast.success("You have logged in to the admin dashboard successfully.");

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="relative w-44 h-16 mx-auto">
            <Image
              src="/images/FL New Logo Final.png"
              alt="Fabric Luxure Logo"
              fill
              sizes="(max-width: 768px) 150px, 200px"
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Admin Portal
          </h2>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-[14px] border border-red-200 rounded-lg p-3 text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[14px] font-semibold text-slate-600 block uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-[15px] text-slate-800 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[14px] font-semibold text-slate-600 block uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-[15px] text-slate-800 focus:outline-none focus:border-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] py-3 rounded-lg shadow-sm transition-all focus:outline-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
