"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface WebsitePage {
  page_id: number;
  page_key: string;
  page_name: string;
  page_route: string;
  menu_order: number;
  show_in_navbar: number;
  show_in_footer: number;
  is_enabled: number;
}

interface WebsitePagesContextType {
  pages: WebsitePage[];
  loading: boolean;
}

const WebsitePagesContext = createContext<WebsitePagesContextType>({
  pages: [],
  loading: true,
});

export const WebsitePagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Force IPv4 to avoid Node.js 18+ ::1 fetch issues
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  const fetchPages = async () => {
    try {
      setLoading(true);
      setApiFailed(false);
      const res = await fetch(`${API_URL}/api/website/pages`);
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      } else {
        setApiFailed(true);
      }
    } catch (error) {
      console.error("Failed to fetch website pages:", error);
      setApiFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();

    // Listen for admin updates to refresh (useful if admin is on same client, though usually it's hard reload)
    const handleUpdate = () => fetchPages();
    window.addEventListener("website-pages-updated", handleUpdate);
    return () => window.removeEventListener("website-pages-updated", handleUpdate);
  }, []);

  // Route Protection Logic
  useEffect(() => {
    if (!loading && !apiFailed) {
      // Only protect these core routes. Other routes like /cart or /product/:id should pass.
      const protectedRoutes = ['/', '/shop', '/about', '/events', '/blogs', '/contact'];
      
      if (pathname && protectedRoutes.includes(pathname)) {
        // Since pages only contains enabled pages now, if the path is not in the list, it's disabled or doesn't exist.
        const isEnabled = pages.some((p) => p.page_route === pathname);
        if (!isEnabled && pathname !== '/') {
          router.push("/404");
        }
      }
    }
  }, [pathname, pages, loading, apiFailed, router]);

  return (
    <WebsitePagesContext.Provider value={{ pages, loading }}>
      {children}
    </WebsitePagesContext.Provider>
  );
};

export const useWebsitePages = () => useContext(WebsitePagesContext);
