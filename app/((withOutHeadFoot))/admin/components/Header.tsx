"use client";

import React, { useState, useEffect } from "react";
import { Bell, Search, Calendar, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { getNotifications, setNotifications, NotificationItem } from "../data/mockStore";
import { useAdmin } from "./AdminContext";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar, onToggleMobileSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [notifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { admin } = useAdmin();

  useEffect(() => {
    setLocalNotifications(getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setLocalNotifications(updated);
    setNotifications(updated);
  };

  const getBreadcrumbs = () => {
    const paths = (pathname || "").split("/").filter(Boolean);
    return paths
      .map((p) => {
        if (p === "admin") return "Admin";
        if (p === "products") return "Products";
        if (p === "categories") return "Categories";
        if (p === "product-types") return "Product Types";
        if (p === "add") return "Add";
        if (p === "edit") return "Edit";
        if (p === "top-picks") return "Top Picks";
        if (p === "exclusive-linens") return "Exclusive Summer Linens";
        if (p === "contact-us") return "Contact Us";
        if (p === "feedback") return "Feedback";
        if (p === "users") return "Users";
        if (p === "settings") return "Settings";
        return p;
      })
      .join("  /  ");
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  return (
    <header className="h-20 bg-[#102554]/75 backdrop-blur-md border-b border-[#081A42]/50 shrink-0 flex items-center justify-between px-3 lg:px-8 z-20 w-full text-light">
      {/* Left Section: Hamburger + Brand (Mobile) or Breadcrumbs (Desktop) */}
      <div className="flex items-center gap-1.5 lg:gap-4 min-w-0 flex-1">
        {/* Mobile Hamburger (left) */}
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden text-[#D3D3D3]/60 hover:text-white p-2 rounded-full hover:bg-[#102554]/40 cursor-pointer focus:outline-none shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        {/* Desktop Breadcrumbs Panel (hidden on mobile) */}
        <div className="hidden lg:flex flex-col gap-1 text-left">
          <button
            onClick={onToggleSidebar}
            className="text-[#D3D3D3]/60 hover:text-white text-[14px] font-mono tracking-widest uppercase cursor-pointer text-left focus:outline-none"
          >
            {sidebarOpen ? "[ collapse menu ]" : "[ expand menu ]"}
          </button>
          <div className="text-[14px] uppercase font-mono tracking-wider text-[#D3D3D3]/70 font-semibold">
            {getBreadcrumbs()}
          </div>
        </div>

        {/* Mobile Title / Branding (visible on mobile, hidden on desktop) */}
        <div className="flex lg:hidden items-center gap-1.5 min-w-0">
          <Image
            src="/images/FL New Logo Final.png"
            alt="VL Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain brightness-0 invert shrink-0"
          />
          <span className="font-instrumentserif text-[13px] min-[360px]:text-[15px] text-[#D4AF37] tracking-wider uppercase scale-y-110 font-bold whitespace-nowrap truncate min-w-0">
            Fabric Luxure
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0">


        {/* Date display */}
        <div className="hidden lg:flex items-center gap-2 text-[#D3D3D3] text-[14px] font-mono border-r border-[#102554]/60 pr-6">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          {currentDate}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full hover:bg-[#102554]/40 text-[#D3D3D3]/75 hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {notifications.some((n) => !n.read) && (
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] border border-[#102554] absolute top-1.5 right-1.5" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-[-48px] sm:right-0 mt-3 w-[calc(100vw-24px)] sm:w-80 max-w-[320px] sm:max-w-none bg-[#102554] border border-[#081A42]/80 rounded-xl shadow-2xl p-4 z-40">
              <div className="flex justify-between items-center pb-2 border-b border-[#081A42]/50 mb-3">
                <span className="text-[14px] font-bold uppercase tracking-wider text-[#D4AF37]">Notifications</span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-[#D3D3D3] hover:text-white underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[14px] text-[#D3D3D3]/50 text-center py-4">No notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-md text-[14px] leading-relaxed transition-colors text-left break-words ${
                        n.read ? "bg-transparent text-[#D3D3D3]/60" : "bg-[#081A42]/50 text-white border-l-2 border-[#D4AF37]"
                      }`}
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin profile widget */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#D4AF37] bg-[#102554] flex items-center justify-center font-bold text-[#D4AF37] uppercase">
            {admin?.full_name ? admin.full_name.substring(0, 2) : "AD"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[15px] font-semibold text-white leading-none truncate max-w-[150px]">
              {admin?.full_name || "Admin Profile"}
            </p>
            <p className="text-[14px] text-[#D3D3D3]/60 mt-1 leading-none font-mono capitalize">
              Role: {admin?.role?.toLowerCase() || "Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
