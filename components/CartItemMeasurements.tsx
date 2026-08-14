"use client";
import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CartItemMeasurements({ productType, fitStyle, sizeName }: { productType: string; fitStyle: string; sizeName: string }) {
  const [measurements, setMeasurements] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchMeasurements = async () => {
      try {
        const pType = productType || 'Shirt';
        const res = await fetch(`${API_URL}/api/admin/size-charts/active?product_type=${pType}&fitStyle=${fitStyle}`);
        const data = await res.json();
        if (active && res.ok && data.success && data.data) {
          const matched = data.data.find((row: any) => row.size_name.toLowerCase() === sizeName.toLowerCase());
          if (matched) {
            setMeasurements(matched);
          }
        }
      } catch (err) {
        console.error("Error fetching size measurements:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMeasurements();
    return () => {
      active = false;
    };
  }, [productType, fitStyle, sizeName]);

  if (loading || !measurements) return null;

  const pType = (productType || "").toLowerCase();
  const isPant = pType === "pant" || pType === "pants";
  const isShorts = pType === "shorts" || pType === "short";
  const isBlazer = pType === "blazer" || pType === "blazers";

  return (
    <div className="w-full text-[11px] sm:text-xs text-Pinball/70 mt-1 flex flex-wrap gap-x-1.5 gap-y-1 items-center normal-case font-normal font-sans">
      {isBlazer ? (
        <>
          <span>Shoulder: {Number(measurements.shoulder).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Chest: {Number(measurements.chest).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Shirt Length: {Number(measurements.shirt_length || measurements.length).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Sleeve Length: {Number(measurements.sleeve_length || measurements.sleeve).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Mid Section: {Number(measurements.mid_section || measurements.waist).toFixed(2)}"</span>
        </>
      ) : isPant || isShorts ? (
        <>
          <span>Waist: {Number(measurements.waist).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Inseam: {Number(measurements.inseam).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Hip: {Number(measurements.hip).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Thigh: {Number(measurements.thigh).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          {!isShorts && (
            <>
              <span>Knee: {Number(measurements.knee).toFixed(2)}"</span>
              <span className="text-[#D3D3D3]/20">|</span>
            </>
          )}
          <span>Leg Opening: {Number(measurements.leg_opening).toFixed(2)}"</span>
        </>
      ) : (
        <>
          <span>Chest: {Number(measurements.chest).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Length: {Number(measurements.length).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Shoulder: {Number(measurements.shoulder).toFixed(2)}"</span>
          <span className="text-[#D3D3D3]/20">|</span>
          <span>Sleeve: {Number(measurements.sleeve).toFixed(2)}"</span>
        </>
      )}
    </div>
  );
}
