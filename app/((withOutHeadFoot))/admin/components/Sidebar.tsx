"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Star,
  Award,
  Mail,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  List,
  ClipboardList,
  Wallet,
  PenTool,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building2,
  FileText,
  Package,
  HelpCircle,
  CalendarDays,
  ShieldAlert,
  FileText as BlogIcon,
  Globe,
  X
} from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isOpen, isMobileOpen, onCloseMobile }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { admin } = useAdmin();

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${backendUrl}/api/admin/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      });
    } catch (err) {
      console.error("❌ Admin Logout Error:", err);
    }
    localStorage.removeItem("admin_token");
    toast.success("You have logged out of the admin dashboard successfully.");
    router.push("/admin/login");
  };

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ...(admin?.role === "SUPERADMIN" ? [{ href: "/admin/administrators", label: "Administrator Accounts", icon: ShieldAlert }] : []),
    { type: "section", label: "Masters" },
    { href: "/admin/product-types", label: "Product Types", icon: List },
    { href: "/admin/categories", label: "Categories", icon: Tag },
    { type: "section", label: "Search Filters" },
    { href: "/admin/fabric-types", label: "Fabric Types", icon: List },
    { href: "/admin/fabric-origins", label: "Fabric Origins", icon: List },
    { href: "/admin/styles", label: "Styles", icon: List },
    { href: "/admin/weaves", label: "Weaves", icon: List },
    { href: "/admin/colors", label: "Colors", icon: List },
    { href: "/admin/patterns", label: "Patterns", icon: List },
    { type: "section", label: "Size & Fit" },
    { href: "/admin/size-chart-templates", label: "Size Templates", icon: FileText },
    { href: "/admin/fit-styles", label: "Fit Styles", icon: List },
    { href: "/admin/sleeves", label: "Sleeves", icon: List },
    { href: "/admin/size-charts", label: "Size Charts", icon: List },
    { type: "section", label: "Management" },
    { href: "/admin/inventory", label: "Stock Management", icon: Package },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/top-picks", label: "Top Picks", icon: Star },
    { href: "/admin/exclusive-linens", label: "Exclusive Linens", icon: Award },
    { href: "/admin/sales-dashboard", label: "Sales Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ClipboardList },
    {
      label: "Monogram Customization",
      icon: PenTool,
      children: [
        { href: "/admin/custom-monogram-settings", label: "Custom Monogram Settings" },
        { href: "/admin/monogram-placements", label: "Monogram Placements" },
        { href: "/admin/monogram-colors", label: "Monogram Colors" },
        { href: "/admin/monogram-fonts", label: "Monogram Fonts" }
      ]
    },
    { type: "section", label: "Enquires" },
    { href: "/admin/contact-us", label: "Contact Us", icon: Mail },
    { href: "/admin/corporate-orders", label: "Corporate Orders", icon: ClipboardList },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/wallets", label: "Wallet Management", icon: Wallet },
    { type: "section", label: "Content / CMS" },
    { href: "/admin/events", label: "Events", icon: CalendarDays },
    { href: "/admin/blogs", label: "Blogs", icon: BlogIcon },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    { type: "section", label: "Website Management" },
    { href: "/admin/website-pages", label: "Website Pages", icon: Globe },
    { href: "/admin/footer-settings", label: "Footer", icon: Globe },
    { href: "/admin/home-page", label: "Home Page", icon: Globe },
    { href: "/admin/about-page", label: "About Page", icon: Globe },
    { href: "/admin/shop-page", label: "Shop Page", icon: Globe },
    { href: "/admin/events-page", label: "Events Page", icon: Globe },
    { href: "/admin/blogs-page", label: "Blogs Page", icon: Globe },
    { href: "/admin/contact-page", label: "Contact Us Page", icon: Globe },
    { href: "/admin/policies", label: "Policies", icon: Globe },
    { type: "section", label: "System" },
    { href: "/admin/settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 lg:relative lg:flex lg:inset-auto lg:z-0
        ${isOpen ? "lg:w-64" : "lg:w-20"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        transition-transform lg:transition-all duration-300 ease-in-out bg-[#102554] border-r border-[#081A42]/50 shrink-0 flex flex-col justify-between`}
    >
      <div>
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-[#081A42]/50 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image
              src="/images/FL New Logo Final.png"
              alt="VL Logo"
              width={64}
              height={64}
              className="h-14 w-auto shrink-0 object-contain brightness-0 invert"
            />
            {(isOpen || isMobileOpen) && (
              <span className="font-instrumentserif text-lg text-[#D4AF37] tracking-widest uppercase scale-y-125 transform origin-left whitespace-nowrap">
                Fabric <br /> Luxure
              </span>
            )}
          </div>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="text-[#D3D3D3]/60 hover:text-white p-2 rounded-full lg:hidden hover:bg-[#081A42]/30 cursor-pointer focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin">
          {menuItems.map((item, idx) => {
            if (item.type === "section") {
              return (isOpen || isMobileOpen) ? (
                <div key={`sec-${idx}`} className="text-[14px] uppercase font-bold text-[#D3D3D3]/40 px-4 pt-4 pb-1 tracking-widest select-none">
                  {item.label}
                </div>
              ) : (
                <div key={`sec-${idx}`} className="border-t border-[#081A42]/30 my-2 mx-4" />
              );
            }

            const activePath = pathname || "";

            if (item.children) {
              const isChildActive = item.children.some(child => activePath.startsWith(child.href));
              const isExpanded = expandedMenus[item.label] || isChildActive;

              return (
                <div key={`parent-${idx}`} className="flex flex-col space-y-1">
                  <div
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${isChildActive && !isExpanded
                      ? "bg-[#081A42] border-l-2 border-[#D4AF37] text-white"
                      : "text-[#D3D3D3]/75 hover:bg-[#081A42]/50 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon && <item.icon className={`w-5 h-5 shrink-0 ${isChildActive ? "text-[#D4AF37]" : "text-[#D3D3D3]/60"}`} />}
                      {(isOpen || isMobileOpen) && <span className="text-[17px] font-medium tracking-wide">{item.label}</span>}
                    </div>
                    {(isOpen || isMobileOpen) && (
                      isExpanded ? <ChevronDown className="w-4 h-4 text-[#D3D3D3]/60" /> : <ChevronRight className="w-4 h-4 text-[#D3D3D3]/60" />
                    )}
                  </div>

                  {(isOpen || isMobileOpen) && isExpanded && (
                    <div className="flex flex-col space-y-1 pl-10 mt-1">
                      {item.children.map((child, childIdx) => {
                        const childActive = activePath.startsWith(child.href);
                        return (
                          <Link
                            key={`child-${childIdx}`}
                            href={child.href}
                            onClick={() => onCloseMobile?.()}
                            className={`w-full flex items-center gap-4 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer ${childActive
                              ? "text-[#D4AF37] font-semibold"
                              : "text-[#D3D3D3]/60 hover:text-white"
                              }`}
                          >
                            <span className="text-[15px] tracking-wide relative">
                              {child.label}
                              {childActive && <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              activePath === item.href ||
              (item.href === "/admin/products" && activePath.startsWith("/admin/products")) ||
              (item.href === "/admin/categories" && activePath.startsWith("/admin/categories")) ||
              (item.href === "/admin/product-types" && activePath.startsWith("/admin/product-types")) ||
              (item.href === "/admin/size-chart-templates" && activePath.startsWith("/admin/size-chart-templates")) ||
              (item.href === "/admin/orders" && activePath.startsWith("/admin/orders")) ||
              (item.href === "/admin/fit-styles" && activePath.startsWith("/admin/fit-styles")) ||
              (item.href === "/admin/sleeves" && activePath.startsWith("/admin/sleeves")) ||
              (item.href === "/admin/size-charts" && activePath.startsWith("/admin/size-charts")) ||
              (item.href === "/admin/reviews" && activePath.startsWith("/admin/reviews")) ||
              (item.href === "/admin/fabric-types" && activePath.startsWith("/admin/fabric-types")) ||
              (item.href === "/admin/fabric-origins" && activePath.startsWith("/admin/fabric-origins")) ||
              (item.href === "/admin/styles" && activePath.startsWith("/admin/styles")) ||
              (item.href === "/admin/weaves" && activePath.startsWith("/admin/weaves")) ||
              (item.href === "/admin/colors" && activePath.startsWith("/admin/colors")) ||
              (item.href === "/admin/patterns" && activePath.startsWith("/admin/patterns")) ||
              (item.href === "/admin/events" && activePath.startsWith("/admin/events")) ||
              (item.href === "/admin/blogs" && activePath.startsWith("/admin/blogs")) ||
              (item.href === "/admin/policies" && activePath.startsWith("/admin/policies"));

            return (
              <Link
                key={item.href || `item-${idx}`}
                href={item.href || "#"}
                onClick={() => onCloseMobile?.()}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${isActive
                  ? "bg-[#081A42] border-l-2 border-[#D4AF37] text-white"
                  : "text-[#D3D3D3]/75 hover:bg-[#081A42]/50 hover:text-white"
                  }`}
              >
                {item.icon && <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#D4AF37]" : "text-[#D3D3D3]/60"}`} />}
                {(isOpen || isMobileOpen) && <span className="text-[17px] font-medium tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer (Logout) */}
      <div className="p-4 border-t border-[#081A42]/50">
        <Link
          href="/admin/login"
          onClick={(e) => {
            handleLogout(e);
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-[#D3D3D3]/75 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(isOpen || isMobileOpen) && <span className="text-[17px] font-medium tracking-wide">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
