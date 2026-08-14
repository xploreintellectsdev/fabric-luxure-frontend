export interface PricingCartItem {
  price?: number | string;
  quantity?: number | string;
  pro_type_name?: string;
  selected_meter?: string | number | null;
  monogram?: {
    enabled: boolean;
    extra_price?: number | string;
  } | null;
  monogram_enabled?: boolean | number;
  monogram_price?: number | string;
  stitching_price?: number | string | null;
  [key: string]: any;
}

export interface PricingItemResult {
  baseItemPrice: number;
  monogramPrice: number;
  totalItemPrice: number;
  qty: number;
}

export interface OrderSummaryResult {
  subtotal: number;
  stitching: number;
  shipping: number | "FREE";
  grandTotal: number;
}

export function calculateItemPrice(item: PricingCartItem): PricingItemResult {
  const basePrice = Number(item.price) || 0;
  const qty = Number(item.quantity) || 1;
  const proTypeName = (item.pro_type_name || "").toLowerCase();

  const isFabric = proTypeName.includes('fabric');
  const isTowel = proTypeName.includes('towel');

  let monogramPrice = 0;
  if (!isTowel && !isFabric) {
    if ((item.monogram && item.monogram.enabled) || item.monogram_enabled) {
      monogramPrice = Number(item.monogram?.extra_price || item.monogram_price) || 0;
    }
  }

  // 1. Fabric Pricing
  if (isFabric) {
    // Fabric logic: Price Per Meter * (Selected Length * Quantity)
    const length = Number(item.selected_meter) || 1;
    const totalMeters = length * qty;
    const finalPrice = basePrice * totalMeters;

    return {
      baseItemPrice: finalPrice,
      monogramPrice: 0,
      totalItemPrice: finalPrice,
      qty: qty
    };
  }

  // 2. Towel Pricing
  if (isTowel) {
    // Towel logic: Price * Quantity (no meter, no monogram)
    const finalPrice = basePrice * qty;
    return {
      baseItemPrice: finalPrice,
      monogramPrice: 0,
      totalItemPrice: finalPrice,
      qty: qty
    };
  }

  // 3. Shirt, Pant, Shorts, Blazer Pricing
  const totalBase = basePrice * qty;
  const totalMonogram = monogramPrice * qty;

  return {
    baseItemPrice: totalBase,
    monogramPrice: totalMonogram,
    totalItemPrice: totalBase + totalMonogram,
    qty: qty
  };
}

export function calculateOrderSummary(cartItems: PricingCartItem[]): OrderSummaryResult {
  let subtotal = 0;
  let stitchingTotal = 0;

  for (const item of cartItems) {
    const res = calculateItemPrice(item);
    subtotal += res.totalItemPrice;

    // Fixed stitching charge
    const stitchingCharge = Number(item.stitching_price) || 0;
    if (stitchingCharge > 0) {
      stitchingTotal += (stitchingCharge * res.qty);
    }
  }

  const stitching = Number(stitchingTotal.toFixed(2));

  // SHIPPING logic - adjust as necessary based on logic (assuming free shipping over certain threshold or not requested)
  // Let's assume standard logic is free shipping over some amount? 
  // No, the user provided exact pricing formula: Final = Base + Monogram. Let's keep existing shipping logic? 
  // No, the existing logic had:
  // let shipping = "FREE"; const shippingCost = 0;
  const shippingStr = "FREE";
  const shippingCost = 0;

  const grandTotal = Number((subtotal + stitching + shippingCost).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    stitching,
    shipping: shippingStr,
    grandTotal
  };
}
