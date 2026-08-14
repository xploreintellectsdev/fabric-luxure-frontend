"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { confirmAction } from "../../../../../utils/modalUtils";
import * as LucideIcons from "lucide-react";
import { 
  ArrowLeft, Save, Plus, Edit2, Trash2, ArrowUp, ArrowDown, 
  Eye, Check, X, Shield, FileText, RotateCcw, Package 
} from "lucide-react";

interface PolicySection {
  section_id: number;
  page_id: number;
  group_name: string | null;
  icon: string | null;
  title: string | null;
  content: string | null;
  order_no: number;
  is_active: number;
}

interface PolicyPage {
  page_id: number;
  page_key: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  intro_note: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  grievance_address: string | null;
  grievance_address_link: string | null;
  need_help_description: string | null;
  is_active: number;
  sections: PolicySection[];
}

const policyIcons: Record<string, any> = {
  "shipping-policy": Package,
  "terms-and-conditions": FileText,
  "cancellation-and-refunds": RotateCcw,
  "privacy-policy": Shield,
};

const curatedIconsList = [
  "MapPin", "Globe", "Tag", "Shield", "Clock", "AlertTriangle", 
  "List", "Package", "CircleX", "Mail", "Crown", "FileText", 
  "Users", "Circle", "CreditCard", "ShieldAlert", "Eye", 
  "RefreshCw", "Ban", "ArrowLeftRight", "Truck", "CheckCircle", 
  "Info", "HelpCircle", "AlertCircle", "Bookmark", "Phone", "Key", "Lock"
];

// Dynamic icon renderer
function RenderLucideIcon({ name, className }: { name: string | null; className: string }) {
  if (!name) return null;
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return <LucideIcons.HelpCircle className={className} />;
  return <Icon className={className} />;
}

