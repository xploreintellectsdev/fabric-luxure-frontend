"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const Facebook = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const Instagram = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const Twitter = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const Youtube = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

import CorporateOrderModal from './CorporateOrderModal';
import { useWebsitePages } from '../context/websitePagesContext';

// Static policies array removed in favor of database-driven dynamic fetching

const social = [
  { id: 0, icon: Facebook, link: "https://www.facebook.com/VianLuxure" },
  { id: 1, icon: Instagram, link: "https://www.instagram.com/vijay_lakshmi_global" },
  { id: 2, icon: Twitter, link: "https://x.com/vlglobalemart" },
  { id: 3, icon: Youtube, link: "https://youtube.com" }
];

interface FooterProps {
  forceShow?: boolean;
}

function Footer({ forceShow = false }: FooterProps) {
  const [isCorporateModalOpen, setIsCorporateModalOpen] = React.useState(false);
  const { pages } = useWebsitePages();
  const [settings, setSettings] = React.useState<any>(null);
  const [policies, setPolicies] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");
        const res = await fetch(`${API_URL}/api/footer-settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch footer settings", err);
      }
    };

    const fetchPolicies = async () => {
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const API_URL = rawApiUrl.replace("localhost", "127.0.0.1");
        const res = await fetch(`${API_URL}/api/policies`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setPolicies(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch policies in footer:", err);
      }
    };

    fetchFooterSettings();
    fetchPolicies();

    // Listen for admin updates to instantly refresh the preview
    const handleUpdate = () => {
      fetchFooterSettings();
      fetchPolicies();
    };
    window.addEventListener("footer-settings-updated", handleUpdate);
    window.addEventListener("policies-updated", handleUpdate);
    return () => {
      window.removeEventListener("footer-settings-updated", handleUpdate);
      window.removeEventListener("policies-updated", handleUpdate);
    };
  }, []);

  const siteIndex = pages
    .filter((page) => page.is_enabled === 1 && page.show_in_footer === 1)
    .map((page) => ({
      id: String(page.page_id),
      navText: page.page_name,
      navLink: page.page_route
    }));

  if (settings && settings.is_enabled === 0 && !forceShow) {
    return null;
  }

  return (
    <footer className="relative w-full bg-[#090909] font-sans overflow-hidden">
      {/* Subtle Woven Linen Texture Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-12 lg:px-12 pt-[70px] pb-[40px]">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-16">

          {/* Column 1: Logo, Tagline, Socials */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
            <div className="flex flex-col items-center lg:items-start animate-fade-in">
              <Image
                src="/images/FL New Logo Final.png"
                alt="logo"
                height={180}
                width={180}
                className="h-24 w-auto object-contain brightness-0 invert"
              />
              <p className="text-[16px] text-[#A5A5A5] font-serif italic mt-6 leading-relaxed max-w-[280px]">
                {settings?.footer_description || "EXPERIENCE LUXURY LINEN LIKE NEVER BEFORE."}
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 mt-2">
              {(!settings || settings.facebook_enabled === 1) && (
                <Link
                  href={settings?.facebook_url || social[0].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-[rgba(212,175,55,0.35)] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:scale-[1.08] transition-all duration-300"
                >
                  <Facebook size={18} strokeWidth={1.5} />
                </Link>
              )}
              {(!settings || settings.instagram_enabled === 1) && (
                <Link
                  href={settings?.instagram_url || social[1].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-[rgba(212,175,55,0.35)] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:scale-[1.08] transition-all duration-300"
                >
                  <Instagram size={18} strokeWidth={1.5} />
                </Link>
              )}
              {(!settings || settings.x_enabled === 1) && (
                <Link
                  href={settings?.x_url || social[2].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-[rgba(212,175,55,0.35)] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:scale-[1.08] transition-all duration-300"
                >
                  <Twitter size={18} strokeWidth={1.5} />
                </Link>
              )}
              {(!settings || settings.youtube_enabled === 1) && (
                <Link
                  href={settings?.youtube_url || social[3].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-[rgba(212,175,55,0.35)] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:scale-[1.08] transition-all duration-300"
                >
                  <Youtube size={18} strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="mb-8 flex flex-col items-center lg:items-start">
              <h3 className="font-bold text-[#D4AF37] text-[20px] tracking-[0.8px] uppercase">QUICK LINKS</h3>
              <div className="w-[60px] h-[2px] bg-[#D4AF37] mt-3"></div>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-4">
              {siteIndex.map((d) => (
                <Link href={d.navLink} key={d.id} className="inline-block text-[16px] text-[#E5E5E5] hover:text-[#D4AF37] hover:translate-x-1 transition-all duration-300">
                  {d.navText}
                </Link>
              ))}
              <button
                onClick={() => setIsCorporateModalOpen(true)}
                className="inline-block text-[16px] text-[#E5E5E5] hover:text-[#D4AF37] hover:translate-x-1 transition-all duration-300"
              >
                Corporate Orders
              </button>
            </div>
          </div>

          {/* Column 3: Policy */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="mb-8 flex flex-col items-center lg:items-start">
              <h3 className="font-bold text-[#D4AF37] text-[20px] tracking-[0.8px] uppercase">POLICIES</h3>
              <div className="w-[60px] h-[2px] bg-[#D4AF37] mt-3"></div>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-4">
              {policies.map((d) => {
                const routeMap: Record<string, string> = {
                  "shipping-policy": "/Conditions/shipping",
                  "terms-and-conditions": "/Conditions/termsconditions",
                  "cancellation-and-refunds": "/Conditions/returnexchangepolicy",
                  "privacy-policy": "/Conditions/privacypolicy",
                };
                const href = routeMap[d.page_key] || "#";
                return (
                  <Link href={href} key={d.page_id} className="inline-block text-[16px] text-[#E5E5E5] hover:text-[#D4AF37] hover:translate-x-1 transition-all duration-300">
                    {d.hero_title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 4: Contacts */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="mb-8 flex flex-col items-center lg:items-start">
              <h3 className="font-bold text-[#D4AF37] text-[20px] tracking-[0.8px] uppercase">GET IN TOUCH WITH US</h3>
              <div className="w-[60px] h-[2px] bg-[#D4AF37] mt-3"></div>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-6 w-full">

              {(!settings || settings.phone_enabled === 1) && (
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left group">
                  <div className="mt-1 text-[#D4AF37]">
                    <Phone size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#A5A5A5] uppercase tracking-wider">Phone</span>
                    <a href={`tel:${settings?.phone_number || "+91 73050 15970"}`} className="text-[16px] text-[#E5E5E5] hover:text-[#D4AF37] transition-colors duration-300">
                      {settings?.phone_number || "+91 73050 15970"}
                    </a>
                  </div>
                </div>
              )}

              {(!settings || settings.email_enabled === 1) && (
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left group">
                  <div className="mt-1 text-[#D4AF37]">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#A5A5A5] uppercase tracking-wider">Email</span>
                    <a href={`mailto:${settings?.email || "support@fabricluxure.com"}`} className="text-[16px] text-[#E5E5E5] hover:text-[#D4AF37] transition-colors duration-300">
                      {settings?.email || "support@fabricluxure.com"}
                    </a>
                  </div>
                </div>
              )}

              {(!settings || settings.address_enabled === 1) && (
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-left group">
                  <div className="mt-1 text-[#D4AF37]">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#A5A5A5] uppercase tracking-wider">Address</span>
                    <a
                      href={settings?.google_map_url || "https://maps.app.goo.gl/TDbC7gTuZhS57MxS6"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] text-[#E5E5E5] hover:text-[#D4AF37] transition-colors duration-300 leading-relaxed max-w-[260px]"
                    >
                      {settings?.address ? (
                        <span className="whitespace-pre-wrap">{settings.address}</span>
                      ) : (
                        <>Fabric Luxure A Brand Owned By <br />VIJAYLAKSHMI GLOBAL EMART (OPC) PRIVATE LIMITED<br />36/11, CHB Colony Street No-04, Velur road, Tiruchengode 637211, Namakkal Dt. Tamil Nadu.</>
                      )}
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Premium Gradient Divider */}
        <div className="w-full h-[1px] mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)' }} />

        {/* Bottom Copyright */}
        <div className="text-center animate-fade-in">
          <p className="text-[#9A9A9A] text-[14px] tracking-wide">
            © 2026 | All Rights Reserved by <span className="text-[#D4AF37] font-semibold">Fabric Luxure</span>. Designed by Xplore Intellects
          </p>
        </div>

      </div>

      <CorporateOrderModal
        isOpen={isCorporateModalOpen}
        onClose={() => setIsCorporateModalOpen(false)}
      />
    </footer>
  );
}

export default Footer;
