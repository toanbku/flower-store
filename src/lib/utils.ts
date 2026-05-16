import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm dd/MM/yyyy', { locale: vi })
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'dd/MM', { locale: vi })
}

export const ORDER_STATUS_MAP = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Đang làm', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  ready: { label: 'Sẵn sàng', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Đã huỷ', color: 'bg-red-100 text-red-800 border-red-200' },
} as const

export const PAYMENT_STATUS_MAP = {
  unpaid: { label: 'Chưa thanh toán', color: 'bg-red-100 text-red-800' },
  partial: { label: 'Thanh toán 1 phần', color: 'bg-orange-100 text-orange-800' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
} as const

export const PAYMENT_METHOD_MAP = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
} as const

export const DELIVERY_TYPE_MAP = {
  pickup: 'Tự lấy',
  delivery: 'Giao hàng',
} as const
