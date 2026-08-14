"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  X,
  Printer,
  MapPin,
  User,
  CreditCard,
  ExternalLink
} from "lucide-react";
import { getOrderStatusLabel } from "../../../../utils/statusHelper";

interface Order {
  order_id: number;
  order_number: string;
  user_id: number;
  address_id: number;
  subtotal: number;
  gst_amount: number;
  stitching_amount: number;
  shipping_amount: number;
  grand_total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  customer_name: string | null;
  customer_mobile: string | null;
  customer_email: string | null;
  expected_delivery: string | null;
  shipment_status: string | null;
  products_count: number;
}

interface OrderDetail {
  order_id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  customer_email: string | null;
  grand_total: number;
  created_at: string;
  subtotal: number;
  gst_amount: number;
  stitching_amount: number;
  shipping_amount: number;
  products: Array<{
    product_name: string;
    product_image: string | null;
    price: number;
    quantity: number;
    fit_style: string | null;
    selected_size: string | null;
    selected_length: string | null;
    selected_sleeve: string | null;
    custom_measurement: string | null;
    monogram: any | null;
  }>;
  address: {
    fullName: string;
    mobile: string;
    alternateMobile: string | null;
    houseBuilding: string;
    streetLocality: string;
    landmark: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType: string;
  } | null;
  payment: {
    gateway_name: string;
    transaction_id: string;
    payment_method: string;
    bank_name: string | null;
    payment_status: string;
    amount: number;
    currency: string;
    paid_at: string | null;
  } | null;
  timeline: Array<{
    status: string;
    remarks: string | null;
    created_at: string;
  }>;
  shipment: {
    courier_name: string | null;
    awb_number: string | null;
    tracking_url: string | null;
    expected_delivery: string | null;
    delivered_date: string | null;
    shipment_status: string | null;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SalesDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [productType, setProductType] = useState("All");

  // Details Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Modal Edit States
  const [modalStatusVal, setModalStatusVal] = useState("Placed");
  const [modalRemarks, setModalRemarks] = useState("");
  const [updatingModal, setUpdatingModal] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [awbNumber, setAwbNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCustomMeasurement = (val: any) => {
    if (!val) return "";

    const filterAndFormat = (obj: any) => {
      return Object.entries(obj)
        .filter(([_, v]) => v !== null && v !== undefined && v !== "" && v !== "null")
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    };

    if (typeof val === "object") {
      return filterAndFormat(val);
    }
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === "object" && parsed !== null) {
        return filterAndFormat(parsed);
      }
    } catch (e) {}
    return String(val);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // fallback to standard open if fetch fails due to strict CORS
      window.open(fileUrl, '_blank');
    }
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/sales-dashboard?product_type=${productType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/list?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecentOrders(data.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderDetail = async (orderId: number) => {
    setLoadingDetail(true);
    setDetailsError(null);
    setSelectedOrder(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        setDetailsError("Session expired. Please log in again.");
        return;
      }
      if (res.status === 403) {
        setDetailsError("Access denied. Admin authorization required.");
        return;
      }
      if (res.status === 404) {
        setDetailsError("Order not found.");
        return;
      }
      if (!res.ok) {
        setDetailsError("Unable to load order details.");
        return;
      }

      const data = await res.json();
      if (data.success) {
        const orderData = data.data;
        setSelectedOrder(orderData);
        setModalStatusVal(orderData.order_status);
        if (orderData.shipment) {
          setCourierName(orderData.shipment.courier_name || "");
          setAwbNumber(orderData.shipment.awb_number || "");
          setTrackingUrl(orderData.shipment.tracking_url || "");
          if (orderData.shipment.expected_delivery) {
            setExpectedDelivery(orderData.shipment.expected_delivery.split("T")[0]);
          } else {
            setExpectedDelivery("");
          }
        } else {
          setCourierName("");
          setAwbNumber("");
          setTrackingUrl("");
          setExpectedDelivery("");
        }
      } else {
        setDetailsError(data.message || "Failed to load order details.");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setDetailsError("Failed to connect to backend server.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrint = async () => {
    if (isPrinting || !selectedOrder) return;
    setIsPrinting(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${selectedOrder.order_id}/invoice-pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${selectedOrder.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Invoice PDF downloaded successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate invoice PDF.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleModalUpdateOrder = async () => {
    if (!selectedOrder) return;
    setUpdatingModal(true);
    try {
      const statusRes = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.order_id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: modalStatusVal, remarks: modalRemarks || `Status changed to ${modalStatusVal}` })
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok || !statusData.success) {
        showToast(statusData.message || "Failed to save status.", "error");
        setUpdatingModal(false);
        return;
      }

      let derivedShipmentStatus = 'Pending';
      if (modalStatusVal === 'Shipped') derivedShipmentStatus = 'Shipped';
      else if (modalStatusVal === 'Delivered') derivedShipmentStatus = 'Delivered';
      else if (modalStatusVal === 'Cancelled') derivedShipmentStatus = 'Cancelled';

      const shipmentRes = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.order_id}/shipment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courier_name: courierName,
          awb_number: awbNumber,
          tracking_url: trackingUrl,
          expected_delivery: expectedDelivery || null,
          shipment_status: derivedShipmentStatus
        })
      });
      const shipmentData = await shipmentRes.json();
      if (!shipmentRes.ok || !shipmentData.success) {
        showToast(shipmentData.message || "Failed to save shipment.", "error");
        setUpdatingModal(false);
        return;
      }

      showToast("Order status & tracking details updated successfully.", "success");
      setModalRemarks("");
      fetchDashboardStats();
      fetchSalesStats();
      fetchRecentOrders();
      fetchOrderDetail(selectedOrder.order_id);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error updating order.", "error");
    } finally {
      setUpdatingModal(false);
    }
  };

  const handleCreateDelhiveryShipment = async () => {
    if (!selectedOrder) return;
    setCreatingShipment(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.order_id}/create-shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          expected_delivery: expectedDelivery || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Failed to create Delhivery shipment.", "error");
        return;
      }
      showToast(data.message || "Delhivery shipment created successfully.", "success");
      fetchRecentOrders();
      fetchDashboardStats();
      fetchSalesStats();
      fetchOrderDetail(selectedOrder.order_id);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error creating shipment.", "error");
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    showToast(`Order number ${num} copied.`, "success");
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
      fetchRecentOrders();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSalesStats();
    }
  }, [token, productType]);

  useEffect(() => {
    if (token && selectedOrderId !== null) {
      fetchOrderDetail(selectedOrderId);
    }
  }, [token, selectedOrderId]);

  return (
    <div className="space-y-6 animate-fade-in text-white w-full relative min-h-screen h-auto overflow-x-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-instrumentserif text-3xl text-white tracking-wide scale-y-110">Sales Dashboard</h1>
          <p className="text-[14px] text-slate-300 font-mono">Real-time revenue metrics, category distributions, and analytics charts.</p>
        </div>
      </div>

      {/* REVENUE & ORDER STATS CARDS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Total Orders</span>
              <span className="text-xl font-bold font-mono block truncate">{stats.totalOrders}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Today's Orders</span>
              <span className="text-xl font-bold font-mono block truncate">{stats.todayOrders}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Pending Orders</span>
              <span className="text-xl font-bold font-mono block truncate">{stats.pendingOrders}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Delivered Orders</span>
              <span className="text-xl font-bold font-mono block truncate">{stats.deliveredOrders}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Cancelled Orders</span>
              <span className="text-xl font-bold font-mono block truncate">{stats.cancelledOrders}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Revenue</span>
              <span className="text-xl font-bold font-mono block truncate">₹{stats.revenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Avg Value (AOV)</span>
              <span className="text-xl font-bold font-mono block truncate">₹{stats.aov}</span>
            </div>
          </div>
          <div className="bg-[#102554] p-4 rounded-xl border border-[#081A42]/50 flex items-center gap-3 text-left min-w-0">
            <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] text-slate-300 uppercase tracking-wider block font-mono whitespace-normal break-words leading-tight">Total Customers</span>
              <span className="text-xl font-bold font-mono block truncate">{stats.totalCustomers}</span>
            </div>
          </div>
        </div>
      )}

      {/* SALES OVERVIEW & CHARTS */}
      <div className="bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 space-y-6 text-left">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#D4AF37] rounded-sm" />
            <h2 className="text-lg font-instrumentserif tracking-wider text-white uppercase font-bold">Sales Overview</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] text-slate-300 font-mono">Product Type:</span>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="bg-[#081A42] border border-[#081A42]/50 rounded px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-[#D4AF37] max-w-full"
            >
              <option value="All">All Products</option>
              <option value="Shirts">Shirts</option>
              <option value="Towels">Towels</option>
            </select>
          </div>
        </div>

        {salesData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 border-b border-[#081A42]/30 pb-6">
            <div className="bg-[#081A42]/30 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Sales</span>
              <span className="text-[17px] font-bold font-mono text-white block mt-1">₹{salesData.summary.totalSales.toLocaleString()}</span>
            </div>
            <div className="bg-[#081A42]/30 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Today's Sales</span>
              <span className="text-[17px] font-bold font-mono text-white block mt-1">₹{salesData.summary.todaySales.toLocaleString()}</span>
            </div>
            <div className="bg-[#081A42]/30 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Weekly Sales</span>
              <span className="text-[17px] font-bold font-mono text-white block mt-1">₹{salesData.summary.weeklySales.toLocaleString()}</span>
            </div>
            <div className="bg-[#081A42]/30 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Monthly Sales</span>
              <span className="text-[17px] font-bold font-mono text-white block mt-1">₹{salesData.summary.monthlySales.toLocaleString()}</span>
            </div>
            <div className="bg-[#081A42]/30 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Yearly Sales</span>
              <span className="text-[17px] font-bold font-mono text-white block mt-1">₹{salesData.summary.yearlySales.toLocaleString()}</span>
            </div>
            <div className="bg-[#081A42]/30 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Avg value (AOV)</span>
              <span className="text-[17px] font-bold font-mono text-white block mt-1">₹{salesData.summary.aov}</span>
            </div>
          </div>
        )}

        {salesData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily Sales Chart */}
            <div className="bg-[#081A42]/30 p-4 rounded-lg space-y-4">
              <span className="text-[13px] uppercase font-mono tracking-wider text-slate-300 block">Daily Sales (Last 7 Days)</span>
              {salesData.charts.dailySales.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-[13px] text-slate-500 italic">No sales recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="h-40 flex items-end justify-between gap-1 pt-6 font-mono text-[9px] relative min-w-[240px]">
                    {salesData.charts.dailySales.map((day: any, idx: number) => {
                      const maxVal = Math.max(...salesData.charts.dailySales.map((d: any) => d.sales)) || 1;
                      const heightPercent = Math.max(5, (day.sales / maxVal) * 80);
                      return (
                        <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[11px] px-1 py-0.5 rounded shadow z-10 whitespace-nowrap">
                            ₹{day.sales}
                          </div>
                          <div
                            className="w-full bg-[#D4AF37] hover:bg-[#E5C158] transition-colors rounded-t-sm"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-slate-400 mt-2 truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="bg-[#081A42]/30 p-4 rounded-lg space-y-4">
              <span className="text-[13px] uppercase font-mono tracking-wider text-slate-300 block">Orders Status Distribution</span>
              <div className="flex flex-col justify-center space-y-2.5">
                {salesData.charts.statusDistribution.map((statusObj: any, idx: number) => {
                  const maxCount = Math.max(...salesData.charts.statusDistribution.map((s: any) => s.count)) || 1;
                  const percent = (statusObj.count / maxCount) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-300 truncate mr-2">{statusObj.status}</span>
                        <span className="text-white font-bold shrink-0">{statusObj.count}</span>
                      </div>
                      <div className="w-full h-2 bg-[#081A42] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Type Distribution */}
            <div className="bg-[#081A42]/30 p-4 rounded-lg space-y-4">
              <span className="text-[13px] uppercase font-mono tracking-wider text-slate-300 block">Product Type Distribution</span>
              <div className="flex flex-col justify-center space-y-3">
                {salesData.charts.typeDistribution.map((typeObj: any, idx: number) => {
                  const maxSales = Math.max(...salesData.charts.typeDistribution.map((t: any) => t.sales)) || 1;
                  const percent = (typeObj.sales / maxSales) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono gap-2">
                        <span className="text-slate-300 truncate">{typeObj.type}</span>
                        <span className="text-white font-bold shrink-0">₹{typeObj.sales.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-[#081A42] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* RECENT ORDERS (Small table only) */}
      <div className="bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 space-y-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#D4AF37] rounded-sm" />
          <h2 className="text-lg font-instrumentserif tracking-wider text-white uppercase font-bold">Recent Orders</h2>
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-[#081A42]/40 bg-[#081A42]/15">
          {loadingOrders ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              <span className="text-[14px] text-slate-400 font-mono">Fetching latest placements...</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center text-[14px] text-slate-400 font-mono">No recent orders.</div>
          ) : (
            <table className="w-full text-left border-collapse font-mono text-[13px] min-w-[600px]">
              <thead>
                <tr className="bg-[#081A42] text-[10px] uppercase tracking-wider text-slate-300 border-b border-[#081A42]/50">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#081A42]/30">
                {recentOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-[#081A42]/10 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#D4AF37]">{order.order_number}</td>
                    <td className="py-3 px-4 text-slate-200">{order.customer_name || "N/A"}</td>
                    <td className="py-3 px-4 text-white font-bold">₹{order.grand_total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-300 uppercase font-bold text-[10px]">{getOrderStatusLabel(order.order_status)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrderId(order.order_id)}
                        className="bg-[#081A42] hover:bg-[#081A42]/80 text-[#D4AF37] text-[11px] px-2.5 py-1 rounded transition-all border border-[#081A42]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* REFACTORED ORDER DETAILS MODAL (Vertical Independent Cards Stack) */}
      {selectedOrderId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-[#102554] border border-[#081A42]/50 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="bg-[#081A42] px-6 py-4 flex justify-between items-center border-b border-[#081A42]/50">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] font-instrumentserif uppercase tracking-wider">
                  Order Details Dashboard
                </h3>
                {selectedOrder && (
                  <p className="text-[14px] text-slate-300 font-mono">
                    Order Number: <span className="text-white font-bold">{selectedOrder.order_number}</span> | Placed: {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Spaced vertical cards */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#081A42]/15">
               {loadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[14px] text-slate-400 font-mono">Fetching full specifications...</span>
                </div>
              ) : detailsError ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="text-[15px] font-semibold text-red-400">{detailsError}</span>
                  <button
                    onClick={() => selectedOrderId && fetchOrderDetail(selectedOrderId)}
                    className="mt-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#e5c158] text-[#081A42] font-bold text-[14px] uppercase rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : !selectedOrder ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <span className="text-[14px] text-slate-400 font-mono">No order loaded.</span>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {/* Card 2: Ordered Products */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                    <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2">
                      Ordered Products
                    </h4>
                    <div className="divide-y divide-[#081A42]/30">
                      {selectedOrder.products.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                          <div className="w-12 h-14 bg-[#FAF0E4]/10 rounded-md shrink-0 overflow-hidden relative">
                            <img
                              src={item.product_image?.startsWith("/uploads") ? `${API_URL}${item.product_image}` : (item.product_image || "/images/profile/profile-img.webp")}
                              alt={item.product_name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="grow text-left font-mono">
                            <p className="text-[14px] font-bold text-white leading-snug">{item.product_name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-300 mt-1">
                              <span>Price: ₹{item.price}</span>
                              <span>Qty: {item.quantity}</span>
                              {item.fit_style && <span>Fit: {item.fit_style}</span>}
                              {item.selected_size && <span>Size: {item.selected_size}</span>}
                              {item.selected_length && <span>Standard Size: {item.selected_length}</span>}
                              {item.selected_sleeve && <span>Sleeve: {item.selected_sleeve}</span>}
                            </div>
                            {item.custom_measurement && (
                              <p className="text-[9px] text-yellow-400 mt-0.5">Custom Measure: {formatCustomMeasurement(item.custom_measurement)}</p>
                            )}
                            {item.monogram && (
                              <div className="mt-2 p-2 border border-[#D4AF37]/30 bg-[#081A42]/50 rounded-md text-[11px] text-slate-300">
                                <span className="text-[#D4AF37] font-semibold block mb-1">
                                  {item.monogram.upload_file ? "Uploaded Monogram" : "Monogram Selection"}
                                </span>
                                {item.monogram.upload_file ? (
                                  <div className="flex justify-between items-center bg-[#05112B]/40 p-2 rounded border border-white/5 mb-1.5">
                                    <span className="font-mono text-[11px] text-white/70 truncate flex-1 mr-4">
                                      {item.monogram.upload_file.split('-').pop()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-2">
                                        <a
                                          href={`${API_URL}${item.monogram.upload_file}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[9px] font-bold tracking-widest uppercase text-[#D4AF37] hover:text-[#E5C158] bg-[#D4AF37]/10 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                                        >
                                          VIEW FILE
                                        </a>
                                        <a
                                          href={`${API_URL}${item.monogram.upload_file}`}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[9px] font-bold tracking-widest uppercase text-[#081A42] bg-[#D4AF37] hover:bg-[#E5C158] border border-[#D4AF37]/50 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                                        >
                                          DOWNLOAD
                                        </a>
                                      </div>
                                      <button
                                        onClick={() => handleDownload(`${API_URL}${item.monogram.upload_file}`, item.monogram.upload_file.split('-').pop() || "download")}
                                        className="text-[9px] font-bold tracking-widest uppercase text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                                      >
                                        DOWNLOAD
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-1.5">
                                    <span>Text: <span className="text-white">{item.monogram.text}</span></span>
                                    <span>Placement: <span className="text-white">{item.monogram.placement}</span></span>
                                    <span>Color: <span className="text-white">{item.monogram.color}</span></span>
                                    <span>Font: <span className="text-white">{item.monogram.font}</span></span>
                                  </div>
                                )}
                                <div className="pt-1 border-t border-white/5">
                                  <span>Extra Charge: <span className="text-white">₹{item.monogram.price}</span></span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right font-mono text-[14px] font-bold text-white shrink-0">
                            ₹{((item.price * (item.selected_length && !item.product_name?.toLowerCase().includes('towel') ? Number(item.selected_length) : 1) + (item.monogram?.price || 0)) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Order Summary (Pricing details) */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3 font-mono text-[14px]">
                    <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2">
                      Order Summary
                    </h4>
                    <div className="space-y-1.5 max-w-sm ml-auto">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subtotal</span>
                        <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">GST (5%)</span>
                        <span className="text-emerald-400 font-bold">Included</span>
                      </div>
                      {selectedOrder.stitching_amount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Stitching Charge</span>
                          <span>₹{selectedOrder.stitching_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Shipping</span>
                        <span>{selectedOrder.shipping_amount === 0 ? "FREE" : `₹${selectedOrder.shipping_amount}`}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-[#081A42]/30 pt-1 text-[#D4AF37] text-[15px]">
                        <span>Grand Total</span>
                        <span>₹{selectedOrder.grand_total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Customer Profile & Delivery Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Customer Profile Details */}
                    <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                      <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Customer Details
                      </h4>
                      <div className="space-y-2 font-mono text-[14px] text-left">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Name</span>
                          <span className="text-white font-semibold">{selectedOrder.address?.fullName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                          <span className="text-white font-semibold">{selectedOrder.customer_email || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Phone</span>
                          <span className="text-white font-semibold">{selectedOrder.address?.mobile || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Details */}
                    <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                      <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Delivery Address
                      </h4>
                      {selectedOrder.address ? (
                        <div className="font-mono text-[14px] leading-relaxed text-slate-300 text-left">
                          <p className="font-bold text-white">{selectedOrder.address.fullName}</p>
                          <p className="mt-1">{selectedOrder.address.houseBuilding}</p>
                          <p>{selectedOrder.address.streetLocality}</p>
                          {selectedOrder.address.landmark && <p className="text-[10px] text-slate-400">Landmark: {selectedOrder.address.landmark}</p>}
                          <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postalCode}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase">{selectedOrder.address.addressType}</p>
                        </div>
                      ) : (
                        <p className="text-[14px] text-slate-400 italic">No delivery address details.</p>
                      )}
                    </div>

                  </div>

                  {/* Card 5: Payment Details */}
                  {selectedOrder.payment && (
                    <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                      <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" /> Payment Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-[11px] text-left">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Gateway</span>
                          <span className="text-white">{selectedOrder.payment.gateway_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Transaction ID</span>
                          <span className="text-white truncate block">{selectedOrder.payment.transaction_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Method</span>
                          <span className="text-white uppercase">{selectedOrder.payment.payment_method}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Bank Name</span>
                          <span className="text-white">{selectedOrder.payment.bank_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Amount</span>
                          <span className="text-white font-bold">₹{selectedOrder.payment.amount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Payment Status</span>
                          <span className="text-green-400 uppercase font-bold">{selectedOrder.payment.payment_status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 6: Shipment Details */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#081A42]/50 pb-2">
                      <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider">
                        Shipment Details
                      </h4>
                      {selectedOrder.shipment?.tracking_url && (
                        <a
                          href={selectedOrder.shipment.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[14px] text-[#D4AF37] hover:underline flex items-center gap-1 font-mono"
                        >
                          Track shipment <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[14px]">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-300 uppercase">Courier Name</label>
                        <input
                          type="text"
                          placeholder="Courier"
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[14px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-300 uppercase">Tracking Number (AWB)</label>
                        <input
                          type="text"
                          placeholder="AWB Number"
                          value={awbNumber}
                          onChange={(e) => setAwbNumber(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[14px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] text-slate-300 uppercase">Tracking URL</label>
                        <input
                          type="text"
                          placeholder="https://track.url"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[14px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-300 uppercase">Expected Delivery Date</label>
                        <input
                          type="date"
                          value={expectedDelivery}
                          onChange={(e) => setExpectedDelivery(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1 text-[14px] text-white focus:outline-none"
                        />
                      </div>
                      {selectedOrder.order_status !== "CANCELLED" &&
                        selectedOrder.order_status !== "DELIVERED" &&
                        (!selectedOrder.shipment?.awb_number) && (
                          <div className="md:col-span-2 pt-2">
                            <button
                              type="button"
                              disabled={creatingShipment}
                              onClick={handleCreateDelhiveryShipment}
                              className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#081A42] text-[14px] font-bold font-mono py-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {creatingShipment ? "Creating Shipment..." : "Create Delhivery Shipment"}
                            </button>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Card 7: Order Timeline */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-4">
                    <h4 className="font-instrumentserif text-[17px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2">
                      Delivery Progress
                    </h4>
                    <div className="space-y-6 pl-3 relative border-l border-[#081A42]/50 font-mono text-[14px] text-left">
                      {((selectedOrder as any).delivery_timeline || []).map((item: any, idx: number) => {
                        const isCompleted = item.completed;
                        const isActive = item.current;
                        return (
                          <div key={idx} className="relative pl-3 space-y-1">
                            <span 
                              className={`absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                                isCompleted 
                                  ? "bg-[#D4AF37] border-[#D4AF37]" 
                                  : isActive 
                                  ? "bg-transparent border-[#D4AF37] animate-pulse" 
                                  : "bg-[#081A42] border-[#081A42]"
                              }`}
                            />
                            <div className="flex justify-between items-baseline">
                              <span 
                                className={`font-bold text-[11px] uppercase tracking-wide ${
                                  isActive 
                                    ? "text-[#D4AF37]" 
                                    : isCompleted 
                                    ? "text-white" 
                                    : "text-slate-500"
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.timestamp && (
                                <span className="text-[9px] text-slate-400">
                                  {new Date(item.timestamp).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              )}
                            </div>
                            {item.key === "SELLER_PREPARING" && isCompleted && (
                              <p className="text-[10px] text-slate-300">Order received. Preparing package...</p>
                            )}
                            {item.key === "ON_THE_WAY" && isCompleted && (
                              <p className="text-[10px] text-slate-300">Package is in transit with Delhivery.</p>
                            )}
                            {item.key === "OUT_FOR_DELIVERY" && isCompleted && (
                              <p className="text-[10px] text-slate-300">Package is out for delivery today.</p>
                            )}
                            {item.key === "DELIVERED" && isCompleted && (
                              <p className="text-[10px] text-emerald-400 font-bold">Successfully Delivered.</p>
                            )}
                            {item.key === "CANCELLED" && isCompleted && (
                              <p className="text-[10px] text-rose-400 font-bold">Order Cancelled. Refund initiated.</p>
                            )}
                            
                            {/* Display live tracking status directly from courier API */}
                            {isActive && (selectedOrder as any).raw_status && (
                              <p className="text-[10px] uppercase text-[#D4AF37] mt-1 font-bold">
                                Live Status: {(selectedOrder as any).raw_status}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Invoice Printer Action */}
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 bg-[#081A42] hover:bg-[#081A42]/85 text-white text-[14px] py-2.5 rounded-md font-mono font-bold transition-all border border-[#081A42]"
                  >
                    <Printer className="w-4 h-4 text-[#D4AF37]" /> Print Invoice Sheet
                  </button>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#081A42]/30 px-6 py-3 flex justify-end border-t border-[#081A42]/50">
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setSelectedOrder(null);
                }}
                className="bg-[#081A42] hover:bg-[#081A42]/80 text-white px-4 py-2 rounded text-[14px] font-mono font-semibold"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Premium Toast Overlay */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30 animate-slide-in-right" 
            : "bg-red-950/90 text-red-400 border-red-500/30 animate-slide-in-right"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
