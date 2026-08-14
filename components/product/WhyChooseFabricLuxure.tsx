"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Fingerprint, Truck, RotateCcw } from "lucide-react";

export default function WhyChooseFabricLuxure() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Quality Assured"
    },
    {
      icon: Fingerprint,
      title: "Secure Payments"
    },
    {
      icon: Truck,
      title: "Reliable Shipping"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns"
    }
  ];

  return (
    <section className="w-full bg-[#0C1A3A] pt-12 pb-24 px-4 sm:px-8 md:px-12 lg:px-16 relative flex justify-center">
      <div className="max-w-7xl w-full relative">

        {/* Main Cream Card */}
        <div className="bg-[#FAF7F2] rounded-3xl p-6 pb-12 sm:p-12 lg:p-16 shadow-2xl border border-white/10 text-center relative mx-2 sm:mx-0">

          {/* Card Title */}
          <h2 className="font-instrumentserif text-3xl sm:text-4xl text-[#0C1A3A] tracking-wider uppercase mb-12 scale-y-105">
            Why Shop With Fabric Luxure
          </h2>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 rounded-full bg-[#0C1A3A]/5 border border-[#0C1A3A]/10 flex items-center justify-center text-[#A37646] group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <span className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#0C1A3A] uppercase">
                    {feature.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Fabric Luxure Logo Overlapping Bottom Edge */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20">
            <div
              className="w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-[3px] sm:border-[5px] border-[#8A6500] relative flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #8B5E00 0%, #C89B2B 25%, #F7E08A 50%, #C89B2B 75%, #8B5E00 100%)",
                boxShadow: "0 10px 25px -5px rgba(200, 155, 43, 0.4), 0 8px 10px -6px rgba(200, 155, 43, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 35px 5px rgba(247, 224, 138, 0.65), 0 10px 25px -5px rgba(200, 155, 43, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(200, 155, 43, 0.4), 0 8px 10px -6px rgba(200, 155, 43, 0.4)";
              }}
            >
              {/* Inner Circular Ring */}
              <div className="absolute inset-1 rounded-full border border-white/25 z-0" />

              <div className="relative w-[84%] h-[84%] z-10 flex items-center justify-center">
                <Image
                  src="/images/FL New Logo Final.png"
                  alt="Fabric Luxure Logo"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
