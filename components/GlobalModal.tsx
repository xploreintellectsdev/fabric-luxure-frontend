"use client";

import React, { useEffect, useState } from "react";
import { ModalOptions, SHOW_MODAL_EVENT } from "../utils/modalUtils";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export default function GlobalModal() {
  const [modal, setModal] = useState<ModalOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleShowModal = (e: Event) => {
      const customEvent = e as CustomEvent<ModalOptions>;
      setModal(customEvent.detail);
      setTimeout(() => setIsVisible(true), 10); // small delay to allow animation
    };

    window.addEventListener(SHOW_MODAL_EVENT, handleShowModal);
    return () => window.removeEventListener(SHOW_MODAL_EVENT, handleShowModal);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modal) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setModal(null), 300); // Wait for fade out
  };

  const handleConfirm = () => {
    if (modal?.onConfirm) modal.onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    if (modal?.onCancel) modal.onCancel();
    handleClose();
  };

  if (!modal) return null;

  const icons = {
    confirm: <Info className="w-8 h-8 text-[#D4AF37] mb-4 mx-auto" />,
    success: <CheckCircle className="w-8 h-8 text-green-500 mb-4 mx-auto" />,
    warning: <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4 mx-auto" />,
    error: <XCircle className="w-8 h-8 text-red-500 mb-4 mx-auto" />,
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-black/70 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
      onClick={handleCancel}
    >
      <div
        className={`bg-[#0A1633] border border-[#16244A] w-full max-w-md rounded-2xl shadow-2xl flex flex-col p-6 text-center transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {icons[modal.type]}

        <h3 className="text-xl font-instrumentserif tracking-wider text-[#D4AF37] mb-2">
          {modal.title}
        </h3>
        
        <p className="text-sm text-white/80 leading-relaxed mb-6">
          {modal.message}
        </p>

        <div className="flex justify-center gap-3">
          {modal.type === "confirm" && (
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-[#16244A] hover:bg-[#1C2E5D] border border-white/10 rounded-lg transition-all"
            >
              {modal.cancelText || "Cancel"}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] ${
              modal.type === 'error' ? 'bg-red-600 hover:bg-red-500 shadow-none' : 'bg-[#D4AF37] hover:bg-[#C29F31]'
            }`}
          >
            {modal.confirmText || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
