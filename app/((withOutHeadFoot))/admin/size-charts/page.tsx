"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";
import DynamicSizeChartModal, { SizeChartRow } from "../components/DynamicSizeChartModal";
import { getActivities, setActivities } from "../data/mockStore";
import { confirmAction } from '../../../../utils/modalUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProductType {
  pro_type_id: number;
  product_type: string;
}

interface FitStyle {
  fit_style_id: number;
  pro_type_id: number;
  fit_style_name: string;
}

export default function SizeChartsPage() {
  const [sizes, setSizes] = useState<SizeChartRow[]>([]);
  const [measurementColumns, setMeasurementColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [fitStyles, setFitStyles] = useState<FitStyle[]>([]);
  
  const [selectedProTypeId, setSelectedProTypeId] = useState<number | null>(null);
  const [selectedFitStyleId, setSelectedFitStyleId] = useState<number | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSizeRow, setSelectedSizeRow] = useState<SizeChartRow | null>(null);



  const fetchProductTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/product-types`);
      const data = await res.json();
      if (res.ok && data.success) {
        const pts = data.data;
        setProductTypes(pts);
        if (pts.length > 0) {
          setSelectedProTypeId(pts[0].pro_type_id);
        }
      }
    } catch (err) {
      console.error("Failed to load product types", err);
    }
  };

  const fetchFitStyles = async (pro_type_id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/fit-styles/active/${pro_type_id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFitStyles(data.fitStyles);
        if (data.fitStyles.length > 0) {
          setSelectedFitStyleId(data.fitStyles[0].fit_style_id);
        } else {
          setSelectedFitStyleId(null);
        }
      }
    } catch (err) {
      console.error("Failed to load fit styles", err);
    }
  };

  const getProductTypeName = () => {
    return productTypes.find(p => p.pro_type_id === selectedProTypeId)?.product_type || "";
  };

  const fetchSizes = async () => {
    if (!selectedProTypeId) return;
    try {
      setLoading(true);
      let url = `${API_URL}/api/admin/size-charts?pro_type_id=${selectedProTypeId}&product_type=${getProductTypeName()}`;
      if (selectedFitStyleId) {
        url += `&fit_style_id=${selectedFitStyleId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setSizes(data.data || []);
        setMeasurementColumns(data.columns || []);
      } else {
        toast.error(data.error || "Failed to load size chart items.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  useEffect(() => {
    if (selectedProTypeId) {
      fetchFitStyles(selectedProTypeId);
    }
  }, [selectedProTypeId]);

  useEffect(() => {
    if (selectedProTypeId) {
      fetchSizes();
    }
  }, [selectedProTypeId, selectedFitStyleId]);

  const handleSave = async (sizeData: Omit<SizeChartRow, "size_chart_id">) => {
    try {
      const isEdit = selectedSizeRow !== null;
      const url = isEdit
        ? `${API_URL}/api/admin/size-charts/${selectedSizeRow?.size_chart_id}`
        : `${API_URL}/api/admin/size-charts`;

      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...sizeData,
        product_type: getProductTypeName()
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Size ${isEdit ? "updated" : "created"} successfully`);
        setIsModalOpen(false);
        fetchSizes();

        const act = getActivities();
        setActivities([
          {
            id: `act-${Date.now()}`,
            user: "Admin",
            action: `${isEdit ? "Updated" : "Created"} size chart option '${sizeData.size_name}'`,
            time: "Just now",
          },
          ...act,
        ]);
      } else {
        toast.error(data.error || "Failed to save size record.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };

  const handleDeleteTrigger = async (id: number, name: string) => {
    const confirmed = await confirmAction(
      "Delete Size Chart Row?",
      "Deleting this record will not remove any existing products that reference it. It will simply be hidden from future selections.",
      "Delete"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/size-charts/${id}?product_type=${getProductTypeName()}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Size option deleted successfully");
        fetchSizes();
      } else {
        toast.error(data.error || "Failed to delete size option.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error.");
    }
  };



  const getFitStyleName = () => {
    return fitStyles.find(f => f.fit_style_id === selectedFitStyleId)?.fit_style_name || "";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full px-3.5 sm:px-6">
      {/* Title Header Card */}
      <div className="shrink-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#102554] p-4 sm:p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-2xl sm:text-3xl font-normal uppercase tracking-wider text-white">
            SIZE CHARTS
          </h2>
          <p className="text-xs sm:text-[14px] text-[#D3D3D3]/80 font-sans">Manage dynamic sizes across all product types.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          {/* Dropdown filters */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
            <label className="text-[12px] sm:text-[14px] uppercase tracking-widest font-mono text-[#D4AF37] whitespace-nowrap">Product:</label>
            <select
              value={selectedProTypeId || ""}
              onChange={(e) => setSelectedProTypeId(Number(e.target.value))}
              className="px-3 py-2 text-xs sm:text-[14px] font-semibold rounded-md border border-[#102554] bg-[#08142c] text-light focus:outline-none focus:border-[#D4AF37] cursor-pointer w-full sm:w-auto"
            >
              {productTypes.map(p => (
                <option key={p.pro_type_id} value={p.pro_type_id}>{p.product_type}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
            <label className="text-[12px] sm:text-[14px] uppercase tracking-widest font-mono text-[#D4AF37] whitespace-nowrap">Fit Style:</label>
            <select
              value={selectedFitStyleId || ""}
              onChange={(e) => setSelectedFitStyleId(Number(e.target.value))}
              className="px-3 py-2 text-xs sm:text-[14px] font-semibold rounded-md border border-[#102554] bg-[#08142c] text-light focus:outline-none focus:border-[#D4AF37] cursor-pointer w-full sm:w-auto"
              disabled={fitStyles.length === 0}
            >
              {fitStyles.map(f => (
                <option key={f.fit_style_id} value={f.fit_style_id}>{f.fit_style_name}</option>
              ))}
              {fitStyles.length === 0 && <option value="">No fit styles</option>}
            </select>
          </div>
          <button
            onClick={() => {
              setSelectedSizeRow(null);
              setIsModalOpen(true);
            }}
            disabled={!selectedProTypeId || !selectedFitStyleId}
            className="flex items-center justify-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add Size
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-[#102554] rounded-xl border border-[#081A42]/50 overflow-hidden">
        <div className="flex-1 overflow-auto w-full">
          <table className="w-full min-w-[800px] lg:min-w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#081A42]">
              <tr className="border-b border-[#081A42]/50">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 w-16 text-center">ID</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60">Product Type</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60">Fit Style</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60">Size Name</th>
                {measurementColumns.map((col) => (
                  <th key={col} className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 text-center">Display Order</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 text-center">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-[#D3D3D3]/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizes.length > 0 ? (
                sizes.map((row) => (
                  <tr key={row.size_chart_id} className="border-b border-[#081A42]/30 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-sm text-[#D3D3D3]/50 text-center font-mono">
                      {row.size_chart_id}
                    </td>
                    <td className="py-4 px-6 text-[15px] font-medium text-white">
                      {(row as any).product_type_name || getProductTypeName()}
                    </td>
                    <td className="py-4 px-6 text-[15px] font-medium text-white">
                      {(row as any).fit_style_name || getFitStyleName()}
                    </td>
                    <td className="py-4 px-6 text-[15px] font-medium text-white">
                      {row.size_name}
                    </td>
                    {measurementColumns.map((col) => (
                      <td key={col} className="py-4 px-6 text-[15px] font-medium text-white">
                        {(row as any)[col]}
                      </td>
                    ))}
                    <td className="py-4 px-6 text-[15px] font-medium text-white text-center">
                      {row.display_order}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        row.is_active 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedSizeRow(row);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(row.size_chart_id!, row.size_name)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-[#D3D3D3]/50 text-[14px]">
                    {loading ? "Loading sizes..." : "No sizes found for the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DynamicSizeChartModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSizeRow(null);
        }}
        onSave={handleSave}
        initialData={selectedSizeRow}
        proTypeId={selectedProTypeId!}
        fitStyleId={selectedFitStyleId!}
        productTypeName={getProductTypeName()}
        fitStyleName={getFitStyleName()}
        measurementColumns={measurementColumns}
      />
    </div>
  );
}
