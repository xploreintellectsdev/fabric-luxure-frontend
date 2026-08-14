"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ArrowUp, ArrowDown, Globe } from "lucide-react";

interface WebsitePage {
  page_id: number;
  page_key: string;
  page_name: string;
  page_route: string;
  menu_order: number;
  show_in_navbar: number;
  show_in_footer: number;
  is_enabled: number;
}

export default function WebsitePagesManagement() {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/website-pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      setPages(data);
    } catch (err: any) {
      console.error("fetchPages error:", err.message || err);
      toast.error("Failed to fetch website pages");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, field: "is_enabled" | "show_in_navbar" | "show_in_footer", currentValue: number) => {
    const newValue = currentValue === 1 ? 0 : 1;
    let endpoint = "";
    if (field === "is_enabled") endpoint = "status";
    if (field === "show_in_navbar") endpoint = "navbar";
    if (field === "show_in_footer") endpoint = "footer";

    // Optimistic update
    const previousPages = [...pages];
    setPages((prev) =>
      prev.map((p) => (p.page_id === id ? { ...p, [field]: newValue } : p))
    );

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${API_URL}/api/admin/website-pages/${id}/${endpoint}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ [field]: newValue })
        }
      );
      
      if (!res.ok) throw new Error("Update failed");
      
      toast.success(`Updated successfully`);
      
      // Dispatch event for Client Context to re-fetch if needed
      window.dispatchEvent(new Event("website-pages-updated"));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      setPages(previousPages); // Revert on failure
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === pages.length - 1) return;

    const newPages = [...pages];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap items
    const temp = newPages[index];
    newPages[index] = newPages[swapIndex];
    newPages[swapIndex] = temp;
    
    setPages(newPages);

    const orderedIds = newPages.map((p) => p.page_id);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${API_URL}/api/admin/website-pages/reorder`,
        { 
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ orderedIds })
        }
      );
      
      if (!res.ok) throw new Error("Update failed");
      
      toast.success("Menu order updated");
      window.dispatchEvent(new Event("website-pages-updated"));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update menu order");
      fetchPages(); // Revert
    }
  };

  const CustomToggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
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
  );

  return (
    <div className="flex-1 bg-black min-h-screen text-white font-sans p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="text-3xl font-bold font-instrumentserif text-[#D4AF37]">
            Website Pages
          </h1>
        </div>
        <div className="text-sm text-gray-400">
          Manage Navbar and Footer Visibility
        </div>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl shadow-lg border border-[#2C2C2C] overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#A5A5A5]">Loading pages...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2C2C2C] text-[#D4AF37] text-sm uppercase tracking-wider border-b border-[#3C3C3C]">
                  <th className="p-4 font-semibold text-center w-24">Menu Order</th>
                  <th className="p-4 font-semibold">Page Name</th>
                  <th className="p-4 font-semibold">Route</th>
                  <th className="p-4 font-semibold text-center w-32">Show In Navbar</th>
                  <th className="p-4 font-semibold text-center w-32">Show In Footer</th>
                  <th className="p-4 font-semibold text-center w-32">Status</th>
                  <th className="p-4 font-semibold text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C2C]">
                {pages.map((page, index) => (
                  <tr
                    key={page.page_id}
                    className="hover:bg-[#252525] transition-colors duration-200"
                  >
                    <td className="p-4 text-center font-medium text-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-4 font-medium">{page.page_name}</td>
                    <td className="p-4 font-mono text-sm text-gray-400">
                      {page.page_route}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <CustomToggle
                          checked={page.show_in_navbar === 1}
                          onChange={() => handleToggle(page.page_id, "show_in_navbar", page.show_in_navbar)}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <CustomToggle
                          checked={page.show_in_footer === 1}
                          onChange={() => handleToggle(page.page_id, "show_in_footer", page.show_in_footer)}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <CustomToggle
                          checked={page.is_enabled === 1}
                          onChange={() => handleToggle(page.page_id, "is_enabled", page.is_enabled)}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="p-2 rounded bg-[#333] hover:bg-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMove(index, "down")}
                          disabled={index === pages.length - 1}
                          className="p-2 rounded bg-[#333] hover:bg-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No website pages found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
