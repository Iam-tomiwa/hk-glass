export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AddonCategory {}
export interface AddonCreate {
  name: string;
  category?: AddonCategory | any | null;
  price_type: AddonPriceType;
  price: number | string | null;
  is_active?: boolean;
}

export interface AddonPriceType {}

export interface AddonResponse {
  id: string;
  name: string;
  category: AddonCategory;
  price_type: AddonPriceType;
  price: string;
  is_active: boolean;
}

export interface AddonUpdate {
  name?: string | any | null;
  category?: AddonCategory | any | null;
  price_type?: AddonPriceType | any | null;
  price?: number | string | any | null;
  is_active?: boolean | any | null;
}

export interface AdminDeviceCreate {
  name: string;
  is_active?: boolean;
}

export interface AdminRecoveryRequest {
  email: string;
  password: string;
  otp_code?: string | any | null;
  recovery_code?: string | any | null;
}

export interface CombinedDeviceResponse {
  id: string;
  device_type: string;
  name: string;
  email?: string | any | null;
  is_active: boolean;
  last_ip?: string | any | null;
  device_fingerprint?: string | any | null;
  last_used_at?: string | any | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardOrderResponse {
  id: string;
  order_reference?: string | any | null;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  order_status: string;
  created_at: string;
}

export interface DashboardSummaryResponse {
  total_orders: number;
  paid_orders: number;
  total_revenue: string;
  todays_sales: string;
  in_production: number;
  completed: number;
  ready_pickup: number;
}

export interface DeviceResponse {
  id: string;
  name: string;
  email?: string | any | null;
  is_active: boolean;
  last_ip?: string | any | null;
  device_fingerprint?: string | any | null;
  last_used_at?: string | any | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceSetupResponse {
  device_id: string;
  setup_code: string;
  setup_url?: string | any | null;
}

export interface GlassTypeCreate {
  name: string;
  price_per_sqm: number | string | null;
}

export interface GlassTypeResponse {
  id: string;
  name: string;
  price_per_sqm: string;
}

export interface GlassTypeUpdate {
  name?: string | any | null;
  price_per_sqm?: number | string | any | null;
}

export interface InventoryAdjustRequest {
  adjustment: number;
  reason?: string | any | null;
}

export interface InventoryItemCreate {
  material_name: string;
  size?: string | any | null;
  thickness?: string | any | null;
  unit?: string | any | null;
  stock_count?: number;
  low_stock_threshold?: number;
}

export interface InventoryItemResponse {
  id: string;
  material_name: string;
  size?: string | any | null;
  thickness?: string | any | null;
  unit?: string | any | null;
  stock_count: number;
  low_stock_threshold: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemUpdate {
  material_name?: string | any | null;
  size?: string | any | null;
  thickness?: string | any | null;
  unit?: string | any | null;
  stock_count?: number | any | null;
  low_stock_threshold?: number | any | null;
}

export interface OrderAddonResponse {
  addon: AddonResponse;
  calculated_price: string;
}

export interface OrderCreate {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  width: number | string | null;
  height: number | string | null;
  sheet_size?: string | any | null;
  thickness?: string | any | null;
  drill_holes_count?: number | any | null;
  hole_diameter?: number | string | any | null;
  tint_type?: string | any | null;
  engraving_text?: string | any | null;
  glass_type_id: string;
  addon_ids?: string[];
  insurance_selected?: boolean;
}

export interface OrderResponse {
  id: string;
  order_reference?: string | any | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  width: string;
  height: string;
  area: string;
  sheet_size?: string | any | null;
  thickness?: string | any | null;
  drill_holes_count?: number | any | null;
  hole_diameter?: string | any | null;
  tint_type?: string | any | null;
  engraving_text?: string | any | null;
  subtotal_amount: string;
  tax_amount: string;
  insurance_amount: string;
  total_amount: string;
  order_status: string;
  production_started_at?: string | any | null;
  ready_pickup_at?: string | any | null;
  completed_at?: string | any | null;
  payment_status: string;
  insurance_selected: boolean;
  qr_code_token?: string | any | null;
  glass_type: GlassTypeResponse;
  addons: OrderAddonResponse[];
  created_at: string;
  updated_at: string;
  created_by_user: UserResponse;
}

export interface OrderStatus {}

export interface OrderStatusUpdate {
  order_status: string;
}

export interface OrderUpdate {
  customer_name?: string | any | null;
  customer_email?: string | any | null;
  customer_phone?: string | any | null;
  width?: number | string | any | null;
  height?: number | string | any | null;
  sheet_size?: string | any | null;
  thickness?: string | any | null;
  drill_holes_count?: number | any | null;
  hole_diameter?: number | string | any | null;
  tint_type?: string | any | null;
  engraving_text?: string | any | null;
  glass_type_id?: string | any | null;
  addon_ids?: string[] | any | null;
  order_status?: string | any | null;
  insurance_selected?: boolean | any | null;
}

export interface PaymentInitResponse {
  authorization_url: string;
  reference: string;
}

export interface PaymentInitialize {
  order_id: string;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  paystack_reference: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface PaymentStatus {}

export interface PaystackCallback {
  reference: string;
}

export interface PricingSettingsResponse {
  tax_rate: string;
  insurance_rate: string;
}

export interface PricingSettingsUpdate {
  tax_rate?: number | string | any | null;
  insurance_rate?: number | string | any | null;
}

export interface RecoveryCodeGenerateResponse {
  codes: string[];
}

export interface RecoveryCodeItem {
  code_hint: string;
  used_at?: string | any | null;
}

export interface RecoveryCodeStatusResponse {
  total: number;
  unused: number;
  codes: RecoveryCodeItem[];
}

export interface StaffDeviceCreate {
  name: string;
  email?: string | any | null;
  is_active?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface TotpConfirmRequest {
  otp_code: string;
}

export interface TotpSetupResponse {
  otpauth_url: string;
  secret: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_2fa_enabled: boolean;
}

export interface UserRole {}
