"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AdminProvider, useAdmin } from "./components/AdminContext";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const { setAdmin } = useAdmin();

  useEffect(() => {
    const checkAdminAuth = async () => {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/admin/me`, {
          headers: {
            "Authorization": `Bearer ${adminToken}`
          }
        });

        if (!res.ok) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
          return;
        }

        const data = await res.json();
        setAdmin(data.admin);
        setLoading(false);
      } catch (err) {
        console.error("❌ Admin Auth Check Error:", err);
        router.push("/admin/login");
      }
    };

    checkAdminAuth();
  }, [pathname, isLoginPage, router, setAdmin]);

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // Auto-close mobile sidebar drawer upon navigation/route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Bypass layout wrapper for the login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show a loading skeleton/spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#081A42] text-white flex overflow-hidden font-sans w-full relative">
      {/* Dark overlay backdrop for mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Shared Admin Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Shared Admin Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 bg-[#081A42] w-full flex flex-col">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37]"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminProvider>
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </AdminProvider>
  );
}
