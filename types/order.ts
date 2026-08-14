export type OrderStatus =
  | "ORDER_PLACED"
  | "SELLER_PREPARING"
  | "ON_THE_WAY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface AddressSummary {
  addressId?: number;
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  houseBuilding: string;
  streetLocality: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  addressType: string;
  isDefault?: boolean | number;
}

export interface OrderItem {
  product_name: string;
  product_image: string;
  pro_type_name?: string | null;
  fit_style?: string | null;
  selected_size?: string | null;
  selected_length?: number | string | null;
  selected_sleeve?: string | null;
  custom_measurement?: string | {
    chest?: string;
    length?: string;
    shoulder?: string;
    sleeve?: string;
  } | null;
  quantity: number;
  price?: number;
  monogram?: {
    text?: string | null;
    placement?: string | null;
    color?: string | null;
    font?: string | null;
    price: number;
    upload_file?: string | null;
    file_name?: string | null;
    type?: string | null;
  } | null;
}

export interface Order {
  order_id: number;
  order_number: string;
  order_status: OrderStatus;
  display_status?: string;
  grand_total: number;
  created_at: string;
  expected_delivery: string | null;
  products: OrderItem[];
  address?: AddressSummary | null;
  delivery_timeline?: any[];
  shipment?: {
    awb_number?: string;
    courier_name?: string;
    tracking_url?: string;
    shipment_status?: string;
    expected_delivery?: string | null;
    delivered_date?: string | null;
    last_tracking_sync?: string | null;
  } | null;
  refund_status?: string | null;
  payment?: {
    gateway_name?: string | null;
    transaction_id?: string | null;
    payment_method?: string | null;
    bank_name?: string | null;
    payment_status?: string | null;
    amount?: number | string;
    currency?: string | null;
    payment_type?: "WALLET" | "GATEWAY" | "MIXED";
    wallet_amount?: number;
    gateway_amount?: number;
  } | null;
}

export interface PaymentSummary {
  subtotal: number;
  gst: number;
  stitching: number;
  shipping: number | "FREE";
  grandTotal: number;
}
