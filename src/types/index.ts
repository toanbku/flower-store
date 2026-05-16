export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type PaymentMethod = 'cash' | 'transfer' | 'card'
export type DeliveryType = 'pickup' | 'delivery'

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category_id?: string
  category?: Category
  price: number
  unit: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  product_id: string
  product?: Product
  quantity: number
  min_quantity: number
  last_restocked_at?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  birthday?: string
  notes?: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  is_active: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer?: Customer
  customer_name: string
  customer_phone?: string
  status: OrderStatus
  delivery_type: DeliveryType
  delivery_address?: string
  delivery_date?: string
  note?: string
  subtotal: number
  discount: number
  total: number
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  created_by?: string
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface SupplyRecord {
  id: string
  supplier_id?: string
  supplier?: Supplier
  product_id?: string
  product?: Product
  quantity: number
  unit_cost?: number
  total_cost?: number
  note?: string
  supplied_at: string
  created_at: string
}

export interface DashboardStats {
  revenue_today: number
  revenue_week: number
  revenue_month: number
  orders_today: number
  orders_pending: number
  orders_processing: number
  low_stock_count: number
}
