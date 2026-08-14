"use client";

import React, { useState, useEffect } from "react";
import { Save, X, Info } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const FILE_TYPES = ["PNG", "JPG", "JPEG", "PDF", "SVG", "AI", "EPS"];

export default function CustomMonogramSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    setting_name: "Custom Monogram Upload",
    upload_price: 599,
    allowed_file_types: ["PNG", "JPG", "JPEG", "PDF"],
    max_file_size_mb: 10,
    description: "Upload your own logo, artwork or PDF for embroidery.",
    is_active: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/monogram/custom-monogram-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setSettingId(data.setting_id);
        setFormData({
          setting_name: data.setting_name || "",
          upload_price: Number(data.upload_price) || 0,
          allowed_file_types: data.allowed_file_types ? data.allowed_file_types.split(",") : [],
          max_file_size_mb: Number(data.max_file_size_mb) || 10,
          description: data.description || "",
          is_active: data.is_active === 1
        });
      } else {
        toast.error("Failed to fetch custom monogram settings.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Unable to load Custom Monogram Settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileTypeToggle = (type: string) => {
    setFormData(prev => {
      const current = prev.allowed_file_types;
      if (current.includes(type)) {
        return { ...prev, allowed_file_types: current.filter(t => t !== type) };
      } else {
        return { ...prev, allowed_file_types: [...current, type] };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.setting_name.trim()) {
      toast.error("Setting Name is required.");
      return;
    }
    if (formData.upload_price < 0) {
      toast.error("Upload Price cannot be negative.");
      return;
    }
    if (formData.max_file_size_mb < 1 || formData.max_file_size_mb > 50) {
      toast.error("Maximum File Size must be between 1 MB and 50 MB.");
      return;
    }
    if (formData.allowed_file_types.length === 0) {
      toast.error("At least one allowed file type must be selected.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/monogram/custom-monogram-settings/${settingId || 1}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          setting_name: formData.setting_name,
          upload_price: formData.upload_price,
          allowed_file_types: formData.allowed_file_types.join(","),
          max_file_size_mb: formData.max_file_size_mb,
          description: formData.description,
          is_active: formData.is_active
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Custom Monogram Settings Updated Successfully");
      } else {
        toast.error(data.message || "Unable to update Custom Monogram Settings. Please try again.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Unable to update Custom Monogram Settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto animate-fade-in text-white w-full">
      {/* Header */}
      <div className="shrink-0 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
          Custom Monogram Settings
        </h2>
        <p className="text-[14px] text-[#D3D3D3]/80 mt-1">
          Configure pricing and upload restrictions for customer uploaded monograms.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Main Settings Form */}
        <div className="xl:col-span-2 bg-[#102554] rounded-xl border border-[#081A42]/50 p-6 flex flex-col h-fit">
          <div className="space-y-6">
            
            {/* Setting Name */}
            <div>
              <label className="block text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] mb-2">
                Setting Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.setting_name}
                onChange={(e) => setFormData({ ...formData, setting_name: e.target.value })}
                className="w-full bg-[#081A42]/50 border border-[#081A42] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="e.g. Custom Monogram Upload"
              />
            </div>

            {/* Price & Size row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Price */}
              <div>
                <label className="block text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] mb-2">
                  Upload Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D3D3D3]/70">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.upload_price}
                    onChange={(e) => setFormData({ ...formData, upload_price: Number(e.target.value) })}
                    className="w-full bg-[#081A42]/50 border border-[#081A42] rounded pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]/50"
                    placeholder="e.g. 599"
                  />
                </div>
              </div>

              {/* Max File Size */}
              <div>
                <label className="block text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] mb-2">
                  Maximum File Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_file_size_mb}
                    onChange={(e) => setFormData({ ...formData, max_file_size_mb: Number(e.target.value) })}
                    className="w-full bg-[#081A42]/50 border border-[#081A42] rounded pl-4 pr-12 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]/50"
                    placeholder="e.g. 10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D3D3D3]/70">MB</span>
                </div>
              </div>
            </div>

            {/* Allowed File Types */}
            <div>
              <label className="block text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] mb-2">
                Allowed File Types <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {FILE_TYPES.map((type) => {
                  const isSelected = formData.allowed_file_types.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleFileTypeToggle(type)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' 
                          : 'border-[#081A42] bg-[#081A42]/50 text-[#D3D3D3]/70 hover:bg-[#081A42]'
                      }`}
                    >
                      <span className="text-lg leading-none">{isSelected ? '☑' : '☐'}</span>
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] uppercase font-mono tracking-wider text-[#D4AF37] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-[#081A42]/50 border border-[#081A42] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                placeholder="Upload your own logo, artwork or PDF for embroidery."
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between bg-[#081A42]/30 p-4 rounded-lg border border-[#081A42]">
              <div>
                <h4 className="text-[14px] font-medium text-white">Status</h4>
                <p className="text-[12px] text-[#D3D3D3]/70 mt-1">Enable or disable custom monogram uploads across the store.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <div className="w-11 h-6 bg-[#081A42] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4 border-t border-[#081A42]/50 pt-6">
            <button
              onClick={() => fetchSettings()}
              className="px-6 py-2 border border-[#081A42] rounded text-[#D3D3D3] hover:bg-[#081A42]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-[#081A42] font-semibold rounded hover:bg-[#F3E5AB] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-[#081A42] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="xl:col-span-1 h-fit">
          <div className="sticky top-0 bg-[#102554] rounded-xl border border-[#081A42]/50 p-6">
            <h3 className="text-[13px] uppercase font-mono tracking-widest text-[#D4AF37] mb-6 pb-4 border-b border-[#081A42]/50 flex items-center gap-2">
              <Info className="w-4 h-4" /> Customer Preview
            </h3>
            
            <div className={`p-5 rounded-lg border ${formData.is_active ? 'bg-[#081A42]/40 border-[#081A42]' : 'bg-[#081A42]/20 border-red-900/30 opacity-60 grayscale'}`}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-instrumentserif text-xl tracking-wide text-white">
                  {formData.setting_name || "Custom Monogram Upload"}
                </h4>
                <div className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded text-xs font-mono font-bold whitespace-nowrap">
                  + ₹{formData.upload_price}
                </div>
              </div>
              
              <p className="text-sm text-[#D3D3D3]/80 mb-5 leading-relaxed">
                {formData.description || "Upload your own logo, artwork or PDF for embroidery."}
              </p>
              
              <div className="space-y-3">
                <div className="bg-[#081A42]/60 p-3 rounded flex justify-between items-center text-xs">
                  <span className="text-[#D3D3D3]/60 uppercase font-mono tracking-wider">Supported Formats</span>
                  <span className="text-white font-medium">
                    {formData.allowed_file_types.length > 0 ? formData.allowed_file_types.join(", ") : "None"}
                  </span>
                </div>
                
                <div className="bg-[#081A42]/60 p-3 rounded flex justify-between items-center text-xs">
                  <span className="text-[#D3D3D3]/60 uppercase font-mono tracking-wider">Max Upload Size</span>
                  <span className="text-white font-medium">{formData.max_file_size_mb} MB</span>
                </div>
                
                <div className="bg-[#081A42]/60 p-3 rounded flex justify-between items-center text-xs">
                  <span className="text-[#D3D3D3]/60 uppercase font-mono tracking-wider">Status</span>
                  <span className={formData.is_active ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {formData.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            
            {!formData.is_active && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200 text-xs text-center">
                This option is currently hidden from customers.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
