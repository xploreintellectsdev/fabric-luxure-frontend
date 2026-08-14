"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { showAlert } from '../../../../../utils/modalUtils';
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, ShieldCheck, Tag, ExternalLink, Info, CheckCircle2, Wallet, Landmark } from "lucide-react";
import { Order } from "../../../../../types/order";
import { getOrderStatusLabel } from "../../../../../utils/statusHelper";
import CartItemMeasurements from "../../../../../components/CartItemMeasurements";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [otherReason, setOtherReason] = useState("");
  const [previewPaymentType, setPreviewPaymentType] = useState<"gateway" | "wallet" | "split">("gateway");
  const [refundOption, setRefundOption] = useState("wallet");
  const [previewWalletAmount, setPreviewWalletAmount] = useState(0);
  const [previewGatewayAmount, setPreviewGatewayAmount] = useState(0);
  const [previewTotalAmount, setPreviewTotalAmount] = useState(0);
  const [cancellationAllowed, setCancellationAllowed] = useState<boolean | null>(null);
  const [cancelErrorMessage, setCancelErrorMessage] = useState("");
  const [cancellationStep, setCancellationStep] = useState(1);

  const handleCancelOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("warning", "Sign In Required", "Please sign in first.");
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderNumber}/cancel/preview`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok && data.success && data.canCancel) {
        const payType = data.paymentType; // 'WALLET', 'GATEWAY', 'SPLIT'
        setPreviewPaymentType(payType === "WALLET" ? "wallet" : payType === "SPLIT" ? "split" : "gateway");
        setRefundOption(payType === "SPLIT" ? "split" : "wallet");
        const calculatedTotal = (data.walletAmount || 0) + (data.gatewayAmount || 0);
        setPreviewWalletAmount(data.walletAmount || 0);
        setPreviewGatewayAmount(data.gatewayAmount || 0);
        setPreviewTotalAmount(calculatedTotal > 0 ? calculatedTotal : (data.totalAmount || 0));
        setCancellationAllowed(true);
        setCancellationStep(1);
        setShowCancelModal(true);
      } else {
        // Cancellation not allowed (e.g. transit restriction or already cancelled)
        setCancelErrorMessage(data.message || "This order cannot be cancelled because it has already entered transit or has been delivered.");
        setCancellationAllowed(false);
        setCancellationStep(1);
        setShowCancelModal(true);
      }
    } catch (err) {
      console.error("❌ Failed to fetch cancellation preview:", err);
      // Fallback: show cancellation not available dialog
      setCancelErrorMessage("This order cannot be cancelled because it has already entered transit or has been delivered.");
      setCancellationAllowed(false);
      setCancellationStep(1);
      setShowCancelModal(true);
    } finally {
      setCancelling(false);
    }
  };

  const submitCancelOrder = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("warning", "Sign In Required", "Please sign in first.");
        return;
      }

      const finalReason = cancelReason === "Other" ? otherReason : cancelReason;

      console.log("[FRONTEND] Cancel Order confirmed:", orderNumber);

      const res = await fetch(`${API_URL}/api/orders/${orderNumber}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cancellation_reason: finalReason,
          refund_method: refundOption === "original" ? "ORIGINAL_PAYMENT" : refundOption === "split" ? "SPLIT" : "WALLET"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await showAlert("success", "Order Cancelled", data.message || "Your order has been cancelled successfully. Your refund has been initiated.");
        setShowCancelModal(false);
        window.location.reload();
      } else {
        showAlert("error", "Cancellation Failed", data.message || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("❌ Failed to cancel order:", err);
      showAlert("error", "Cancellation Failed", "Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!orderNumber) return;
    console.log("[FRONTEND] View Details clicked:", orderNumber);

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please sign in to view this order.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/orders/${orderNumber}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          const detail = data.data || data;
          setOrder(detail);

          // Fetch tracking scans if AWB exists
          if (detail.shipment && detail.shipment.awb_number) {
            try {
              const trackRes = await fetch(`${API_URL}/api/orders/${orderNumber}/tracking`, {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              });
              const trackJson = await trackRes.json();
              if (trackRes.ok && trackJson.success) {
                setTrackingInfo(trackJson);
              }
            } catch (trackErr) {
              console.error("❌ Failed to fetch tracking timeline:", trackErr);
            }
          }
        } else {
          setError(data.message || "Order not found.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch order detail:", err);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber]);

  if (loading) {
    return (
      <section className="bg-tertiary min-h-screen px-6 sm:px-12 lg:px-16 py-16 md:py-20 w-full flex justify-center items-center text-white border-t-2 border-[#E0D9CF]">
        <div className="animate-pulse tracking-widest text-xs uppercase text-Pinball">Loading Order Details...</div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="bg-tertiary min-h-screen px-6 sm:px-12 lg:px-16 py-16 md:py-20 w-full flex flex-col justify-center items-center text-white border-t-2 border-[#E0D9CF] gap-6">
        <div className="text-Pinball text-center max-w-md">
          <p className="text-base font-semibold">{error || "Something went wrong."}</p>
        </div>
        <Link
          href="/profile/your-orders"
          className="px-6 py-2.5 bg-bg-blue hover:bg-bg-blue/90 text-light text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Your Orders</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-tertiary min-h-screen px-6 sm:px-12 lg:px-16 py-16 md:py-20 w-full flex justify-center overflow-hidden border-t-2 border-[#E0D9CF]">
      <div className="w-full max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="text-xs uppercase text-Pinball font-mono tracking-wider text-pinball/70 mb-10 text-left flex items-center gap-2">
          <Link href="/" className="hover:text-light transition-colors">Home</Link>
          <span> &gt; </span>
          <Link href="/profile" className="hover:text-light transition-colors">Profile</Link>
          <span> &gt; </span>
          <Link href="/profile/your-orders" className="hover:text-light transition-colors">Your Orders</Link>
          <span> &gt; </span>
          <span>{order.order_number}</span>
        </div>

        <div className="text-left mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-instrumentserif text-3xl sm:text-4xl font-medium text-light leading-[1.1] uppercase transform scale-y-130 tracking-tighter origin-center">
              Order {order.order_number}
            </h1>
            <p className="text-xs text-Pinball mt-2">
              Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-md text-Pinball">
              Status: <span className="text-[#D4AF37] font-semibold">{getOrderStatusLabel(order.order_status)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-left">
          {/* Products & Tracking List */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light mb-4 pb-2 border-b border-white/5">
                Items in this Order
              </h3>

              {(order.products || []).map((prod, idx) => {
                let sizeStr = "";
                if (prod.custom_measurement) {
                  try {
                    const cm = typeof prod.custom_measurement === "string"
                      ? JSON.parse(prod.custom_measurement)
                      : prod.custom_measurement;
                    if (cm.waist || cm.inseam || cm.hip || cm.thigh || cm.knee || cm.leg_opening) {
                      sizeStr = `CUSTOM (W:${cm.waist || ""}, I:${cm.inseam || ""}, H:${cm.hip || ""}, T:${cm.thigh || ""}, K:${cm.knee || ""}, LO:${cm.leg_opening || ""})`;
                    } else if (cm.shirt_length !== undefined) {
                      sizeStr = `CUSTOM (Sh:${cm.shoulder || ""}, C:${cm.chest || ""}, SL:${cm.shirt_length || ""}, Slv:${cm.sleeve_length || ""}, MS:${cm.mid_section || ""})`;
                    } else {
                      sizeStr = `CUSTOM (C:${cm.chest || ""}, L:${cm.length || ""}, S:${cm.shoulder || ""}, Sl:${cm.sleeve || ""})`;
                    }
                  } catch (e) {
                    sizeStr = "CUSTOM";
                  }
                } else if (prod.selected_size) {
                  sizeStr = prod.selected_size;
                } else if (prod.selected_length) {
                  sizeStr = prod.product_name?.toLowerCase().includes('towel') ? `Standard Size: ${prod.selected_length}` : `Length: ${prod.selected_length} Meter`;
                }

                return (
                  <div
                    key={idx}
                    className="bg-primary border border-white/5 rounded-xl p-6 flex gap-5 items-center"
                  >
                    <div className="relative w-20 h-20 bg-tertiary rounded-lg shrink-0 overflow-hidden">
                      <Image
                        src={prod.product_image?.startsWith("/uploads") ? `${API_URL}${prod.product_image}` : (prod.product_image || "/images/shop/category.webp")}
                        alt={prod.product_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="grow min-w-0">
                      <h4 className="font-instrumentserif text-lg text-light leading-tight tracking-tight uppercase truncate">
                        {prod.product_name}
                      </h4>
                      {prod.fit_style && (
                        <div className="text-[11px] text-Pinball mt-0.5">
                          Fit Style: <span className="text-light font-semibold">{prod.fit_style}</span>
                        </div>
                      )}
                      {prod.selected_sleeve && (
                        <div className="text-[11px] text-Pinball mt-0.5">
                          Sleeve: <span className="text-light font-semibold">{prod.selected_sleeve}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-Pinball font-mono">
                        {sizeStr && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#D4AF37]" />
                            <span>{sizeStr}</span>
                          </div>
                        )}
                        <span>Quantity: {prod.quantity}</span>
                      </div>
                      {!prod.custom_measurement && prod.fit_style && prod.selected_size && (
                        <div className="w-full mt-1">
                          <CartItemMeasurements productType={prod.pro_type_name || 'Shirt'} fitStyle={prod.fit_style} sizeName={prod.selected_size} />
                        </div>
                      )}

                      {prod.monogram && (
                        <div className="mt-3 p-3 bg-tertiary border border-white/5 rounded-lg text-[12px] text-Pinball">
                          <span className="text-[#D4AF37] font-semibold block mb-1">
                            {prod.monogram.upload_file ? "Custom Monogram" : "Text Monogram"}
                          </span>
                          {prod.monogram.upload_file ? (
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-light text-xs truncate max-w-[200px]">
                                {prod.monogram.upload_file.split('/').pop()}
                              </span>
                              <a
                                href={prod.monogram.upload_file.startsWith('http') ? prod.monogram.upload_file : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${prod.monogram.upload_file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#D4AF37] hover:underline font-semibold uppercase tracking-wider"
                              >
                                View File
                              </a>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>Text: <span className="text-light">{prod.monogram.text}</span></div>
                              <div>Placement: <span className="text-light">{prod.monogram.placement}</span></div>
                              <div>Color: <span className="text-light">{prod.monogram.color}</span></div>
                              <div>Font: <span className="text-light">{prod.monogram.font}</span></div>
                            </div>
                          )}
                          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-light">
                            <span>Additional Charge:</span>
                            <span className="font-semibold text-[#D4AF37]">₹{prod.monogram.price}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Tracking Section */}
            <div className="bg-primary rounded-xl border border-white/5 p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-base font-bold uppercase tracking-wider text-[#D4AF37] font-mono">
                  Delivery Tracking
                </h3>
                {order.shipment?.tracking_url && (
                  <a
                    href={order.shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D4AF37] hover:underline uppercase font-mono tracking-wider flex items-center gap-1"
                  >
                    Live Tracking Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {order.shipment?.awb_number && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-Pinball border-b border-white/5 pb-4">
                  <div>
                    Courier: <span className="text-light font-bold">{order.shipment.courier_name || "Delhivery"}</span>
                  </div>
                  <div>
                    AWB Number: <span className="text-light font-bold">{order.shipment.awb_number}</span>
                  </div>
                </div>
              )}

              {/* Vertical Progress Timeline */}
              <div className="space-y-6 pl-3 relative border-l border-white/10 font-mono text-sm text-left">
                {((order as any).delivery_timeline || []).map((step: any, idx: number) => {
                  const isCompleted = step.completed;
                  const isActive = step.current;

                  return (
                    <div key={idx} className="relative pl-4 space-y-1">
                      <span
                        className={`absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border transition-all duration-300 ${isCompleted
                          ? "bg-[#D4AF37] border-[#D4AF37]"
                          : isActive
                            ? "bg-transparent border-[#D4AF37] animate-pulse"
                            : "bg-[#081A42] border-white/10"
                          }`}
                      />
                      <div className="flex justify-between items-baseline">
                        <span
                          className={`font-bold text-[12px] uppercase tracking-wide ${isActive
                            ? "text-[#D4AF37]"
                            : isCompleted
                              ? "text-light"
                              : "text-Pinball/40"
                            }`}
                        >
                          {step.label}
                        </span>
                        {step.timestamp && (
                          <span className="text-[10px] text-Pinball">
                            {new Date(step.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>

                      {/* Description/Remarks details matching the step */}
                      {step.key === "ORDER_PLACED" && isCompleted && (
                        <p className="text-[11px] text-Pinball/70">Order successfully created and payment verified.</p>
                      )}
                      {step.key === "SELLER_PREPARING" && isCompleted && (
                        <p className="text-[11px] text-Pinball/70">Seller has packaged your order and prepared shipment.</p>
                      )}
                      {step.key === "ON_THE_WAY" && isCompleted && (
                        <p className="text-[11px] text-Pinball/70">Your package is in transit with courier.</p>
                      )}
                      {step.key === "OUT_FOR_DELIVERY" && isCompleted && (
                        <p className="text-[11px] text-Pinball/70">Courier agent is delivering your package today.</p>
                      )}
                      {step.key === "DELIVERED" && isCompleted && (
                        <p className="text-[11px] text-emerald-400 font-bold">Your package has been successfully delivered. Thank you!</p>
                      )}
                      {step.key === "CANCELLED" && isCompleted && (
                        <p className="text-[11px] text-[#ef4444]/90">Order cancelled. Refund has been initiated.</p>
                      )}

                      {/* Display live tracking status directly from courier API */}
                      {isActive && trackingInfo?.raw_status && (
                        <p className="text-[10px] uppercase text-[#D4AF37] mt-1 font-bold">
                          Live Status: {trackingInfo.raw_status}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chronological Scan History Details if scans exist */}
              {trackingInfo?.scans && trackingInfo.scans.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 text-left font-mono">
                  <h4 className="text-[11px] uppercase tracking-wider font-bold text-Pinball mb-4">
                    Tracking Scans History
                  </h4>
                  <div className="space-y-4 pl-3 relative border-l border-white/5 text-xs text-left">
                    {trackingInfo.scans.map((scan: any, idx: number) => (
                      <div key={idx} className="relative pl-3 space-y-0.5">
                        <span className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-Pinball/50" />
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-light/95 text-[12px] uppercase">{scan.status}</span>
                          <span className="text-[10px] text-Pinball/80">
                            {new Date(scan.date).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {scan.location && <p className="text-[11px] text-Pinball/70">Location: {scan.location}</p>}
                        {scan.remarks && <p className="text-[11px] text-Pinball/70">{scan.remarks}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {["ORDER_PLACED", "SELLER_PREPARING", "PENDING", "CREATED", "SHIPMENT_CREATED", "PICKUP_PENDING", "MANIFEST_GENERATED", "WAREHOUSE", "AWB_ASSIGNED", "READY_FOR_PICKUP", "PICKUP_REQUESTED", "NOT_PICKED"].includes(order.order_status?.toUpperCase().replace(/_/g, " ").trim().replace(/ /g, "_")) && (
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="bg-[#AC2E2E]/15 hover:bg-[#AC2E2E]/25 text-red-400 border border-[#AC2E2E]/40 hover:border-[#AC2E2E]/60 text-xs font-semibold uppercase tracking-wider py-3 px-8 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {cancelling ? "Cancelling Order..." : "Cancel Order"}
                </button>
              </div>
            )}
          </div>

          {/* Pricing & Shipping Information (Right Column) */}
          <div className="space-y-6">
            <div className="bg-primary rounded-xl border border-light/5 p-8 shadow-sm">
              <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono mb-4 pb-2 border-b border-white/5">
                Summary
              </h3>

              <div className="space-y-3.5 text-sm text-Pinball font-medium">
                <div className="flex justify-between">
                  <span>Grand Total</span>
                  <span className="text-light font-mono font-bold">
                    Rs. {Number(order.grand_total || 0).toLocaleString()}/-
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Delivery</span>
                  <span className="text-light">
                    {order.expected_delivery
                      ? new Date(order.expected_delivery).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                      : "Delivery date will be updated"}
                  </span>
                </div>
                {order.order_status === "CANCELLED" && order.refund_status && (
                  <div className="flex justify-between border-t border-white/5 pt-3.5 mt-3.5 text-red-400">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Refund Status</span>
                    <span className="font-bold uppercase font-mono">{order.refund_status}</span>
                  </div>
                )}
              </div>
            </div>

            {order.address && (
              <div className="bg-primary rounded-xl border border-light/5 p-8 shadow-sm">
                <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono mb-4 pb-2 border-b border-white/5">
                  Shipping Address
                </h3>
                <div className="text-sm text-light space-y-1.5 font-light leading-relaxed">
                  <p className="font-semibold text-base">{order.address.fullName}</p>
                  <p className="text-Pinball/80">Phone: {order.address.mobile}</p>
                  <p className="text-Pinball/80">
                    {order.address.houseBuilding}, {order.address.streetLocality}
                    {order.address.landmark ? `, Near ${order.address.landmark}` : ""}
                    , {order.address.city}, {order.address.state} - {order.address.postalCode}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Details Card */}
            {order.payment && (
              <div className="bg-primary rounded-xl border border-light/5 p-8 shadow-sm space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono pb-2 border-b border-white/5">
                  Payment Details
                </h3>
                <div className="text-sm text-light space-y-2.5 font-mono">
                  {order.payment.payment_type === "WALLET" && (
                    <>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Payment Method</span>
                        <span className="text-light font-bold">Wallet Payment</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Amount Paid</span>
                        <span className="text-light font-bold">₹{parseFloat(String(order.payment.amount || 0)).toFixed(2)}</span>
                      </p>
                    </>
                  )}
                  {order.payment.payment_type === "GATEWAY" && (
                    <>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Payment Method</span>
                        <span className="text-light font-bold">Bank Payment</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Amount Paid</span>
                        <span className="text-light font-bold">₹{parseFloat(String(order.payment.amount || 0)).toFixed(2)}</span>
                      </p>
                    </>
                  )}
                  {order.payment.payment_type === "MIXED" && (
                    <>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Payment Method</span>
                        <span className="text-light font-bold">Mixed Payment</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Wallet Contribution</span>
                        <span className="text-light font-bold">₹{parseFloat(String(order.payment.wallet_amount || 0)).toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-Pinball text-[11px] uppercase">Bank Contribution</span>
                        <span className="text-light font-bold">₹{parseFloat(String(order.payment.gateway_amount || 0)).toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between border-t border-white/5 pt-2">
                        <span className="text-Pinball text-[11px] uppercase">Total Paid</span>
                        <span className="text-[#D4AF37] font-bold">₹{parseFloat(String(order.payment.amount || 0)).toFixed(2)}</span>
                      </p>
                    </>
                  )}
                  <p className="flex justify-between">
                    <span className="text-Pinball text-[11px] uppercase">Payment Status</span>
                    <span className="text-emerald-500 font-bold uppercase tracking-wider">{order.payment.payment_status || "Success"}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Compact Shipment Metadata Card */}
            {order.shipment && order.shipment.awb_number && (
              <div className="bg-primary rounded-xl border border-light/5 p-8 shadow-sm">
                <h3 className="text-sm uppercase tracking-widest font-bold text-[#D4AF37] font-mono mb-4 pb-2 border-b border-white/5">
                  Delivery Details
                </h3>
                <div className="text-sm text-light space-y-2 font-mono">
                  <p className="flex justify-between">
                    <span className="text-Pinball text-[11px] uppercase">Courier</span>
                    <span className="text-light font-bold">Delhivery</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-Pinball text-[11px] uppercase">AWB Number</span>
                    <span className="text-light font-bold select-all">{order.shipment.awb_number}</span>
                  </p>
                  {order.shipment.tracking_url && (
                    <a
                      href={order.shipment.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D4AF37] hover:underline uppercase tracking-wider block pt-2 text-[11px]"
                    >
                      Track Package &gt;
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showCancelModal && order && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/5 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-2xl animate-fade-in font-sans text-xs text-[#0C1A3A]">

            {/* Modal Heading */}
            {!(cancellationStep === 2 && previewPaymentType === "wallet") && (
              <div className="space-y-1">
                <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#A37646]">
                  Order Cancellation
                </h3>

                {cancellationAllowed === false ? (
                  <div className="text-red-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 pt-1 text-left">
                    <span>❌ Cancellation Not Available</span>
                  </div>
                ) : (
                  <div className="text-emerald-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 pt-1 text-left">
                    <span>✅ Cancellation Available</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: CANCELLATION VALIDATION */}
            {cancellationStep === 1 && (
              <div className="space-y-4">
                {cancellationAllowed === false ? (
                  <>
                    <p className="text-[#0C1A3A] text-base leading-relaxed text-left">
                      This order cannot be cancelled because it has already entered transit or has been delivered.
                    </p>
                    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl text-amber-800 leading-relaxed text-left mt-3">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-sm">
                        If you wish to return this product, please initiate a return request after delivery.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/5">
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(false)}
                        className="w-full bg-[#0C1A3A] hover:bg-[#11234B] text-white py-3 rounded-full transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer text-center shadow-md"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[#0C1A3A] text-base leading-relaxed text-left font-medium">
                      This order is eligible for cancellation.
                    </p>
                    <p className="text-[#0C1A3A]/80 text-sm leading-relaxed text-left mt-1">
                      If you continue, you will be able to review the refund details before confirming the cancellation.
                    </p>

                    <div className="flex gap-3 pt-3 border-t border-black/5">
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(false)}
                        className="flex-1 border border-black/15 hover:bg-black/5 text-[#0C1A3A] py-3 rounded-full transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer text-center"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancellationStep(2)}
                        className="flex-1 bg-[#0C1A3A] hover:bg-[#11234B] text-white py-3 rounded-full transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer text-center shadow-md hover:shadow-lg"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: REFUND CONFIRMATION */}
            {cancellationStep === 2 && cancellationAllowed === true && (
              <div className="space-y-4">
                {/* 1. WALLET PAYMENT */}
                {previewPaymentType === "wallet" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#A37646]">
                        Wallet Refund
                      </h3>
                      <div className="space-y-1">
                        <p className="text-[12px] text-[#0C1A3A] font-semibold leading-relaxed text-left font-sans">
                          You have paid using your Wallet.
                        </p>
                        <p className="text-[12px] text-[#0C1A3A] font-medium leading-relaxed text-left font-sans">
                          Your refund will be initiated directly to your Wallet after the cancellation is confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. GATEWAY PAYMENT */}
                {previewPaymentType === "gateway" && (
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="bg-[#0C1A3A]/5 border border-black/5 rounded-xl p-4 space-y-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#A37646] font-bold pb-2 border-b border-[#0C1A3A]/10">
                        Payment Summary
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-xs font-mono font-medium">
                        <div className="text-slate-600">Payment Method</div>
                        <div className="text-right text-[#0C1A3A] font-bold">Bank Payment</div>
                        <div className="text-slate-600">Amount Paid</div>
                        <div className="text-right text-[#A37646] font-extrabold text-sm font-sans">₹{previewTotalAmount.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Refund Method options */}
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#A37646] font-bold pb-1">
                        Refund Method
                      </div>
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-black/5 bg-[#0C1A3A]/5 hover:bg-[#0C1A3A]/10 cursor-pointer transition-all select-none">
                        <input
                          type="radio"
                          name="refundMethod"
                          value="wallet"
                          checked={refundOption === "wallet"}
                          onChange={() => setRefundOption("wallet")}
                          className="accent-[#0C1A3A] w-4 h-4"
                        />
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-xs text-[#0C1A3A] uppercase tracking-wide">Return Full Amount to Wallet</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-black/5 bg-[#0C1A3A]/5 hover:bg-[#0C1A3A]/10 cursor-pointer transition-all select-none">
                        <input
                          type="radio"
                          name="refundMethod"
                          value="original"
                          checked={refundOption === "original"}
                          onChange={() => setRefundOption("original")}
                          className="accent-[#0C1A3A] w-4 h-4"
                        />
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-xs text-[#0C1A3A] uppercase tracking-wide">Return Full Amount to Original Payment Method</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* 3. MIXED PAYMENT */}
                {previewPaymentType === "split" && (
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="bg-[#0C1A3A]/5 border border-black/5 rounded-xl p-4 space-y-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#A37646] font-bold pb-2 border-b border-[#0C1A3A]/10">
                        Payment Summary
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-xs font-mono font-medium">
                        <div className="text-slate-600">Payment Method</div>
                        <div className="text-right text-[#0C1A3A] font-bold">Wallet + Bank Payment</div>

                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Wallet className="w-3.5 h-3.5 text-[#A37646]" />
                          <span>Wallet Paid</span>
                        </div>
                        <div className="text-right text-[#0C1A3A] font-bold">₹{previewWalletAmount.toFixed(2)}</div>

                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Landmark className="w-3.5 h-3.5 text-[#A37646]" />
                          <span>Bank Paid</span>
                        </div>
                        <div className="text-right text-[#0C1A3A] font-bold">₹{previewGatewayAmount.toFixed(2)}</div>

                        <div className="col-span-2 border-t border-[#0C1A3A]/10 my-1" />

                        <div className="font-semibold text-xs text-[#0c1a3a] uppercase">Total Paid</div>
                        <div className="text-right text-[#A37646] font-extrabold text-sm font-sans">₹{previewTotalAmount.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Refund Method options */}
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#A37646] font-bold pb-1">
                        Refund Method
                      </div>
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-black/5 bg-[#0C1A3A]/5 hover:bg-[#0C1A3A]/10 cursor-pointer transition-all select-none">
                        <input
                          type="radio"
                          name="refundMethodSplit"
                          value="wallet"
                          checked={refundOption === "wallet"}
                          onChange={() => setRefundOption("wallet")}
                          className="accent-[#0C1A3A] w-4 h-4"
                        />
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-xs text-[#0C1A3A] uppercase tracking-wide">Return Full Amount to Wallet</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-black/5 bg-[#0C1A3A]/5 hover:bg-[#0C1A3A]/10 cursor-pointer transition-all select-none">
                        <input
                          type="radio"
                          name="refundMethodSplit"
                          value="split"
                          checked={refundOption === "split"}
                          onChange={() => setRefundOption("split")}
                          className="accent-[#0C1A3A] w-4 h-4"
                        />
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-xs text-[#0C1A3A] uppercase tracking-wide flex items-center gap-1.5">
                            <span>Return to Original Split Payment Method</span>
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Highlighted Info Alert Box */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#A37646]/15 bg-[#A37646]/5 text-[#0C1A3A] leading-relaxed text-left font-sans">
                      <Info className="w-5 h-5 text-[#A37646] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-Pinball/90">
                        {refundOption === "split"
                          ? "Returning to Original Payment Split will refund the Wallet contribution back to your Wallet and the remaining amount back to your original payment method."
                          : `Choosing Wallet refund will consolidate both split portions (Wallet + Bank) and credit the entire ₹${previewTotalAmount.toFixed(2)} instantly back to your store wallet.`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-3 pt-3 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      if (previewPaymentType === "wallet") setShowCancelModal(false);
                      else setCancellationStep(1);
                    }}
                    className="flex-1 border border-black/15 hover:bg-black/5 text-[#0C1A3A] py-3 rounded-full transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={submitCancelOrder}
                    className="flex-1 bg-[#0C1A3A] hover:bg-[#11234B] text-white py-3 rounded-full transition-all uppercase tracking-widest text-[10px] font-bold disabled:opacity-50 cursor-pointer text-center shadow-md hover:shadow-lg"
                  >
                    {previewPaymentType === "wallet" ? (cancelling ? "Processing..." : "OK") : (cancelling ? "Processing..." : "Confirm Cancellation")}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