export default function PolicyDetailAdmin() {
  const params = useParams();
  const router = useRouter();
  const pageKey = params?.pageKey as string;

  const [policy, setPolicy] = useState<PolicyPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);

  // Edit Page state
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [introNote, setIntroNote] = useState("");
  const [isActive, setIsActive] = useState(1);

  // Section Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Partial<PolicySection> | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalIcon, setModalIcon] = useState("");
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  
  // Contact details & Grievance states
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [grievanceAddress, setGrievanceAddress] = useState("");
  const [grievanceAddressLink, setGrievanceAddressLink] = useState("");
  const [needHelpDescription, setNeedHelpDescription] = useState("");

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  const filteredIcons = curatedIconsList.filter((ico) =>
    ico.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (pageKey) {
      fetchPolicyDetails();
    }
  }, [pageKey]);

  const fetchPolicyDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies/${pageKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch policy details");
      }
      const data = await res.json();
      if (data.success && data.data) {
        setPolicy(data.data);
        setHeroEyebrow(data.data.hero_eyebrow || "");
        setHeroTitle(data.data.hero_title || "");
        setHeroSubtitle(data.data.hero_subtitle || "");
        setIntroNote(data.data.intro_note || "");
        setIsActive(data.data.is_active);
        setContactEmail(data.data.contact_email || "");
        setContactPhone(data.data.contact_phone || "");
        setGrievanceAddress(data.data.grievance_address || "");
        setGrievanceAddressLink(data.data.grievance_address_link || "");
        setNeedHelpDescription(data.data.need_help_description || "");
        window.dispatchEvent(new Event("policies-updated"));
      } else {
        throw new Error(data.message || "Failed to load policy details");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error fetching policy data");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePageMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    try {
      setSavingPage(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies/${policy.page_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hero_eyebrow: heroEyebrow,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          intro_note: introNote || null,
          is_active: isActive,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          grievance_address: grievanceAddress || null,
          grievance_address_link: grievanceAddressLink || null,
          need_help_description: needHelpDescription || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update policy metadata");
      }
      toast.success("Policy page configuration updated successfully!");
      fetchPolicyDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving metadata");
    } finally {
      setSavingPage(false);
    }
  };

  // --- SECTION CRUD ---

  const openAddSectionModal = () => {
    setEditingSection(null);
    setModalTitle("");
    setModalContent("");
    setModalIcon("");
    setIsModalOpen(true);
  };

  const openEditSectionModal = (sec: PolicySection) => {
    setEditingSection(sec);
    setModalTitle(sec.title || "");
    setModalContent(sec.content || "");
    setModalIcon(sec.icon || "");
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    const token = localStorage.getItem("admin_token");
    const payload = {
      icon: modalIcon || null,
      title: modalTitle || null,
      content: modalContent || null,
    };

    try {
      if (editingSection && editingSection.section_id) {
        // Update Section
        const res = await fetch(`${API_URL}/api/admin/policies/sections/${editingSection.section_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update section");
        toast.success("Section updated successfully");
      } else {
        // Create Section
        const res = await fetch(`${API_URL}/api/admin/policies/${policy.page_id}/sections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create section");
        toast.success("Section added successfully");
      }

      setIsModalOpen(false);
      fetchPolicyDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving section");
    }
  };

  const handleDeleteSection = async (sec: PolicySection) => {
    const confirmed = await confirmAction(
      "Delete Section",
      `Are you sure you want to delete "${sec.title || "this section"}"? This action cannot be undone.`,
      "Delete",
      "Cancel"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies/sections/${sec.section_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete section");
      toast.success("Section deleted successfully");
      fetchPolicyDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error deleting section");
    }
  };

  const handleToggleSectionActive = async (sec: PolicySection) => {
    const newActive = sec.is_active === 1 ? 0 : 1;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies/sections/${sec.section_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: newActive }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Section ${newActive === 1 ? "enabled" : "disabled"}`);
      fetchPolicyDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error toggling section active state");
    }
  };

  // --- REORDERING SECTIONS ---

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    if (!policy) return;
    const sections = [...policy.sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= sections.length) return;

    // Swap locally
    const temp = sections[index];
    sections[index] = sections[swapIndex];
    sections[swapIndex] = temp;

    // Update order locally first for responsiveness
    setPolicy({
      ...policy,
      sections
    });

    const orderedIds = sections.map((s) => s.section_id);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/policies/reorder/sections`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) throw new Error("Failed to save section order");
      toast.success("Order updated and saved!");
      fetchPolicyDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error reordering sections");
      fetchPolicyDetails(); // Reload original DB state on error
    }
  };

  if (loading || !policy) {
    return (
      <div className="flex items-center justify-center flex-1 h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  const HeroIcon = policyIcons[policy.page_key] || FileText;

  return (
    <div className="flex-1 w-full bg-[#081A42] flex flex-col pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="mb-6">
        <Link
          href="/admin/policies"
          className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </Link>
      </div>

      {/* Grid: Editor Left, Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
        
        {/* LEFT COLUMN: EDITING FORM */}
        <div className="space-y-6">
          {/* Policy Metadata Editor */}
          <div className="bg-[#102554] border border-white/5 rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#D4AF37]" />
              Policy Page Settings
            </h2>

            <form onSubmit={handleSavePageMetadata} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Hero Eyebrow / Category
                </label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows={2}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Introductory Note (HTML / Paragraphs supported)
                </label>
                <textarea
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                  rows={4}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#D4AF37] resize-y"
                  placeholder="e.g. <p>We know that you care how info is used...</p>"
                />
              </div>

              {policy.page_key === "privacy-policy" ? (
                <div className="border-t border-white/10 pt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider">Grievance Officer Information</h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                      Grievance Officer Address Text
                    </label>
                    <textarea
                      value={grievanceAddress}
                      onChange={(e) => setGrievanceAddress(e.target.value)}
                      rows={3}
                      className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. 36/11, CHB Colony Street No-04..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                      Grievance Officer Address Map Link
                    </label>
                    <input
                      type="text"
                      value={grievanceAddressLink}
                      onChange={(e) => setGrievanceAddressLink(e.target.value)}
                      className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. https://maps.google.com/..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                        Grievance Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                        Grievance Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                  {policy.page_key === "shipping-policy" && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                        Need Help Description
                      </label>
                      <textarea
                        value={needHelpDescription}
                        onChange={(e) => setNeedHelpDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        placeholder="For any queries, contact us:"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Policy Page Status:</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(isActive === 1 ? 0 : 1)}
                    className={`px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider ${
                      isActive === 1
                        ? "bg-green-600/20 text-green-400 border border-green-500/30"
                        : "bg-red-600/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {isActive === 1 ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={savingPage}
                  className="bg-[#D4AF37] text-black hover:bg-white hover:text-black font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingPage ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>

          {/* Policy Sections Manager */}
          <div className="bg-[#102554] border border-white/5 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                Policy Sections
              </h2>
              <button
                onClick={openAddSectionModal}
                className="bg-transparent border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </button>
            </div>

            {/* List of Sections */}
            {policy.sections.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No sections exist for this policy page. Click Add Section to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {policy.sections.map((sec, idx) => (
                  <div
                    key={sec.section_id}
                    className="bg-[#081A42] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-white/10"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Section Type Tag & Icon */}
                      <div className="p-2 bg-[#102554] border border-white/5 rounded-lg text-[#D4AF37] shrink-0 mt-0.5">
                        {sec.icon ? (
                          <RenderLucideIcon name={sec.icon} className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white truncate text-sm">
                            {sec.title || "(Untitled Section)"}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {sec.content ? sec.content.replace(/<[^>]*>/g, "") : "No content"}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Reordering */}
                    <div className="flex items-center gap-2 justify-end">
                      {/* Move Up/Down */}
                      <button
                        onClick={() => handleMoveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 bg-[#102554]/60 hover:bg-[#D4AF37] text-gray-300 hover:text-black rounded transition-colors disabled:opacity-30 disabled:hover:bg-[#102554]/60 disabled:hover:text-gray-300"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(idx, "down")}
                        disabled={idx === policy.sections.length - 1}
                        className="p-1.5 bg-[#102554]/60 hover:bg-[#D4AF37] text-gray-300 hover:text-black rounded transition-colors disabled:opacity-30 disabled:hover:bg-[#102554]/60 disabled:hover:text-gray-300"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Edit / Active Toggle / Delete */}
                      <button
                        onClick={() => handleToggleSectionActive(sec)}
                        className={`p-1.5 rounded transition-colors ${
                          sec.is_active === 1
                            ? "bg-green-600/20 text-green-400 hover:bg-green-600/40"
                            : "bg-red-600/20 text-red-400 hover:bg-red-600/40"
                        }`}
                        title={sec.is_active === 1 ? "Click to Disable" : "Click to Enable"}
                      >
                        {sec.is_active === 1 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => openEditSectionModal(sec)}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded transition-colors"
                        title="Edit Section Content"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteSection(sec)}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE VISUAL PREVIEW */}
        <div className="bg-[#081A42] border border-white/10 rounded-xl overflow-hidden shadow-2xl sticky top-8">
          <div className="bg-[#102554] px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wider text-gray-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D4AF37]" />
              Live Preview (Public Page Representation)
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]/80 bg-[#081A42] border border-[#D4AF37]/30 px-2 py-1 rounded">
              CMS PREVIEW
            </span>
          </div>

          <div className="p-6 md:p-8 bg-[#0b172a] text-white font-sans max-h-[85vh] overflow-y-auto min-h-[500px]">
            {/* Breadcrumb Preview */}
            <div className="text-xs uppercase font-mono tracking-wider text-[#A5A5A5]/60 mb-6 text-left">
              <span>Home</span>
              <span> &gt; {heroEyebrow || "Conditions"}</span>
              <span> &gt; {heroTitle || "Policy"}</span>
            </div>

            {/* Hero Preview */}
            <div className="flex flex-col items-center text-center pb-8 border-b border-white/5 mb-8">
              <div className="inline-block p-4 rounded-full bg-white/5 mb-4 border border-white/10">
                <HeroIcon className="w-10 h-10 text-[#B37E4A]" />
              </div>
              <h1 className="font-instrumentserif text-3xl md:text-5xl font-normal leading-[1.1] uppercase transform scale-y-125 origin-center tracking-tight mb-3 text-white">
                {heroTitle || "Policy Title"}
              </h1>
              <p className="text-[#A5A5A5] text-xs md:text-sm leading-relaxed max-w-lg">
                {heroSubtitle || "Policy subtitle description goes here."}
              </p>
            </div>

            {/* Intro Note Preview */}
            {introNote && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-sm text-[#A5A5A5] leading-relaxed mb-8 whitespace-pre-line">
                {introNote}
              </div>
            )}

            {/* Sections Rendering */}
            <div className="space-y-6">
              {policy.sections
                .filter((s) => s.is_active === 1 && s.title !== "Grievance Officer" && s.title !== "Questions About Our Terms?" && s.title !== "Need Assistance?")
                .map((sec) => (
                  <div 
                    key={sec.section_id}
                    className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {sec.icon && (
                        <div className="p-1.5 bg-[#0b172a] border border-white/10 rounded-md text-[#B37E4A]">
                          <RenderLucideIcon name={sec.icon} className="w-4 h-4" />
                        </div>
                      )}
                      <h2 className="font-instrumentserif text-md md:text-lg font-normal uppercase tracking-wide text-white">
                        {sec.title}
                      </h2>
                    </div>
                    <div className="text-xs md:text-sm text-[#A5A5A5] leading-relaxed space-y-3 whitespace-pre-line">
                      {sec.content}
                    </div>
                  </div>
                ))}

              {/* Dynamic Bottom Contact Blocks depending on Policy Type */}
              {policy.page_key === "privacy-policy" ? (
                (() => {
                  const grievanceSec = policy.sections.find((s) => s.title === "Grievance Officer");
                  if (!grievanceSec || grievanceSec.is_active !== 1) return null;
                  return (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center shadow-lg space-y-4">
                      <h3 className="font-instrumentserif text-lg md:text-xl font-normal uppercase tracking-wide text-white flex justify-center items-center gap-2">
                        {grievanceSec.icon && <RenderLucideIcon name={grievanceSec.icon} className="w-4 h-4" />}
                        {grievanceSec.title}
                      </h3>
                      <div className="text-xs md:text-sm text-[#A5A5A5] leading-relaxed mb-2 flex flex-col items-center">
                        <div className="whitespace-pre-line mb-3">
                          {grievanceSec.content}
                        </div>
                        
                        {grievanceAddress && (
                          <>
                            {grievanceAddressLink ? (
                              <a
                                href={grievanceAddressLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#B37E4A] font-semibold hover:underline block mb-2"
                              >
                                Address : {grievanceAddress}
                              </a>
                            ) : (
                              <span className="block mb-2">Address : {grievanceAddress}</span>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                        {contactEmail && (
                          <a 
                            href={`mailto:${contactEmail}`}
                            className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                          >
                            <LucideIcons.Mail className="w-3.5 h-3.5 text-[#B37E4A]" />
                            {contactEmail}
                          </a>
                        )}
                        {contactPhone && (
                          <a 
                            href={`tel:${contactPhone}`}
                            className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                          >
                            <LucideIcons.Phone className="w-3.5 h-3.5 text-[#B37E4A]" />
                            {contactPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : policy.page_key === "terms-and-conditions" ? (
                (() => {
                  const questionsSec = policy.sections.find((s) => s.title === "Questions About Our Terms?");
                  if (!questionsSec || questionsSec.is_active !== 1) return null;
                  return (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center shadow-lg space-y-4">
                      <h3 className="font-instrumentserif text-lg md:text-xl font-normal uppercase tracking-wide text-white flex justify-center items-center gap-2">
                        {questionsSec.icon && <RenderLucideIcon name={questionsSec.icon} className="w-4 h-4" />}
                        {questionsSec.title}
                      </h3>
                      <p className="text-xs md:text-sm text-[#A5A5A5] leading-relaxed whitespace-pre-line">
                        {questionsSec.content}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                        {contactEmail && (
                          <a 
                            href={`mailto:${contactEmail}`}
                            className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                          >
                            <LucideIcons.Mail className="w-3.5 h-3.5 text-[#B37E4A]" />
                            {contactEmail}
                          </a>
                        )}
                        {contactPhone && (
                          <a 
                            href={`tel:${contactPhone}`}
                            className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                          >
                            <LucideIcons.Phone className="w-3.5 h-3.5 text-[#B37E4A]" />
                            {contactPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : policy.page_key === "cancellation-and-refunds" ? (
                (() => {
                  const assistanceSec = policy.sections.find((s) => s.title === "Need Assistance?");
                  if (!assistanceSec || assistanceSec.is_active !== 1) return null;
                  return (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center shadow-lg space-y-4">
                      <h3 className="font-instrumentserif text-lg md:text-xl font-normal uppercase tracking-wide text-white flex justify-center items-center gap-2">
                        {assistanceSec.icon && <RenderLucideIcon name={assistanceSec.icon} className="w-4 h-4" />}
                        {assistanceSec.title}
                      </h3>
                      <p className="text-xs md:text-sm text-[#A5A5A5] leading-relaxed whitespace-pre-line">
                        {assistanceSec.content}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                        {contactEmail && (
                          <a 
                            href={`mailto:${contactEmail}`}
                            className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                          >
                            <LucideIcons.Mail className="w-3.5 h-3.5 text-[#B37E4A]" />
                            {contactEmail}
                          </a>
                        )}
                        {contactPhone && (
                          <a 
                            href={`tel:${contactPhone}`}
                            className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                          >
                            <LucideIcons.Phone className="w-3.5 h-3.5 text-[#B37E4A]" />
                            {contactPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center shadow-lg space-y-4">
                  <h3 className="font-instrumentserif text-lg md:text-xl font-normal uppercase tracking-wide text-white">
                    Need Help?
                  </h3>
                  <p className="text-xs md:text-sm text-[#A5A5A5] leading-relaxed whitespace-pre-line">
                    {needHelpDescription || "For any queries, contact us:"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                    {contactEmail && (
                      <a 
                        href={`mailto:${contactEmail}`}
                        className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                      >
                        <LucideIcons.Mail className="w-3.5 h-3.5 text-[#B37E4A]" />
                        {contactEmail}
                      </a>
                    )}
                    {contactPhone && (
                      <a 
                        href={`tel:${contactPhone}`}
                        className="flex items-center gap-2 bg-[#0b172a] px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-white hover:border-[#B37E4A] transition-colors"
                      >
                        <LucideIcons.Phone className="w-3.5 h-3.5 text-[#B37E4A]" />
                        {contactPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- ADD / EDIT SECTION DIALOG MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#102554] border border-white/10 w-full max-w-2xl rounded-xl p-6 shadow-2xl overflow-y-auto my-8 max-h-[90vh]">
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              {editingSection ? <Edit2 className="w-5 h-5 text-[#D4AF37]" /> : <Plus className="w-5 h-5 text-[#D4AF37]" />}
              {editingSection ? "Edit Section Content" : "Add New Policy Section"}
            </h3>

            <form onSubmit={handleSaveSection} className="space-y-4">
              
              <div className="border-b border-white/5 pb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Select Section Icon
                </label>
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2 text-white text-sm mb-3 focus:outline-none focus:border-[#D4AF37]"
                />
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[160px] overflow-y-auto p-2 bg-[#081A42] border border-white/10 rounded-lg">
                  {filteredIcons.map((icoName) => {
                    const IconComponent = (LucideIcons as any)[icoName];
                    const isSelected = modalIcon === icoName;
                    return (
                      <button
                        key={icoName}
                        type="button"
                        onClick={() => setModalIcon(icoName)}
                        title={icoName}
                        className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] scale-105"
                            : "border-white/5 bg-[#102554]/40 text-gray-300 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {IconComponent ? <IconComponent className="w-5 h-5" /> : <span>{icoName}</span>}
                      </button>
                    );
                  })}
                </div>
                {modalIcon && (
                  <div className="mt-2 text-xs text-gray-300 flex items-center gap-1.5">
                    <span>Selected:</span>
                    <span className="font-semibold text-[#D4AF37] flex items-center gap-1">
                      <RenderLucideIcon name={modalIcon} className="w-3.5 h-3.5" />
                      {modalIcon}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g. Address Information"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Section Content
                </label>
                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  rows={8}
                  className="w-full bg-[#081A42] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g. Shipping charges for Indian and overseas orders..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent border border-white/15 text-white hover:bg-white/5 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black hover:bg-white hover:text-black font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
                >
                  Save Section
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// Inline Lucide Settings icon since it was not directly imported in line 7
const Settings = LucideIcons.Settings;
