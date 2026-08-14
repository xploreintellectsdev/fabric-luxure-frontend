"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import Image from "next/image";
import ShopHero from "../../../../pages/shop/ShopHero";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

// Helper for preview
const ScaledPreview = ({ children, bg = "bg-[#111111]" }: { children: React.ReactNode, bg?: string }) => (
  <div className={`relative z-0 w-full min-h-[80vh] h-[80vh] rounded border border-gray-800 overflow-hidden shadow-2xl ${bg}`}>
    <div className="relative z-0 w-full h-full overflow-hidden pointer-events-none">
      {children}
    </div>
  </div>
);

export default function ShopPageAdmin() {
  const [loading, setLoading] = useState(true);

  // Shop Hero
  const [dbShopHero, setDbShopHero] = useState<any>({});
  const [shopHero, setShopHero] = useState<any>({
    section_name: "",
    content: "",
    content_enabled: 1,
    is_enabled: 1,
    background_image: "",
  });
  const [shopHeroImage, setShopHeroImage] = useState<File | null>(null);
  const [isShopHeroEditing, setIsShopHeroEditing] = useState(false);
  const [savingShopHero, setSavingShopHero] = useState(false);

  const heroImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");

      const resShopHero = await fetch(`${API_URL}/api/admin/shop-page/shop-hero`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resShopHero.ok) {
        const dataShopHero = await resShopHero.json();
        if (dataShopHero.success) {
          setDbShopHero(dataShopHero.data);
          setShopHero(dataShopHero.data);
        }
      }

    } catch (err: any) {
      toast.error(err.message || "An error occurred fetching CMS data");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleShopHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setShopHero({ ...shopHero, [name]: checked ? 1 : 0 });
    } else {
      setShopHero({ ...shopHero, [name]: value });
    }
  };

  const handleShopHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setShopHeroImage(file);
      setShopHero({ ...shopHero, background_image: URL.createObjectURL(file) });
    }
  };

  const handleShopHeroCancel = () => {
    setShopHero(dbShopHero);
    setShopHeroImage(null);
    setIsShopHeroEditing(false);
    if (heroImageInputRef.current) heroImageInputRef.current.value = "";
  };

  const handleShopHeroSave = async () => {
    try {
      setSavingShopHero(true);
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("content", shopHero.content || "");
      formData.append("content_enabled", shopHero.content_enabled?.toString() || "0");
      formData.append("is_enabled", shopHero.is_enabled?.toString() || "0");

      if (shopHeroImage) {
        formData.append("background_image", shopHeroImage);
      } else {
        formData.append("background_image", shopHero.background_image);
      }

      const res = await fetch(`${API_URL}/api/admin/shop-page/shop-hero`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Shop Hero section updated successfully.");
        await fetchData();
        setIsShopHeroEditing(false);
        setShopHeroImage(null);
        if (heroImageInputRef.current) heroImageInputRef.current.value = "";
      } else {
        toast.error(data.message || "Error saving Shop Hero");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Shop Hero");
    } finally {
      setSavingShopHero(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-[#050505]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#050505]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-serif tracking-widest text-[#D4AF37] uppercase">
          Shop Page
        </h1>
      </div>

      <div className="flex flex-col gap-12">
        {/* ======================= SHOP HERO SECTION ======================= */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-widest text-[#D4AF37] uppercase">{shopHero.section_name || "SHOP HERO"}</h2>
            {!isShopHeroEditing && (
              <button onClick={() => setIsShopHeroEditing(true)} className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:bg-yellow-600 transition-colors">
                EDIT
              </button>
            )}
          </div>
          
          <div className="w-full mb-8">
             <ScaledPreview>
               <ShopHero previewConfig={shopHero} />
             </ScaledPreview>
          </div>

          {isShopHeroEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="is_enabled" checked={shopHero.is_enabled === 1} onChange={handleShopHeroChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Background Image</label>
                      <div className="relative group cursor-pointer w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-[#D4AF37] transition-colors" onClick={() => heroImageInputRef.current?.click()}>
                        {shopHero.background_image ? (
                          <>
                            <Image 
                              src={shopHero.background_image.startsWith('blob:') ? shopHero.background_image : (shopHero.background_image.startsWith('/uploads') ? `${API_URL}${shopHero.background_image}` : shopHero.background_image)} 
                              alt="Background preview" 
                              fill 
                              unoptimized 
                              className="object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-12 h-12 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-[#D4AF37]">
                            <Camera className="w-12 h-12 mb-2" />
                            <span className="text-sm font-medium">Click to upload</span>
                          </div>
                        )}
                        <input type="file" ref={heroImageInputRef} onChange={handleShopHeroImageChange} accept="image/*" className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">CONTENT ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" name="content_enabled" checked={shopHero.content_enabled === 1} onChange={handleShopHeroChange} />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Hero Content</label>
                      <textarea name="content" value={shopHero.content || ""} onChange={handleShopHeroChange} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] resize-none leading-relaxed" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-6 mb-12">
                <button onClick={handleShopHeroCancel} disabled={savingShopHero} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors text-lg">
                  CANCEL
                </button>
                <button onClick={handleShopHeroSave} disabled={savingShopHero} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingShopHero ? "SAVING..." : "SAVE CHANGES"}
                </button>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
