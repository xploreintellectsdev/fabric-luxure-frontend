"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as LucideIcons from "lucide-react";

interface PolicySection {
  section_id: number;
  section_type: "card" | "group" | "contact" | "note";
  icon: string | null;
  title: string | null;
  content: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  order_no: number;
  is_active: number;
}

interface PolicyPageData {
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
  "shipping-policy": LucideIcons.Package,
  "terms-and-conditions": LucideIcons.FileText,
  "cancellation-and-refunds": LucideIcons.RotateCcw,
  "privacy-policy": LucideIcons.Shield,
};

function DynamicIcon({ name, className }: { name: string | null; className: string }) {
  if (!name) return null;
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return <LucideIcons.HelpCircle className={className} />;
  return <Icon className={className} />;
}

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<PolicyPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");
        const res = await fetch(`${API_URL}/api/policies/privacy-policy`);
        if (!res.ok) {
          setNotFoundState(true);
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setNotFoundState(true);
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  if (loading) {
    return (
      <div className="bg-tertiary min-h-screen text-light font-sans flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notFoundState || !data || data.is_active === 0) {
    notFound();
    return null;
  }

  const HeroIcon = policyIcons[data.page_key] || LucideIcons.Shield;

  return (
    <div className="bg-tertiary min-h-screen text-light font-sans">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-24 pb-12 flex flex-col items-center text-center">
        {/* Breadcrumbs */}
        <div className="text-xs uppercase font-mono tracking-wider text-Pinball/50 mb-10 w-full text-left">
          <Link href="/" className="hover:text-light transition-colors">Home</Link>
          <span> &gt; {data.hero_eyebrow}</span>
          <span> &gt; {data.hero_title}</span>
        </div>

        <div className="inline-block p-4 rounded-full bg-bg-light-blue/50 mb-6 border border-bg-blue/30">
          <HeroIcon className="w-12 h-12 text-brown" />
        </div>
        <h1 className="font-instrumentserif text-4xl sm:text-5xl lg:text-7xl font-normal leading-[1.1] uppercase transform scale-y-125 origin-center tracking-tight mb-4 text-light">
          {data.hero_title}
        </h1>
        <p className="text-Pinball text-sm md:text-lg sm:text-base leading-relaxed max-w-xl">
          {data.hero_subtitle}
        </p>
      </div>

      {/* Content Blocks */}
      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-8">
        {/* Introductory Note */}
        {data.intro_note && (
          <div className="bg-primary border border-bg-light-blue/50 p-8 rounded-xl shadow-md text-Pinball text-sm md:text-lg leading-relaxed whitespace-pre-line animate-fade-in">
            {data.intro_note}
          </div>
        )}

        {/* Dynamic Sections */}
        {data.sections
          .filter((sec) => sec.title !== "Grievance Officer")
          .map((sec) => (
            <div 
              key={sec.section_id}
              className="bg-primary border border-bg-light-blue/50 p-8 rounded-xl shadow-md animate-fade-in"
            >
              <div className="flex items-center gap-3 mb-6">
                {sec.icon && (
                  <div className="p-2 rounded-lg bg-bg-light-blue border border-bg-blue/20">
                    <DynamicIcon name={sec.icon} className="w-5 h-5 text-brown" />
                  </div>
                )}
                <h2 className="font-instrumentserif text-lg md:text-2xl font-normal uppercase tracking-wide transform scale-y-125 origin-left text-light">
                  {sec.title}
                </h2>
              </div>
              <div className="text-Pinball text-sm md:text-lg leading-relaxed space-y-4 max-w-none whitespace-pre-line">
                {sec.content}
              </div>
            </div>
          ))}

        {/* Grievance Officer Block */}
        {(() => {
          const grievanceSec = data.sections.find((sec) => sec.title === "Grievance Officer");
          if (!grievanceSec || grievanceSec.is_active !== 1) return null;
          return (
            <div className="bg-bg-light-blue border border-bg-blue/30 rounded-xl p-8 text-center shadow-lg animate-fade-in">
              <h2 className="font-instrumentserif text-xl md:text-2xl md:text-3xl font-normal uppercase tracking-wide transform scale-y-125 origin-center text-light mb-4 flex justify-center items-center gap-2">
                {grievanceSec.icon && <DynamicIcon name={grievanceSec.icon} className="w-6 h-6 text-brown" />}
                {grievanceSec.title}
              </h2>
              <div className="text-Pinball text-sm md:text-lg leading-relaxed mb-6 flex flex-col items-center">
                <div className="whitespace-pre-line text-Pinball mb-4 text-center">
                  {grievanceSec.content}
                </div>
                
                {data.grievance_address && (
                  <>
                    {data.grievance_address_link ? (
                      <a
                        href={data.grievance_address_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brown font-semibold shrink-0 hover:underline block mb-3"
                      >
                        Address : {data.grievance_address}
                      </a>
                    ) : (
                      <span className="block mb-3 text-light">
                        Address : {data.grievance_address}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {data.contact_email && (
                  <a 
                    href={`mailto:${data.contact_email}`} 
                    className="flex items-center gap-2 bg-primary px-6 py-3 rounded-full border border-bg-blue/40 text-light hover:border-brown transition-colors text-sm md:text-lg font-semibold"
                  >
                    <LucideIcons.Mail className="w-4 h-4 text-brown" />
                    {data.contact_email}
                  </a>
                )}
                {data.contact_phone && (
                  <a 
                    href={`tel:${data.contact_phone.replace(/\s+/g, '')}`} 
                    className="flex items-center gap-2 bg-primary px-6 py-3 rounded-full border border-bg-blue/40 text-light hover:border-brown transition-colors text-sm md:text-lg font-semibold"
                  >
                    <LucideIcons.Phone className="w-4 h-4 text-brown" />
                    {data.contact_phone}
                  </a>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
