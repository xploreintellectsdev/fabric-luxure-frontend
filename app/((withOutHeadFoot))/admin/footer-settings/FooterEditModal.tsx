"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface FooterSettings {
  facebook_url: string;
  facebook_enabled: number;
  instagram_url: string;
  instagram_enabled: number;
  x_url: string;
  x_enabled: number;
  youtube_url: string;
  youtube_enabled: number;
  phone_number: string;
  phone_enabled: number;
  email: string;
  email_enabled: number;
  address: string;
  address_enabled: number;
  google_map_url: string;
  google_map_enabled: number;
  is_enabled: number;
  footer_description: string | null;
}

interface FooterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FooterSettings | null;
  onSuccess: () => void;
}

export default function FooterEditModal({ isOpen, onClose, data, onSuccess }: FooterEditModalProps) {
  const [formData, setFormData] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof FooterSettings, value: any) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleToggle = (field: keyof FooterSettings) => {
    setFormData((prev) => prev ? { ...prev, [field]: prev[field] === 1 ? 0 : 1 } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/footer-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to update footer settings");
      toast.success("Footer settings updated successfully");
      
      // Dispatch custom event to notify Footer component previews to refresh
      window.dispatchEvent(new Event("footer-settings-updated"));
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error updating footer settings");
    } finally {
      setLoading(false);
    }
  };

  const CustomToggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between bg-[#252525] p-3 rounded-md border border-[#3C3C3C]">
      <span className="text-sm text-gray-300 font-medium">{label}</span>
      <div
        onClick={onChange}
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
          checked ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1C1C1C] rounded-xl border border-[#2C2C2C] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#2C2C2C] shrink-0">
          <h2 className="text-2xl font-instrumentserif text-[#D4AF37] font-bold">Edit Footer Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-[#2C2C2C]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
          <form id="footerForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Overall Visibility */}
            <div className="space-y-4">
              <h3 className="text-[#D4AF37] font-semibold text-lg border-b border-[#333] pb-2">Visibility</h3>
              <CustomToggle
                checked={formData.is_enabled === 1}
                onChange={() => handleToggle("is_enabled")}
                label="Enable Entire Footer"
              />
            </div>

            {/* Footer Branding */}
            <div className="space-y-4">
              <h3 className="text-[#D4AF37] font-semibold text-lg border-b border-[#333] pb-2">Branding</h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Footer Description</label>
                <textarea
                  rows={3}
                  value={formData.footer_description || ""}
                  onChange={(e) => handleChange("footer_description", e.target.value)}
                  className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none resize-none"
                  placeholder="EXPERIENCE LUXURY LINEN LIKE NEVER BEFORE."
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-[#D4AF37] font-semibold text-lg border-b border-[#333] pb-2">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Facebook URL</label>
                  <input
                    type="url"
                    value={formData.facebook_url || ""}
                    onChange={(e) => handleChange("facebook_url", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="https://facebook.com/..."
                  />
                  <CustomToggle
                    checked={formData.facebook_enabled === 1}
                    onChange={() => handleToggle("facebook_enabled")}
                    label="Enable Facebook"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Instagram URL</label>
                  <input
                    type="url"
                    value={formData.instagram_url || ""}
                    onChange={(e) => handleChange("instagram_url", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="https://instagram.com/..."
                  />
                  <CustomToggle
                    checked={formData.instagram_enabled === 1}
                    onChange={() => handleToggle("instagram_enabled")}
                    label="Enable Instagram"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">X (Twitter) URL</label>
                  <input
                    type="url"
                    value={formData.x_url || ""}
                    onChange={(e) => handleChange("x_url", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="https://x.com/..."
                  />
                  <CustomToggle
                    checked={formData.x_enabled === 1}
                    onChange={() => handleToggle("x_enabled")}
                    label="Enable X"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">YouTube URL</label>
                  <input
                    type="url"
                    value={formData.youtube_url || ""}
                    onChange={(e) => handleChange("youtube_url", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="https://youtube.com/..."
                  />
                  <CustomToggle
                    checked={formData.youtube_enabled === 1}
                    onChange={() => handleToggle("youtube_enabled")}
                    label="Enable YouTube"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-[#D4AF37] font-semibold text-lg border-b border-[#333] pb-2">Contact Information</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone_number || ""}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="+91 12345 67890"
                  />
                  <CustomToggle
                    checked={formData.phone_enabled === 1}
                    onChange={() => handleToggle("phone_enabled")}
                    label="Enable Phone"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="contact@example.com"
                  />
                  <CustomToggle
                    checked={formData.email_enabled === 1}
                    onChange={() => handleToggle("email_enabled")}
                    label="Enable Email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Address</label>
                  <textarea
                    rows={3}
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none resize-none"
                    placeholder="Enter full address here..."
                  />
                  <CustomToggle
                    checked={formData.address_enabled === 1}
                    onChange={() => handleToggle("address_enabled")}
                    label="Enable Address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Google Maps URL</label>
                  <input
                    type="url"
                    value={formData.google_map_url || ""}
                    onChange={(e) => handleChange("google_map_url", e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white rounded p-2.5 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-[#2C2C2C] shrink-0 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded font-medium text-gray-300 bg-[#333] hover:bg-[#444] transition-colors"
          >
            Cancel
          </button>
          <button
            form="footerForm"
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded font-medium text-black bg-[#D4AF37] hover:bg-[#b5952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
