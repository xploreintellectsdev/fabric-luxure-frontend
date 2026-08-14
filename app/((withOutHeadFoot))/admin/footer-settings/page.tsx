"use client";

import React, { useState, useEffect } from "react";
import { Globe, Settings } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../../../../components/Footer";
import FooterEditModal from "./FooterEditModal";

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

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/footer-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch footer settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load footer settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="flex-1 bg-black min-h-screen text-white font-sans p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="text-3xl font-bold font-instrumentserif text-[#D4AF37]">
            Footer Settings
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={loading || !settings}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black px-6 py-2.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Settings size={18} />
          EDIT FOOTER
        </button>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl shadow-lg border border-[#2C2C2C] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#2C2C2C] bg-[#111]">
          <h2 className="text-[#A5A5A5] text-sm uppercase tracking-wider font-semibold">Live Preview</h2>
        </div>

        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#A5A5A5]">Loading preview...</p>
          </div>
        ) : (
          <div className="w-full relative pointer-events-none opacity-90 hover:opacity-100 transition-opacity">
            <Footer forceShow={true} />
            {settings?.is_enabled === 0 && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50">
                <div className="bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-3 rounded-full font-bold uppercase tracking-widest">
                  Footer is currently disabled
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <FooterEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={settings}
        onSuccess={fetchSettings}
      />
    </div>
  );
}
