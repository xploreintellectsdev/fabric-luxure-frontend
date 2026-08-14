"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import BlogsHero from "../../../../pages/blogs/BlogsHero";
import LatestArticles from "../../../../pages/blogs/LatestArticles";
import BlogsHeritage from "../../../../pages/blogs/BlogsHeritage";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

// Helper for preview
const ScaledPreview = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full rounded overflow-hidden border border-gray-800 shadow-2xl pointer-events-none">
    {children}
  </div>
);

export default function BlogsPageAdmin() {
  const [loading, setLoading] = useState(true);

  // Blogs Hero
  const [dbBlogsHero, setDbBlogsHero] = useState<any>({});
  const [blogsHeroConfig, setBlogsHeroConfig] = useState<any>({
    eyebrow_text: "",
    hero_title: "",
    hero_description: "",
    background_image: "",
    is_enabled: 1,
  });
  const [blogsHeroImage, setBlogsHeroImage] = useState<File | null>(null);
  const [isBlogsHeroEditing, setIsBlogsHeroEditing] = useState(false);
  const [savingBlogsHero, setSavingBlogsHero] = useState(false);

  // Latest Articles
  const [dbLatestArticles, setDbLatestArticles] = useState<any>({});
  const [latestArticlesConfig, setLatestArticlesConfig] = useState<any>({
    section_title: "",
    is_enabled: 1
  });
  const [isLatestArticlesEditing, setIsLatestArticlesEditing] = useState(false);
  const [savingLatestArticles, setSavingLatestArticles] = useState(false);
  const [mockBlogsData, setMockBlogsData] = useState<any[]>([]);

  // Heritage
  const [dbHeritage, setDbHeritage] = useState<any>({});
  const [heritageConfig, setHeritageConfig] = useState<any>({
    section_title: "",
    section_description: "",
    is_enabled: 1
  });
  const [isHeritageEditing, setIsHeritageEditing] = useState(false);
  const [savingHeritage, setSavingHeritage] = useState(false);

  const heroImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");

      // Fetch Hero
      const resHero = await fetch(`${API_URL}/api/admin/blogs-page/blogs-hero`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resHero.ok) {
        const dataHero = await resHero.json();
        if (dataHero.success && dataHero.data) {
          setDbBlogsHero(dataHero.data);
          setBlogsHeroConfig(dataHero.data);
        }
      }

      // Fetch Latest Articles
      const resLatest = await fetch(`${API_URL}/api/admin/blogs-page/latest-articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resLatest.ok) {
        const dataLatest = await resLatest.json();
        if (dataLatest.success && dataLatest.data) {
          setDbLatestArticles(dataLatest.data);
          setLatestArticlesConfig(dataLatest.data);
        }
      }

      // Fetch Heritage
      const resHeritage = await fetch(`${API_URL}/api/admin/blogs-page/heritage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resHeritage.ok) {
        const dataHeritage = await resHeritage.json();
        if (dataHeritage.success && dataHeritage.data) {
          setDbHeritage(dataHeritage.data);
          setHeritageConfig(dataHeritage.data);
        }
      }

      // Fetch mock actual blogs for the preview
      const resBlogs = await fetch(`${API_URL}/api/blogs`);
      if (resBlogs.ok) {
        const dataBlogs = await resBlogs.json();
        if (dataBlogs.success && dataBlogs.data) {
          setMockBlogsData(dataBlogs.data);
        }
      }
    } catch (error) {
      console.error("Error fetching Blogs Page CMS config:", error);
      toast.error("Failed to load Blogs Page configuration.");
    } finally {
      setLoading(false);
    }
  };

  const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("/images/")) return path;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  // ===================== BLOGS HERO HANDLERS =====================
  const handleBlogsHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBlogsHeroImage(file);
      setBlogsHeroConfig({
        ...blogsHeroConfig,
        preview_image: URL.createObjectURL(file),
      });
    }
  };

  const handleBlogsHeroCancel = () => {
    setBlogsHeroConfig(dbBlogsHero);
    setBlogsHeroImage(null);
    setIsBlogsHeroEditing(false);
  };

  const handleBlogsHeroSave = async () => {
    if (!blogsHeroConfig.eyebrow_text || !blogsHeroConfig.hero_title || !blogsHeroConfig.hero_description) {
      toast.error("Please fill in all text fields for Blogs Hero.");
      return;
    }
    try {
      setSavingBlogsHero(true);
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("is_enabled", blogsHeroConfig.is_enabled.toString());
      formData.append("eyebrow_text", blogsHeroConfig.eyebrow_text);
      formData.append("hero_title", blogsHeroConfig.hero_title);
      formData.append("hero_description", blogsHeroConfig.hero_description);

      if (blogsHeroImage) {
        formData.append("background_image", blogsHeroImage);
      }

      const res = await fetch(`${API_URL}/api/admin/blogs-page/blogs-hero`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Blogs Hero updated successfully.");
        await fetchData();
        setIsBlogsHeroEditing(false);
        setBlogsHeroImage(null);
      } else {
        toast.error(data.message || "Error saving Blogs Hero");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Blogs Hero");
    } finally {
      setSavingBlogsHero(false);
    }
  };

  // ===================== LATEST ARTICLES HANDLERS =====================
  const handleLatestArticlesCancel = () => {
    setLatestArticlesConfig(dbLatestArticles);
    setIsLatestArticlesEditing(false);
  };

  const handleLatestArticlesSave = async () => {
    if (!latestArticlesConfig.section_title) {
      toast.error("Please provide a Section Title for Latest Articles.");
      return;
    }
    try {
      setSavingLatestArticles(true);
      const token = localStorage.getItem("admin_token");

      const res = await fetch(`${API_URL}/api/admin/blogs-page/latest-articles`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_enabled: latestArticlesConfig.is_enabled,
          section_title: latestArticlesConfig.section_title
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Latest Articles section updated successfully.");
        await fetchData();
        setIsLatestArticlesEditing(false);
      } else {
        toast.error(data.message || "Error saving Latest Articles");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Latest Articles");
    } finally {
      setSavingLatestArticles(false);
    }
  };

  // ===================== HERITAGE HANDLERS =====================
  const handleHeritageCancel = () => {
    setHeritageConfig(dbHeritage);
    setIsHeritageEditing(false);
  };

  const handleHeritageSave = async () => {
    if (!heritageConfig.section_title || !heritageConfig.section_description) {
      toast.error("Please provide both Title and Description for Discover Our Heritage.");
      return;
    }
    try {
      setSavingHeritage(true);
      const token = localStorage.getItem("admin_token");

      const res = await fetch(`${API_URL}/api/admin/blogs-page/heritage`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_enabled: heritageConfig.is_enabled,
          section_title: heritageConfig.section_title,
          section_description: heritageConfig.section_description
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Heritage section updated successfully.");
        await fetchData();
        setIsHeritageEditing(false);
      } else {
        toast.error(data.message || "Error saving Heritage section");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving Heritage section");
    } finally {
      setSavingHeritage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-[#050505]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen bg-[#050505] flex-1 flex flex-col w-full">
      <div className="w-full">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-wider text-white uppercase mb-2">
              BLOGS PAGE
            </h1>
            <p className="text-gray-400 text-sm tracking-wide">
              Manage content, visibility, and layout for the Blogs Page.
            </p>
          </div>
        </div>

        {/* ======================= BLOGS HERO SECTION ======================= */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-widest text-[#D4AF37] uppercase">BLOGS HERO SECTION</h2>
            {!isBlogsHeroEditing && (
              <button onClick={() => setIsBlogsHeroEditing(true)} className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:bg-yellow-600 transition-colors">
                EDIT
              </button>
            )}
          </div>
          
          <div className="w-full mb-8 relative">
             {blogsHeroConfig.is_enabled === 0 && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded border border-red-500/50">
                 <span className="text-red-400 font-bold tracking-widest text-2xl uppercase border-2 border-red-400 px-6 py-2 rounded">SECTION DISABLED</span>
                 <p className="text-gray-300 mt-2">This section will not appear on the public Blogs page.</p>
               </div>
             )}
             
             <ScaledPreview>
               <BlogsHero previewConfig={blogsHeroConfig} />
             </ScaledPreview>
          </div>

          {isBlogsHeroEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={blogsHeroConfig.is_enabled === 1} onChange={(e) => setBlogsHeroConfig({ ...blogsHeroConfig, is_enabled: e.target.checked ? 1 : 0 })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Eyebrow Text</label>
                      <input type="text" value={blogsHeroConfig.eyebrow_text} onChange={(e) => setBlogsHeroConfig({ ...blogsHeroConfig, eyebrow_text: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. THE EDITORIAL" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Hero Title</label>
                      <input type="text" value={blogsHeroConfig.hero_title} onChange={(e) => setBlogsHeroConfig({ ...blogsHeroConfig, hero_title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. Journal & Stories" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Hero Description</label>
                      <textarea value={blogsHeroConfig.hero_description} onChange={(e) => setBlogsHeroConfig({ ...blogsHeroConfig, hero_description: e.target.value })} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="e.g. Discover craftsmanship..." />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Background Image</label>
                      <div className="relative w-full h-[300px] bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-[#D4AF37] transition-colors group">
                        {(blogsHeroConfig.preview_image || blogsHeroConfig.background_image) ? (
                          <>
                            <img src={blogsHeroConfig.preview_image || getMediaUrl(blogsHeroConfig.background_image)} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button onClick={() => heroImageInputRef.current?.click()} className="bg-[#D4AF37] text-black px-6 py-2 rounded font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <Camera className="w-4 h-4" /> CHANGE IMAGE
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 cursor-pointer" onClick={() => heroImageInputRef.current?.click()}>
                            <Camera className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-sm font-medium">Click to upload image</span>
                          </div>
                        )}
                        <input type="file" ref={heroImageInputRef} onChange={handleBlogsHeroImageChange} accept="image/*" className="hidden" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">Recommended size: 1920x1080px (WebP or JPEG)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={handleBlogsHeroCancel} disabled={savingBlogsHero} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-3 rounded font-medium tracking-wide hover:bg-gray-800 hover:text-white transition-colors">
                  CANCEL
                </button>
                <button onClick={handleBlogsHeroSave} disabled={savingBlogsHero} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingBlogsHero ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ======================= LATEST ARTICLES SECTION ======================= */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-widest text-[#D4AF37] uppercase">LATEST ARTICLES</h2>
            {!isLatestArticlesEditing && (
              <button onClick={() => setIsLatestArticlesEditing(true)} className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:bg-yellow-600 transition-colors">
                EDIT
              </button>
            )}
          </div>
          
          <div className="w-full mb-8 relative">
             {latestArticlesConfig.is_enabled === 0 && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded border border-red-500/50">
                 <span className="text-red-400 font-bold tracking-widest text-2xl uppercase border-2 border-red-400 px-6 py-2 rounded">SECTION DISABLED</span>
                 <p className="text-gray-300 mt-2">This section will not appear on the public Blogs page.</p>
               </div>
             )}
             <ScaledPreview>
               <LatestArticles previewConfig={latestArticlesConfig} mockBlogs={mockBlogsData} />
             </ScaledPreview>
          </div>

          {isLatestArticlesEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={latestArticlesConfig.is_enabled === 1} onChange={(e) => setLatestArticlesConfig({ ...latestArticlesConfig, is_enabled: e.target.checked ? 1 : 0 })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" value={latestArticlesConfig.section_title} onChange={(e) => setLatestArticlesConfig({ ...latestArticlesConfig, section_title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. Latest Articles" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 justify-center items-center bg-gray-800/50 rounded p-6 border border-gray-700/50">
                    <span className="text-gray-400 text-sm italic text-center">Note: The article cards themselves are dynamically loaded from your active Blogs database and cannot be manually edited here.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={handleLatestArticlesCancel} disabled={savingLatestArticles} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-3 rounded font-medium tracking-wide hover:bg-gray-800 hover:text-white transition-colors">
                  CANCEL
                </button>
                <button onClick={handleLatestArticlesSave} disabled={savingLatestArticles} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingLatestArticles ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ======================= DISCOVER OUR HERITAGE SECTION ======================= */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-[#D4AF37] opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-widest text-[#D4AF37] uppercase">DISCOVER OUR HERITAGE</h2>
            {!isHeritageEditing && (
              <button onClick={() => setIsHeritageEditing(true)} className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded hover:bg-yellow-600 transition-colors">
                EDIT
              </button>
            )}
          </div>
          
          <div className="w-full mb-8 relative">
             {heritageConfig.is_enabled === 0 && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded border border-red-500/50">
                 <span className="text-red-400 font-bold tracking-widest text-2xl uppercase border-2 border-red-400 px-6 py-2 rounded">SECTION DISABLED</span>
                 <p className="text-gray-300 mt-2">This section will not appear on the public Blogs page.</p>
               </div>
             )}
             <ScaledPreview>
               <BlogsHeritage previewConfig={heritageConfig} />
             </ScaledPreview>
          </div>

          {isHeritageEditing && (
            <>
              <div className="bg-[#111] border border-gray-800 p-8 rounded shadow-2xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400 font-medium">SECTION ON/OFF:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={heritageConfig.is_enabled === 1} onChange={(e) => setHeritageConfig({ ...heritageConfig, is_enabled: e.target.checked ? 1 : 0 })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Title</label>
                      <input type="text" value={heritageConfig.section_title} onChange={(e) => setHeritageConfig({ ...heritageConfig, section_title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="e.g. Discover Our Heritage" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-medium tracking-wide text-gray-300 mb-2 uppercase">Section Description</label>
                      <textarea value={heritageConfig.section_description} onChange={(e) => setHeritageConfig({ ...heritageConfig, section_description: e.target.value })} rows={5} className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="e.g. Uncover the legacy of Fabric Luxure..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={handleHeritageCancel} disabled={savingHeritage} className="bg-transparent border border-gray-600 text-gray-300 px-8 py-3 rounded font-medium tracking-wide hover:bg-gray-800 hover:text-white transition-colors">
                  CANCEL
                </button>
                <button onClick={handleHeritageSave} disabled={savingHeritage} className="bg-[#D4AF37] text-black px-10 py-4 rounded font-medium tracking-wide hover:bg-[#b0902c] transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] text-lg">
                  {savingHeritage ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
