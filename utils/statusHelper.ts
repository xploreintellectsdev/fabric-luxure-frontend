export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; timelineIndex: number }
> = {
  ORDER_PLACED: {
    label: "Order Placed",
    timelineIndex: 0,
  },
  SELLER_PREPARING: {
    label: "Seller Preparing your Order",
    timelineIndex: 1,
  },
  ON_THE_WAY: {
    label: "On the Way",
    timelineIndex: 2,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    timelineIndex: 3,
  },
  DELIVERED: {
    label: "Delivered",
    timelineIndex: 4,
  },
  CANCELLED: {
    label: "Cancelled",
    timelineIndex: -1,
  },
};

export const getOrderStatusLabel = (status: string): string => {
  const cleanStatus = (status || "").toUpperCase().trim();
  return ORDER_STATUS_CONFIG[cleanStatus]?.label || status;
};

export const getStatusStageIndex = (status: string): number => {
  const cleanStatus = (status || "").toUpperCase().trim();
  return ORDER_STATUS_CONFIG[cleanStatus]?.timelineIndex ?? -1;
};
