/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type AddonCategory =
  | "edge_surface"
  | "structural"
  | "thermal_film"
  | "decorative"
  | "other";
export interface AddonCreate {
  name: string;
  description?: string | null;
  category?: string | null;
  price_type: string;
  price: number | string | null;
  is_active?: boolean;
}

export type AddonPriceType = "flat" | "per_sqm" | "per_side";

export interface AddonPriceUpdate {
  price_per_unit?: number | string | null;
  price_per_sqm?: number | string | null;
  price_per_side?: number | string | null;
}

export interface AddonResponse {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  price_type: string;
  price: string;
  code?: string | null;
  is_builtin: boolean;
  is_active: boolean;
  display_order?: number | null;
  input_schema?: AddonInputSchema | null;
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
  email?: string | null;
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

export interface AddonInputField {
  key: string;
  label: string;
  type: "select" | "text" | "number" | "file";
  unit?: string | null;
  options?: string[] | null;
}

export interface AddonInputSchema {
  fields: AddonInputField[];
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

export interface TransactionsChartPoint {
  label: string;
  transactions: number;
  total_amount: string;
}

export interface TransactionsChart {
  range: string;
  status: string;
  points: TransactionsChartPoint[];
}

export interface DashboardSummaryResponse {
  total_orders: number;
  paid_orders: number;
  total_revenue: string;
  todays_sales: string;
  in_production: number;
  completed: number;
  ready_pickup: number;
  transactions_chart: TransactionsChart;
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

export interface AddonItem {
  addon_id: string;
  quantity?: number | null;
  custom_input?: string | null;
  notes?: string | null;
}

export interface OrderReviewRequest {
  width: number;
  length: number;
  glass_type_id?: string | null;
  shape_type?: string | null;
  drill_holes_count?: number | null;
  addon_ids?: string[];
  addon_items?: AddonItem[];
  insurance_selected: boolean;
}

export interface OrderReviewResponse {
  area: string;
  subtotal_amount: string;
  tax_amount: string;
  insurance_amount: string;
  total_amount: string;
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

export type InventoryItemType = "glass" | "hardware" | "others";

export interface InventoryItemCreate {
  item_type?: InventoryItemType;
  material_name: string;
  description?: string | null;
  serial_code?: string | null;
  size?: string | null;
  thickness?: string | null;
  unit?: string | null;
  price?: number | string | null;
  unit_price?: number | string | null;
  price_per_sqm?: number | string | null;
  stock_count?: number;
  initial_stock_count?: number | null;
  low_stock_threshold?: number;
}

export interface InventoryItemResponse {
  id: string;
  item_type: InventoryItemType;
  material_name: string;
  description?: string | null;
  serial_code?: string | null;
  size?: string | null;
  thickness?: string | null;
  unit?: string | null;
  price?: string | null;
  unit_price?: string | null;
  price_per_sqm?: string | null;
  stock_count: number;
  initial_stock_count: number;
  low_stock_threshold: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type InventoryGlassSheetStatus =
  | "available"
  | "used"
  | "damaged"
  | "retired";

export interface InventorySerialScanResponse {
  sheet_id: string;
  serial_code: string;
  status: InventoryGlassSheetStatus;
  item_id: string;
  item_name: string;
  item_type: InventoryItemType;
  item_size?: string | null;
  item_thickness?: string | null;
  price_per_sqm?: string | null;
  unit_price?: string | null;
  order_id?: string | null;
  order_reference?: string | null;
  linked_order_id?: string | null;
  linked_order_reference?: string | null;
  damage_reason?: string | null;
  used_at?: string | null;
  damaged_at?: string | null;
}

export interface GlassSheetResponse {
  sheet_id: string;
  serial_code: string;
  status: InventoryGlassSheetStatus;
  order_id?: string | null;
  order_reference?: string | null;
  used_at?: string | null;
  damaged_at?: string | null;
  damage_reason?: string | null;
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

export interface OrderFileUploadResponse {
  file_path: string;
  download_url: string;
}

export interface OrderFileLinksResponse {
  specification_files: OrderFileUploadResponse[];
  engraving_image_files: OrderFileUploadResponse[];
  damage_files?: OrderFileUploadResponse[];
  signature_file?: OrderFileUploadResponse | null;
}

export interface OrderCreate {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  width: number | string | null;
  length: number | string | null;
  sheet_size?: string | any | null;
  thickness?: string | any | null;
  drill_holes_count?: number | any | null;
  hole_diameter?: number | string | any | null;
  tint_type?: string | any | null;
  engraving_text?: string | any | null;
  glass_type_id?: string | null;
  addon_ids?: string[];
  addon_items?: AddonItem[];
  glass_inventory_serial_code?: string | null;
  insurance_selected?: boolean;
  shape_type?: string | null;
  curve_diameter?: number | null;
  custom_shape_spec?: string | null;
  customer_notes?: string | null;
  delivery_method?: string | null;
  delivery_address?: string | null;
  delivery_fee?: number | string | null;
  specification_files?: string[];
  engraving_image_files?: string[];
  signature_file_path?: string | null;
}

export interface OrderResponse {
  id: string;
  order_reference?: string | any | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  width: string;
  length: string;
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
  updated_at?: string;
  created_by_user: UserResponse;
  damage_reported_at?: string | null;
  damage_reason?: string | null;
  damage_notes?: string | null;
  damage_files?: string[];
  shape_type?: string | null;
  curve_diameter?: string | null;
  custom_shape_spec?: string | null;
  customer_notes?: string | null;
  delivery_method?: string | null;
  delivery_address?: string | null;
  delivery_fee?: string | null;
  specification_files?: string[];
  engraving_image_files?: string[];
  signature_file_path?: string | null;
}

export interface OrderDamageReport {
  damage_reason: string;
  damage_notes?: string | null;
  damage_files?: string[] | null;
}

export interface OrderStats {
  total_orders: number;
  in_production: number;
  completed: number;
  ready_pickup: number;
}

export interface NotificationResponse {
  id: string;
  created_at: string;
  audience: string;
  event_type: string;
  title: string;
  message: string;
  order_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  payload: Record<string, any>;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  unread_count: number;
}

export interface NotificationMarkReadResponse {
  notification: NotificationResponse;
}

export interface OrderReviewEmailRequest {
  review_url?: string | null;
}

export interface OrderReviewEmailResponse {
  order_id: string;
  customer_email: string;
  review_url: string | null;
  email_provider_configured: boolean;
}

export interface NotificationUnreadCountResponse {
  unread_count: number;
}

export type OrderStatus =
  | "pending"
  | "in_production"
  | "ready_pickup"
  | "completed";

export interface OrderStatusUpdate {
  order_status: OrderStatus;
}

export interface OrderUpdate {
  customer_name?: string | any | null;
  customer_email?: string | any | null;
  customer_phone?: string | any | null;
  width?: number | string | any | null;
  length?: number | string | any | null;
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
  paid_at: string;
}

export type PaymentStatus = object;

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

export type UserRole = object;
