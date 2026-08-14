"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  TrendingUp,
  FileText,
  X,
  Printer,
  Save,
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
  customer_name?: string | null;
  customer_phone?: string | null;
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
    custom_measurement: string | null;
    monogram?: {
      text?: string | null;
      placement?: string | null;
      color?: string | null;
      font?: string | null;
      price?: number;
      upload_file?: string | null;
      upload_file_type?: string | null;
    } | null;
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

const EXPORT_FIELDS_SECTIONS = [
  {
    title: "Order Information",
    fields: [
      { id: "order_number", label: "Order Number" },
      { id: "created_at", label: "Placed Date" },
      { id: "subtotal", label: "Subtotal" },
      { id: "gst_amount", label: "GST Amount" },
      { id: "stitching_amount", label: "Stitching Charge" },
      { id: "shipping_amount", label: "Shipping Amount" },
      { id: "grand_total", label: "Grand Total" },
      { id: "order_status", label: "Order Status" },
      { id: "timeline_history", label: "Timeline History Logs" }
    ]
  },
  {
    title: "Product Information",
    fields: [
      { id: "product_name", label: "Product Name" },
      { id: "item_price", label: "Product Price" },
      { id: "item_quantity", label: "Quantity" },
      { id: "fit_style", label: "Fit Style" },
      { id: "selected_sleeve", label: "Sleeve Style" },
      { id: "selected_size", label: "Size" },
      { id: "selected_length", label: "Length (Meters)" },
      { id: "custom_measurement", label: "Custom Measurements" },
      { id: "monogram_text", label: "Monogram Text" },
      { id: "monogram_placement", label: "Monogram Placement" },
      { id: "monogram_font", label: "Monogram Font" },
      { id: "monogram_color", label: "Monogram Color" },
      { id: "monogram_price", label: "Monogram Price" },
      { id: "monogram_file", label: "Monogram File" }
    ]
  },
  {
    title: "Customer Details",
    fields: [
      { id: "customer_name", label: "Customer Name" },
      { id: "customer_email", label: "Customer Email" },
      { id: "customer_mobile", label: "Customer Mobile" }
    ]
  },
  {
    title: "Delivery Address",
    fields: [
      { id: "address_fullName", label: "Address Full Name" },
      { id: "address_mobile", label: "Address Mobile" },
      { id: "address_alternateMobile", label: "Alternate Mobile" },
      { id: "address_houseBuilding", label: "House / Building" },
      { id: "address_streetLocality", label: "Street / Locality" },
      { id: "address_landmark", label: "Landmark" },
      { id: "address_city", label: "City" },
      { id: "address_state", label: "State" },
      { id: "address_postalCode", label: "Postal Code" },
      { id: "address_country", label: "Country" },
      { id: "address_type", label: "Address Type" }
    ]
  },
  {
    title: "Payment Details",
    fields: [
      { id: "payment_gateway", label: "Gateway Name" },
      { id: "payment_transactionId", label: "Transaction ID" },
      { id: "payment_method", label: "Payment Method" },
      { id: "payment_bankName", label: "Bank Name" },
      { id: "payment_amount", label: "Paid Amount" },
      { id: "payment_txnStatus", label: "Payment Status" }
    ]
  },
  {
    title: "Shipment Details",
    fields: [
      { id: "courier_name", label: "Courier Name" },
      { id: "awb_number", label: "AWB Number" },
      { id: "tracking_url", label: "Tracking URL" },
      { id: "expected_delivery", label: "Expected Delivery Date" },
      { id: "delivered_date", label: "Delivered Date" },
      { id: "shipment_status", label: "Shipment Status" }
    ]
  }
];

const handleForceDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'custom_design';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed, opening in new tab:", error);
    window.open(url, '_blank');
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productType, setProductType] = useState("All");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [dateRange, setDateRange] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  // Status updating state on table row
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Modal Edit States (consolidated update)
  const [modalStatusVal, setModalStatusVal] = useState("Confirmed");
  const [modalRemarks, setModalRemarks] = useState("");
  const [updatingModal, setUpdatingModal] = useState(false);

  // Modal Shipment Edit States
  const [courierName, setCourierName] = useState("");
  const [awbNumber, setAwbNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [shippingProvider, setShippingProvider] = useState("");

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCustomMeasurement = (val: any) => {
    if (!val) return "";
    if (typeof val === "object") {
      return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(", ");
    }
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === "object" && parsed !== null) {
        return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(", ");
      }
    } catch (e) { }
    return String(val);
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/orders/admin/list?page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}&status=${status}&payment=${payment}&product_type=${productType}&date_range=${dateRange}`;

      if (dateRange === "Custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalOrdersCount(data.data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Error fetching orders list:", err);
    } finally {
      setLoading(false);
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
        setDetailsError("Access denied. Admin privileges required.");
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
          setShippingProvider("");
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
    if (!selectedOrder) return;
    setIsPrinting(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${selectedOrder.order_id}/invoice-pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        showToast("Failed to download invoice", "error");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${selectedOrder.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      showToast("Error downloading invoice", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrdersList();
    }
  }, [token, page, limit, search, status, payment, productType, dateRange, startDate, endDate]);

  useEffect(() => {
    if (token && selectedOrderId !== null) {
      fetchOrderDetail(selectedOrderId);
    }
  }, [token, selectedOrderId]);

  // Consolidated Update Action for Status and Shipment
  const handleModalUpdateOrder = async () => {
    if (!selectedOrder) return;
    setUpdatingModal(true);
    try {
      // 1. Save Status
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
        showToast(statusData.message || "Failed to save order status.", "error");
        setUpdatingModal(false);
        return;
      }

      // Map order status to derived shipment status for database consistency
      let derivedShipmentStatus = 'Pending';
      if (modalStatusVal === 'Shipped') derivedShipmentStatus = 'Shipped';
      else if (modalStatusVal === 'Delivered') derivedShipmentStatus = 'Delivered';
      else if (modalStatusVal === 'Cancelled') derivedShipmentStatus = 'Cancelled';

      // 2. Save Tracking Details
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
        showToast(shipmentData.message || "Failed to save tracking details.", "error");
        setUpdatingModal(false);
        return;
      }

      // Success
      showToast("Order status & tracking details updated successfully.", "success");
      setModalRemarks("");
      fetchOrdersList();
      fetchOrderDetail(selectedOrder.order_id);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error updating order details.", "error");
    } finally {
      setUpdatingModal(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedOrder) return;
    if (!shippingProvider) {
      showToast("Please select a shipping provider first.", "error");
      return;
    }
    setCreatingShipment(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.order_id}/create-shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_provider: shippingProvider
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Failed to create shipment.", "error");
        return;
      }
      showToast(data.message || "Shipment created successfully.", "success");
      fetchOrdersList();
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

  const openCustomExportModal = () => {
    const allIds = EXPORT_FIELDS_SECTIONS.flatMap(s => s.fields.map(f => f.id));
    setSelectedFields(allIds);
    setShowExportModal(true);
  };

  const triggerExport = async (fieldsToExport: string[], isCustom: boolean) => {
    if (fieldsToExport.length === 0) {
      showToast("Please select at least one field to export", "error");
      return;
    }
    setExporting(true);
    try {
      let url = `${API_URL}/api/admin/orders-export/list?search=${encodeURIComponent(
        search
      )}&status=${status}&payment=${payment}&product_type=${productType}&date_range=${dateRange}`;

      if (dateRange === "Custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Failed to fetch export data", "error");
        return;
      }

      const records = data.data;
      if (records.length === 0) {
        showToast("No orders match the current filters.", "error");
        return;
      }

      // Map field ids to their labels for CSV headers
      const fieldMap = EXPORT_FIELDS_SECTIONS.flatMap(s => s.fields).reduce((acc, f) => {
        acc[f.id] = f.label;
        return acc;
      }, {} as Record<string, string>);

      const headers = fieldsToExport.map(id => fieldMap[id] || id);
      
      const rows = records.map((r: any) => {
        return fieldsToExport.map(id => {
          let val = r[id];
          if (val === null || val === undefined) {
            return "N/A";
          }
          if (id === "created_at" || id === "expected_delivery" || id === "delivered_date") {
            return new Date(val).toLocaleDateString();
          }
          if (id === "custom_measurement") {
            return formatCustomMeasurement(val);
          }
          return String(val);
        });
      });

      // Generate CSV string using safe Blob method
      const csvHeaders = headers.join(",");
      const csvRows = rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
      const csvString = `${csvHeaders}\n${csvRows}`;
      
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: "text/csv;charset=utf-8;" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${isCustom ? 'custom_orders_export' : 'orders_export'}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      if (isCustom) {
        setShowExportModal(false);
      }
      showToast("CSV report downloaded successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to export orders", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white w-full relative">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left print:hidden">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-instrumentserif text-3xl text-white tracking-wide scale-y-110">Orders Directory</h1>
          <p className="text-[15px] text-slate-300 font-mono">Filter, export, search, and manage active order shipments.</p>
        </div>
      </div>

      {/* FILTER & ORDERS TABLE SECTION */}
      <div className="bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 space-y-6 text-left print:hidden">

        {/* Controls block */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-[#D4AF37] rounded-sm" />
              <h2 className="text-lg font-instrumentserif tracking-wider text-white uppercase font-bold">Orders</h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                disabled={exporting}
                onClick={() => {
                  const allIds = EXPORT_FIELDS_SECTIONS.flatMap(s => s.fields.map(f => f.id));
                  triggerExport(allIds, false);
                }}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-[#081A42] hover:bg-[#081A42]/80 text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-md font-mono text-[14px] font-semibold transition-all disabled:opacity-50 h-10 cursor-pointer"
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export CSV
              </button>
              <button
                onClick={openCustomExportModal}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#081A42] px-4 py-2 rounded-md font-mono text-[14px] font-bold transition-all h-10 cursor-pointer"
              >
                Custom Export
              </button>
            </div>
          </div>

          {/* Search bar & filters */}
          <div className="grid grid-cols-1 gap-4">

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search by order #, customer, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#081A42] border border-[#081A42]/50 rounded-md pl-10 pr-4 py-2.5 text-[15px] text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Custom Date Picker Inputs */}
          {dateRange === "Custom" && (
            <div className="flex items-center gap-4 bg-[#081A42]/30 p-3 rounded-lg border border-[#081A42]/50 w-fit font-mono text-[15px]">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-slate-300">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#081A42] border border-[#081A42]/50 rounded px-2 py-1 text-[15px] text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-slate-300">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#081A42] border border-[#081A42]/50 rounded px-2 py-1 text-[15px] text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Orders Table */}
        <div className="w-full overflow-x-auto rounded-lg border border-[#081A42]/40 bg-[#081A42]/15">
          {loading ? (
            /* Skeleton Loading State */
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                  <div className="h-6 w-24 bg-[#081A42] rounded" />
                  <div className="h-6 flex-1 bg-[#081A42] rounded" />
                  <div className="h-6 w-16 bg-[#081A42] rounded" />
                  <div className="h-6 w-20 bg-[#081A42] rounded" />
                  <div className="h-6 w-24 bg-[#081A42] rounded" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <ClipboardList className="w-16 h-16 text-slate-500 animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-instrumentserif text-2xl text-[#D4AF37]">No Orders Found</h3>
                <p className="text-[15px] text-slate-400 font-mono">Try adjusting search keywords or active filters.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#081A42] text-[15px] uppercase font-mono tracking-wider text-slate-300 border-b border-[#081A42]/50">
                  <th className="py-3.5 px-4">Order Number</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4 text-center">Product Count</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Shipment Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[15px] font-mono divide-y divide-[#081A42]/30">
                {orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-[#081A42]/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                      <span className="cursor-pointer text-[#D4AF37] hover:underline" onClick={() => handleCopyOrderNumber(order.order_number)}>
                        {order.order_number}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-slate-200">
                      <div className="font-semibold">{order.customer_name || "N/A"}</div>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-200">{order.products_count}</td>
                    <td className="py-4 px-4 text-white font-bold">₹{order.grand_total.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[15px] font-semibold uppercase ${order.payment_status === "Paid"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 uppercase font-bold text-[15px]">
                      {getOrderStatusLabel(order.order_status)}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <span className="text-[15px]">{order.shipment_status || "Pending"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.order_id)}
                          className="flex items-center gap-1.5 bg-[#081A42] hover:bg-[#081A42]/80 text-[#D4AF37] text-[15px] px-3 py-1.5 rounded transition-all font-mono border border-[#081A42]"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[15px] pt-4 border-t border-[#081A42]/20">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#081A42] border border-[#081A42]/50 rounded px-2 py-1 text-white"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <span className="text-slate-400">Total orders: {totalOrdersCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded bg-[#081A42] hover:bg-[#081A42]/80 text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded bg-[#081A42] hover:bg-[#081A42]/80 text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* LARGE ORDER DETAILS MODAL (Vertical Stack of Independent Cards) */}
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
                  <p className="text-[15px] text-slate-300 font-mono">
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

            {/* Modal Body: Spaced vertical cards stack */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#081A42]/15">
              {loadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[15px] text-slate-400 font-mono">Fetching full specifications...</span>
                </div>
              ) : detailsError ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="text-[15px] font-semibold text-red-400">{detailsError}</span>
                  <button
                    onClick={() => selectedOrderId && fetchOrderDetail(selectedOrderId)}
                    className="mt-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#e5c158] text-[#081A42] font-bold text-[15px] uppercase rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : !selectedOrder ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <span className="text-[15px] text-slate-400 font-mono">No order loaded.</span>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {/* Card 2: Ordered Products */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                    <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2">
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
                            <p className="text-[15px] font-bold text-white leading-snug">{item.product_name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[15px] text-slate-300 mt-1">
                              <span>Price: ₹{item.price}</span>
                              <span>Qty: {item.quantity}</span>
                              {item.fit_style && <span>Fit: {item.fit_style}</span>}
                              {item.selected_size && <span>Size: {item.selected_size}</span>}
                              {item.selected_length && <span>Length: {item.selected_length}m</span>}
                            </div>
                            {item.custom_measurement && (
                              <p className="text-[15px] text-yellow-400 mt-0.5">Custom Measure: {formatCustomMeasurement(item.custom_measurement)}</p>
                            )}
                            {item.monogram && (
                              <div className="mt-1 pt-1 border-t border-[#081A42]/50 text-slate-400 text-[14px]">
                                <span className="text-[#D4AF37] font-semibold">Custom Monogram:</span>{" "}
                                {item.monogram.upload_file ? (
                                  <>
                                    Custom Design Included
                                    <div className="inline-flex items-center gap-4 ml-4">
                                      <a
                                        href={item.monogram.upload_file.startsWith('http') ? item.monogram.upload_file : `${API_URL}${item.monogram.upload_file}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline text-xs uppercase tracking-wider font-semibold"
                                      >
                                        View File
                                      </a>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const uploadFile = item.monogram!.upload_file!;
                                          const fileUrl = uploadFile.startsWith('http') ? uploadFile : `${API_URL}${uploadFile}`;
                                          handleForceDownload(fileUrl, uploadFile.split('/').pop() || 'custom-design');
                                        }}
                                        className="text-[#D4AF37] hover:text-[#081A42] hover:bg-[#D4AF37] border border-[#D4AF37]/50 px-3 py-1.5 rounded text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {item.monogram.text && <span className="mr-2">Text: {item.monogram.text}</span>}
                                    {item.monogram.placement && <span className="mr-2">Placement: {item.monogram.placement}</span>}
                                    {item.monogram.font && <span className="mr-2">Font: {item.monogram.font}</span>}
                                    {item.monogram.color && <span className="mr-2">Color: {item.monogram.color}</span>}
                                  </>
                                )}
                                {item.monogram.price ? <span className="ml-2 text-white font-bold">₹{item.monogram.price}</span> : null}
                              </div>
                            )}
                          </div>
                          <div className="text-right font-mono text-[15px] font-bold text-white shrink-0">
                            {(() => {
                                const unitPrice = Number(item.price) + Number(item.monogram?.price || 0);
                                return `₹${(unitPrice * item.quantity).toLocaleString()}`;
                             })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Order Summary (Pricing details) */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3 font-mono text-[15px]">
                    <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2">
                      Order Summary
                    </h4>
                    <div className="space-y-1.5 max-w-sm ml-auto">
                      {(() => {
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Subtotal</span>
                              <span>₹{Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">GST (5%)</span>
                              <span>₹{Number(selectedOrder.gst_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Stitching Charge</span>
                              <span>₹{Number(selectedOrder.stitching_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Shipping</span>
                              <span>{Number(selectedOrder.shipping_amount) === 0 ? "FREE" : `₹${selectedOrder.shipping_amount}`}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-[#081A42]/30 pt-1 text-[#D4AF37] text-[15px]">
                              <span>Grand Total</span>
                              <span>₹{Number(selectedOrder.grand_total || 0).toLocaleString()}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Card 4: Customer Profile & Delivery Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Customer Profile Details */}
                    <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                      <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Customer Details
                      </h4>
                      <div className="space-y-2 font-mono text-[15px] text-left">
                        <div>
                          <span className="text-[15px] text-slate-400 block uppercase">Name</span>
                          <span className="text-white font-semibold">{selectedOrder.customer_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[15px] text-slate-400 block uppercase">Email</span>
                          <span className="text-white font-semibold">{selectedOrder.customer_email || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[15px] text-slate-400 block uppercase">Phone</span>
                          <span className="text-white font-semibold">{selectedOrder.customer_phone || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Details */}
                    <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                      <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Delivery Address
                      </h4>
                      {selectedOrder.address ? (
                        <div className="font-mono text-[15px] leading-relaxed text-slate-300 text-left">
                          <p className="font-bold text-white">{selectedOrder.address.fullName}</p>
                          <p className="mt-1">Phone: {selectedOrder.address.mobile || "N/A"}</p>
                          <p>{selectedOrder.address.houseBuilding}</p>
                          <p>{selectedOrder.address.streetLocality}</p>
                          {selectedOrder.address.landmark && <p className="text-[15px] text-slate-400">Landmark: {selectedOrder.address.landmark}</p>}
                          <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postalCode}</p>
                          <p className="text-[15px] text-slate-400 mt-1 uppercase">{selectedOrder.address.addressType}</p>
                        </div>
                      ) : (
                        <p className="text-[15px] text-slate-400 italic">No delivery address details.</p>
                      )}
                    </div>

                  </div>

                  {/* Card 5: Payment Details */}
                  {selectedOrder.payment && (
                    <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-3">
                      <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" /> Payment Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-[15px] text-left">
                        <div>
                          <span className="text-slate-400 block text-[15px] uppercase">Gateway</span>
                          <span className="text-white">{selectedOrder.payment.gateway_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[15px] uppercase">Transaction ID</span>
                          <span className="text-white truncate block">{selectedOrder.payment.transaction_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[15px] uppercase">Method</span>
                          <span className="text-white uppercase">{selectedOrder.payment.payment_method}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[15px] uppercase">Bank Name</span>
                          <span className="text-white">{selectedOrder.payment.bank_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[15px] uppercase">Amount</span>
                          <span className="text-white font-bold">₹{selectedOrder.payment.amount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[15px] uppercase">Payment Status</span>
                          <span className="text-green-400 uppercase font-bold">{selectedOrder.payment.payment_status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 6: Shipment Details */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#081A42]/50 pb-2">
                      <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider">
                        Shipment Details
                      </h4>
                      {selectedOrder.shipment?.tracking_url && (
                        <a
                          href={selectedOrder.shipment.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] text-[#D4AF37] hover:underline flex items-center gap-1 font-mono"
                        >
                          Track shipment <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[15px]">
                      <div className="space-y-1">
                        <label className="text-[15px] text-slate-300 uppercase">Courier Name</label>
                        <input
                          type="text"
                          placeholder="Courier"
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[15px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[15px] text-slate-300 uppercase">Tracking Number (AWB)</label>
                        <input
                          type="text"
                          placeholder="AWB Number"
                          value={awbNumber}
                          onChange={(e) => setAwbNumber(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[15px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[15px] text-slate-300 uppercase">Tracking URL</label>
                        <input
                          type="text"
                          placeholder="https://track.url"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[15px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[15px] text-slate-300 uppercase">Expected Delivery Date</label>
                        <input
                          type="date"
                          value={expectedDelivery}
                          onChange={(e) => setExpectedDelivery(e.target.value)}
                          className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1 text-[15px] text-white focus:outline-none"
                        />
                      </div>
                      {selectedOrder.order_status !== "CANCELLED" &&
                        selectedOrder.order_status !== "DELIVERED" &&
                        (!selectedOrder.shipment?.awb_number) && (
                          <div className="md:col-span-2 pt-2 space-y-3">
                            <div className="space-y-1">
                              <label className="text-[15px] text-slate-300 uppercase">Select Shipping Provider</label>
                              <select
                                value={shippingProvider}
                                onChange={(e) => setShippingProvider(e.target.value)}
                                className="w-full bg-[#081A42] border border-[#081A42]/50 rounded px-2.5 py-1.5 text-[15px] text-white focus:outline-none"
                              >
                                <option value="" disabled>-- Choose Provider --</option>
                                <option value="DELHIVERY">Delhivery</option>
                                <option value="SHIPROCKET">Shiprocket</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              disabled={creatingShipment}
                              onClick={handleCreateShipment}
                              className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#081A42] text-[15px] font-bold font-mono py-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {creatingShipment ? "Creating Shipment..." : "Create Shipment"}
                            </button>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Card 7: Order Timeline */}
                  <div className="bg-[#102554] p-5 rounded-xl border border-[#081A42]/60 space-y-4">
                    <h4 className="font-instrumentserif text-[15px] text-[#D4AF37] uppercase tracking-wider border-b border-[#081A42]/50 pb-2">
                      Delivery Progress
                    </h4>
                    <div className="space-y-6 pl-3 relative border-l border-[#081A42]/50 font-mono text-[15px] text-left">
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
                                className={`font-bold text-[15px] uppercase tracking-wide ${
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
                                <span className="text-[15px] text-slate-400">
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
                              <p className="text-[15px] text-slate-300">Order received. Preparing package...</p>
                            )}
                            {item.key === "ON_THE_WAY" && isCompleted && (
                              <p className="text-[15px] text-slate-300">Package is in transit with Delhivery.</p>
                            )}
                            {item.key === "OUT_FOR_DELIVERY" && isCompleted && (
                              <p className="text-[15px] text-slate-300">Package is out for delivery today.</p>
                            )}
                            {item.key === "DELIVERED" && isCompleted && (
                              <p className="text-[15px] text-emerald-400 font-bold">Successfully Delivered.</p>
                            )}
                            {item.key === "CANCELLED" && isCompleted && (
                              <p className="text-[15px] text-rose-400 font-bold">Order Cancelled. Refund initiated.</p>
                            )}
                            
                            {/* Display live tracking status directly from courier API */}
                            {isActive && (selectedOrder as any).raw_status && (
                              <p className="text-[13px] uppercase text-[#D4AF37] mt-1 font-bold">
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
                    className="w-full flex items-center justify-center gap-2 bg-[#081A42] hover:bg-[#081A42]/85 text-white text-[15px] py-2.5 rounded-md font-mono font-bold transition-all border border-[#081A42]"
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
                className="bg-[#081A42] hover:bg-[#081A42]/80 text-white px-4 py-2 rounded text-[15px] font-mono font-semibold"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Custom Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-[#102554] border border-[#D4AF37]/30 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left text-white font-mono">
            {/* Header */}
            <div className="bg-[#081A42] px-6 py-4 flex justify-between items-center border-b border-[#081A42]/50">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] font-instrumentserif uppercase tracking-wider">
                  Custom CSV Export Options
                </h3>
                <p className="text-xs text-slate-300">Select fields to customize your exported report structure.</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#081A42]/15">
              {/* Select All / Deselect All */}
              <div className="flex justify-between items-center pb-3 border-b border-[#081A42]/50">
                <span className="text-sm font-semibold">Select Fields to Include:</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const allIds = EXPORT_FIELDS_SECTIONS.flatMap(s => s.fields.map(f => f.id));
                      setSelectedFields(allIds);
                    }}
                    className="text-xs text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedFields([])}
                    className="text-xs text-slate-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of Sections */}
              <div className="space-y-6">
                {EXPORT_FIELDS_SECTIONS.map((section, idx) => (
                  <div key={idx} className="space-y-3 bg-[#102554] p-4 rounded-xl border border-[#081A42]/60">
                    <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wide border-b border-[#081A42]/40 pb-1.5">
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {section.fields.map((field) => {
                        const isChecked = selectedFields.includes(field.id);
                        return (
                          <label key={field.id} className="flex items-center gap-2 cursor-pointer py-1 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFields([...selectedFields, field.id]);
                                } else {
                                  setSelectedFields(selectedFields.filter(id => id !== field.id));
                                }
                              }}
                              className="w-3.5 h-3.5 border border-[#081A42] rounded bg-[#081A42] accent-[#D4AF37] cursor-pointer"
                            />
                            <span className={isChecked ? "text-white font-medium" : "text-slate-400"}>
                              {field.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081A42]/30 px-6 py-4 flex justify-between items-center border-t border-[#081A42]/50">
              <span className="text-xs text-slate-400">
                {selectedFields.length} of {EXPORT_FIELDS_SECTIONS.flatMap(s => s.fields).length} fields selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="bg-[#081A42] hover:bg-[#081A42]/80 text-white px-4 py-2 rounded text-[14px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={exporting}
                  onClick={() => triggerExport(selectedFields, true)}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 disabled:opacity-50 text-[#081A42] font-bold px-5 py-2 rounded text-[14px] flex items-center gap-2 cursor-pointer"
                >
                  {exporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#081A42] border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Toast Overlay */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-[15px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${toast.type === "success"
          ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30 animate-slide-in-right"
          : "bg-red-950/90 text-red-400 border-red-500/30 animate-slide-in-right"
          }`}>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
