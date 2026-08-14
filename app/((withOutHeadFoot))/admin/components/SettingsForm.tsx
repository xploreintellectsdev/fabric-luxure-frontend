"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function SettingsForm() {
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [generalSaved, setGeneralSaved] = useState(false);

  return (
    <div className="space-y-8 text-left text-white max-w-4xl mx-auto">
      {/* General Settings */}
      <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl shadow-md">
        <h3 className="font-instrumentserif text-2xl font-normal uppercase tracking-wider text-white mb-6">
          General Configurations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Company Name</label>
            <input
              type="text"
              defaultValue="VL Global Emart (OPC) Private Limited"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Company Email</label>
            <input
              type="email"
              defaultValue="vlglobalemart@gmail.com"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Support Contact Email</label>
            <input
              type="email"
              defaultValue="vlglobalemart@gmail.com"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Active Theme</label>
            <div className="relative">
              <select
                defaultValue="Navy"
                className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37] appearance-none"
              >
                <option value="Navy" className="bg-[#102554]">Deep Royal Navy & Gold Accent</option>
                <option value="Dark" className="bg-[#102554]">Minimal Slate Dark Theme</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#D3D3D3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end items-center gap-4">
          {generalSaved && (
            <span className="text-[14px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> General config saved successfully
            </span>
          )}
          <button
            onClick={() => {
              setGeneralSaved(true);
              setTimeout(() => setGeneralSaved(false), 3000);
            }}
            className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* SMTP configurations */}
      <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl shadow-md relative">
        <h3 className="font-instrumentserif text-2xl font-normal uppercase tracking-wider text-white mb-6">
          SMTP Configurations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">SMTP Host</label>
            <input
              type="text"
              defaultValue="smtp.gmail.com"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">SMTP Port</label>
            <input
              type="number"
              defaultValue="587"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">SMTP User Login</label>
            <input
              type="text"
              defaultValue="vlglobalemart"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">SMTP Password</label>
            <input
              type="password"
              defaultValue="••••••••••••••••"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end items-center gap-4">
          {smtpSaved && (
            <span className="text-[14px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> SMTP configurations saved successfully
            </span>
          )}
          <button
            onClick={() => {
              setSmtpSaved(true);
              setTimeout(() => setSmtpSaved(false), 3000);
            }}
            className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white"
          >
            Save SMTP Settings
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#102554] border border-[#081A42]/50 p-8 rounded-xl shadow-md">
        <h3 className="font-instrumentserif text-2xl font-normal uppercase tracking-wider text-white mb-6">
          Change Account Password
        </h3>
        <div className="space-y-4 max-w-md">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Current Password</label>
            <input
              type="password"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">New Password</label>
            <input
              type="password"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] uppercase tracking-wider text-[#D4AF37] font-mono">Confirm New Password</label>
            <input
              type="password"
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end items-center gap-4">
          {passSaved && (
            <span className="text-[14px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Password changed successfully
            </span>
          )}
          <button
            onClick={() => {
              setPassSaved(true);
              setTimeout(() => setPassSaved(false), 3000);
            }}
            className="bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider font-semibold cursor-pointer text-white"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
