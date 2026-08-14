"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { useCart } from "../../../context/cartContext";
import { showAlert } from '../../../utils/modalUtils';

import { calculateOrderSummary } from "../../../utils/pricing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Step Indicator
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: "Order Summary" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Success" }
  ];

  return (
    <div className="max-w-xl mx-auto mb-12 px-4">
      <div className="flex items-center justify-between relative">
        {/* Track Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-bg-blue transition-all duration-500 z-0" 
          style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
        />

        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 border ${
                  isCompleted
                    ? "bg-bg-blue border-transparent text-light"
                    : isActive
                    ? "bg-[#EBE3D5] border-transparent text-black"
                    : "bg-tertiary border-white/10 text-Pinball"
                }`}
              >
                {isCompleted ? "✓" : step.number}
              </div>
              <span
                className={`text-[10px] sm:text-xs uppercase tracking-wider mt-2.5 font-semibold transition-colors duration-300 ${
                  isActive ? "text-[#EBE3D5]" : isCompleted ? "text-bg-blue" : "text-Pinball/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const { cartItems, refreshCart } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [paymentOption, setPaymentOption] = useState<"gateway" | "cashfree" | "wallet" | "instamojo">("gateway");
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [recharging, setRecharging] = useState(false);
  const [activeGateways, setActiveGateways] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsGuest(true);
    } else {
      fetch(`${API_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setWalletBalance(parseFloat(resData.data.balance || 0));
        }
      })
      .catch(err => console.error("Error loading wallet details:", err));
    }

    // Fetch active payment gateway
    fetch(`${API_URL}/api/admin/payment-gateway`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const actives = data.filter((g: any) => g.is_enabled === 1).map((g: any) => g.gateway_name);
          setActiveGateways(actives);
          
          if (actives.includes("ICICI")) {
            setPaymentOption("gateway");
          } else if (actives.includes("CASHFREE")) {
            setPaymentOption("cashfree");
          } else if (actives.includes("INSTAMOJO")) {
            setPaymentOption("instamojo");
          }
        }
      })
      .catch(err => console.error("Error fetching payment gateway:", err));
  }, []);

  // Validate active session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeSession = sessionStorage.getItem("checkout_session_active");
      if (activeSession !== "true" || cartItems.length === 0) {
        setIsValidSession(false);
        router.replace("/order-summary");
      } else {
        setIsValidSession(true);
      }
    }
  }, [cartItems, router]);

  // If validation fails or is pending, show loading state or redirect
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-tertiary flex items-center justify-center text-light font-mono text-sm">
        Validating checkout session...
      </div>
    );
  }

  if (isValidSession === false) {
    return null;
  }

  // Compute prices dynamically from backend items
  const { subtotal, stitching, shipping, grandTotal } = calculateOrderSummary(cartItems);

  const handlePaymentSubmit = async () => {
    if (placing) return;
    
    if (paymentOption === "wallet" && walletBalance < grandTotal) {
      const shortfall = parseFloat((grandTotal - walletBalance).toFixed(2));
      setRechargeAmount(String(shortfall));
      setShowWalletModal(true);
      return;
    }

    setPlacing(true);

    const token = localStorage.getItem("token");
    const address_id = sessionStorage.getItem("checkout_address_id");
    const isGuest = !token;

    try {
      let payload: any = {
        payment_method: "upi",
        use_wallet: paymentOption === "wallet"
      };

      if (isGuest) {
        const guestDataStr = sessionStorage.getItem("guest_checkout_data");
        const guestData = guestDataStr ? JSON.parse(guestDataStr) : null;
        if (!guestData) {
          showAlert("error", "Error", "Guest details missing. Please go back and fill them.");
          setPlacing(false);
          return;
        }
        payload.guest_data = guestData;
        payload.cart_items = cartItems;
      } else {
        payload.address_id = address_id ? Number(address_id) : null;
      }

      const headers: any = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let endpoint = `${API_URL}/api/payment/initiate`;
      if (paymentOption === "cashfree") {
        endpoint = `${API_URL}/api/payment/cashfree/initiate`;
      } else if (paymentOption === "instamojo") {
        endpoint = `${API_URL}/api/payment/instamojo/initiate`;
      }

      // Default to "upi" for initiation payload; user chooses final mode on hosted gateway
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success && data.payment_url) {
        // Terminate checkout session before leaving
        sessionStorage.removeItem("checkout_session_active");
        sessionStorage.removeItem("checkout_address_id");

        // Redirect user to the payment gateway
        window.location.href = data.payment_url;
      } else {
        showAlert("error", "Payment Failed", data.message || "Failed to initiate payment session.");
        setPlacing(false);
      }
    } catch (err) {
      console.error("❌ Payment initiation error:", err);
      showAlert("error", "Network Error", "Network error starting payment transaction.");
      setPlacing(false);
    }
  };

  const handleInlineRecharge = async () => {
    const amountVal = parseFloat(rechargeAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setRecharging(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/add-money`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: amountVal })
      });
      const data = await res.json();
      if (res.ok && data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        showAlert("error", "Recharge Failed", data.error || "Failed to initiate recharge.");
        setRecharging(false);
      }
    } catch {
      showAlert("error", "Network Error", "Network error initiating recharge.");
      setRecharging(false);
    }
  };

  return (
    <div className="bg-tertiary min-h-screen pt-28 md:pt-36 pb-16 px-4 sm:px-8 lg:px-16 font-sans text-light">
      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <h1 className="text-center uppercase font-instrumentserif text-2xl md:text-4xl lg:text-5xl text-light leading-[1.1] transform scale-y-130 origin-center mb-10 select-none">
          ( Payment Method )
        </h1>

        {/* Step Indicator */}
        <StepIndicator currentStep={2} />

        {/* Centered card container (occupying around 600-700px) */}
        <div className="flex flex-col items-center justify-center w-full">
          
          <div className="w-full max-w-[650px] bg-primary rounded-xl border border-light/5 p-8 shadow-md text-left">
            <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono mb-6 pb-2 border-b border-white/5">
              Price Details
            </h3>

            {/* Pricing details */}
            <div className="space-y-4 text-sm text-Pinball font-medium">
              <div className="flex justify-between">
                <span>Subtotal (MRP)</span>
                <span className="text-light font-mono">Rs. {subtotal}/-</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#D3D3D3]/80">GST (5%)</span>
                <span className="font-bold text-[#D4AF37]">Included</span>
              </div>
              {stitching > 0 && (
                <div className="flex justify-between">
                  <span>Stitching Charge</span>
                  <span className="text-light font-mono">Rs. {stitching}/-</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-light">
                  {shipping === "FREE" ? (
                    <span className="text-emerald-500 font-bold uppercase font-sans">Free</span>
                  ) : (
                    <span className="font-mono">Rs. {shipping}/-</span>
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-baseline mb-6">
              <span className="text-sm uppercase font-bold tracking-wider text-light">Total Amount</span>
              <span className="text-xl font-bold text-light font-mono">Rs. {grandTotal}/-</span>
            </div>

            {/* Amount Payable Box */}
            <div className="bg-tertiary border border-white/5 rounded-xl p-4 mb-6 text-xs font-mono text-Pinball flex justify-between items-center select-none">
              <span className="text-slate-400">Amount Payable:</span>
              <span className="text-white font-bold">Rs. {grandTotal}/-</span>
            </div>

            {/* Payment Method Section */}
            <div className="mb-6 space-y-4">
              <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono pb-2 border-b border-white/5">
                Payment Method
              </h3>
              
              <div className="space-y-3">
                {/* Option 1: Gateway */}
                {(activeGateways.length === 0 || activeGateways.includes("ICICI")) && (
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-tertiary/40 hover:bg-tertiary/80 cursor-pointer transition-all select-none">
                    <input
                      type="radio"
                      name="checkoutPaymentMethod"
                      value="gateway"
                      checked={paymentOption === "gateway"}
                      onChange={() => setPaymentOption("gateway")}
                      className="accent-[#D4AF37] w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-semibold text-xs text-light uppercase tracking-wide">Pay through ICICI Secure Payment Gateway</span>
                      <span className="text-[10px] text-Pinball/70">Secure online payment via ICICI Payment Gateway.</span>
                    </div>
                  </label>
                )}

                {/* Option 2: Cashfree */}
                {activeGateways.includes("CASHFREE") && (
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-tertiary/40 hover:bg-tertiary/80 cursor-pointer transition-all select-none">
                    <input
                      type="radio"
                      name="checkoutPaymentMethod"
                      value="cashfree"
                      checked={paymentOption === "cashfree"}
                      onChange={() => setPaymentOption("cashfree")}
                      className="accent-[#D4AF37] w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-semibold text-xs text-light uppercase tracking-wide">Pay through Cashfree Secure Payment Gateway</span>
                      <span className="text-[10px] text-Pinball/70">Secure online payment via Cashfree Payments.</span>
                    </div>
                  </label>
                )}

                {/* Option Instamojo */}
                {activeGateways.includes("INSTAMOJO") && (
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-tertiary/40 hover:bg-tertiary/80 cursor-pointer transition-all select-none">
                    <input
                      type="radio"
                      name="checkoutPaymentMethod"
                      value="instamojo"
                      checked={paymentOption === "instamojo"}
                      onChange={() => setPaymentOption("instamojo")}
                      className="accent-[#D4AF37] w-4 h-4 mt-0.5"
                    />
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-semibold text-xs text-light uppercase tracking-wide">Pay through Instamojo</span>
                      <span className="text-[10px] text-Pinball/70">Secure online payment via Instamojo.</span>
                    </div>
                  </label>
                )}

                {/* Option 3: Wallet */}
                {!isGuest && (
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-tertiary/40 hover:bg-tertiary/80 cursor-pointer transition-all select-none">
                  <input
                    type="radio"
                    name="checkoutPaymentMethod"
                    value="wallet"
                    checked={paymentOption === "wallet"}
                    onChange={() => setPaymentOption("wallet")}
                    className="accent-[#D4AF37] w-4 h-4 mt-0.5"
                  />
                  <div className="flex flex-col gap-1 text-left w-full">
                    <div className="flex justify-between items-baseline w-full">
                      <span className="font-semibold text-xs text-light uppercase tracking-wide">Pay using Wallet</span>
                      <span className="text-[11px] font-mono text-[#D4AF37] font-bold">Balance: ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[10px] text-Pinball/70">Use your Wallet Balance to pay for this order.</span>
                  </div>
                </label>
                )}
              </div>

            </div>

            {/* Pay Action Button */}
            <button
              type="button"
              onClick={handlePaymentSubmit}
              disabled={placing}
              className="w-full h-11 bg-[#D4AF37] hover:bg-[#E5C158] text-[#08142c] text-xs font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {placing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#08142c] border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {paymentOption === "wallet" ? "Continue with Wallet" : "Continue to Secure Payment"}
                  </span>
                </>
              )}
            </button>

            {/* Redirection Notice */}
            <p className="text-[12px] text-Pinball/60 text-center mt-4 leading-normal font-light">
              Secure Payments Powered by ICICI Bank. You will be redirected to the secure gateway to complete the transaction.
            </p>
          </div>

        </div>

        {/* Insufficient Wallet Balance Modal — inline recharge */}
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#08142c] w-full max-w-md rounded-xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden text-center transform transition-all">
              <div className="p-8">
                {/* Header */}
                <h2 className="text-[#D4AF37] text-xl font-instrumentserif uppercase tracking-wider mb-1">Insufficient Wallet Balance</h2>
                <p className="text-light/60 text-xs mb-5">Your wallet balance is insufficient to complete this purchase.</p>

                {/* Balance Summary */}
                <div className="bg-white/5 rounded-lg p-4 space-y-3 mb-5 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-Pinball">Wallet Balance:</span>
                    <span className="text-light font-mono font-bold">₹{walletBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-Pinball">Order Total:</span>
                    <span className="text-light font-mono font-bold">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-[#D4AF37] font-semibold">Additional Amount Required:</span>
                    <span className="text-[#D4AF37] font-mono font-bold">₹{(grandTotal - walletBalance).toFixed(2)}</span>
                  </div>
                </div>

                {/* Inline Recharge Section */}
                <div className="mb-5 text-left">
                  <label className="block text-xs uppercase tracking-widest text-Pinball/70 font-semibold mb-2">
                    Recharge Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      max="50000"
                      value={rechargeAmount}
                      onChange={e => setRechargeAmount(e.target.value)}
                      placeholder={`${(grandTotal - walletBalance).toFixed(2)}`}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#D4AF37]/60 outline-none rounded-md pl-8 pr-4 py-3 text-light font-mono text-sm placeholder-white/25 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-Pinball/50 mt-1.5">You can recharge any amount. Min: ₹1 · Max: ₹50,000 per transaction.</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setShowWalletModal(false); setRecharging(false); }}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-xs tracking-wider uppercase py-3 rounded-md transition-colors border border-red-500/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInlineRecharge}
                    disabled={recharging || !rechargeAmount || parseFloat(rechargeAmount) <= 0}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 disabled:cursor-not-allowed text-[#08142c] font-bold text-xs tracking-wider uppercase py-3 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {recharging ? (
                      <><div className="w-3.5 h-3.5 border-2 border-[#08142c] border-t-transparent rounded-full animate-spin" /><span>Redirecting...</span></>
                    ) : (
                      <span>Recharge & Pay</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
