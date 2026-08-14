"use client";

import React from "react";
import { Star, Eye, Trash2 } from "lucide-react";
import { Feedback } from "../data/mockStore";

interface FeedbacksTableProps {
  feedbacks: Feedback[];
  onView: (feedback: Feedback) => void;
  onDelete: (id: string) => void;
}

export default function FeedbacksTable({ feedbacks, onView, onDelete }: FeedbacksTableProps) {
  return (
    <div className="bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden shadow-sm text-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#081A42]/50 bg-[#081A42]/20">
            <th className="p-4 pl-6 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Customer</th>
            <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Email</th>
            <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Rating</th>
            <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Date</th>
            <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
          {feedbacks.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-[#D3D3D3]/50">
                No feedback received yet.
              </td>
            </tr>
          ) : (
            feedbacks.map((f) => (
              <tr key={f.id} className="hover:bg-[#081A42]/10 transition-colors">
                <td className="p-4 pl-6 font-semibold text-white">{f.customer}</td>
                <td className="p-4">{f.email}</td>
                <td className="p-4">
                  <div className="flex gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-3.5 h-3.5 ${idx < f.rating ? "fill-yellow-400" : "text-[#D3D3D3]/20"}`} />
                    ))}
                  </div>
                </td>
                <td className="p-4 font-mono text-[14px]">{f.date}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(f)}
                      className="p-1.5 border border-bg-blue/20 hover:border-bg-blue/50 hover:bg-bg-blue/10 rounded text-bg-blue transition-all cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(f.id)}
                      className="p-1.5 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 rounded text-red-400 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
