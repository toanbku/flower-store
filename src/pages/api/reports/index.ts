import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateShort } from '@/lib/utils'
import { subDays, subMonths, startOfDay, format } from 'date-fns'

function getPeriodStart(period: string): Date {
  const now = new Date()
  if (period === 'month') return subMonths(now, 1)
  if (period === 'quarter') return subMonths(now, 3)
  return subDays(now, 7) // default: week
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const period = String(req.query.period || 'week')
  const since = getPeriodStart(period).toISOString()

  // Fetch orders in period (with items)
  const { data: orders, error: ordErr } = await supabaseAdmin
    .from('orders')
    .select('id, total, status, payment_status, created_at, items:order_items(product_name, quantity, total_price)')
    .gte('created_at', since)

  if (ordErr) return res.status(500).json({ error: ordErr.message })

  const nonCancelled = (orders ?? []).filter(o => o.status !== 'cancelled')
  const delivered = nonCancelled.filter(o => o.status === 'delivered')

  // ── Aggregates ───────────────────────────────────────────────────────────
  const totalRevenue = delivered.reduce((s, o) => s + (o.total ?? 0), 0)
  const totalOrders = nonCancelled.length

  // Status distribution
  const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý', processing: 'Đang làm',
    ready: 'Sẵn sàng', delivered: 'Đã giao', cancelled: 'Đã huỷ',
  }
  const STATUS_COLORS: Record<string, string> = {
    pending: '#fbbf24', processing: '#60a5fa',
    ready: '#a78bfa', delivered: '#34d399', cancelled: '#f87171',
  }
  const statusCounts: Record<string, number> = {}
  for (const o of orders ?? []) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
  }
  const orderStatusData = Object.entries(statusCounts).map(([status, value]) => ({
    name: STATUS_LABELS[status] ?? status, value, color: STATUS_COLORS[status] ?? '#94a3b8',
  }))

  // Daily revenue (last N days based on period)
  const days = period === 'quarter' ? 90 : period === 'month' ? 30 : 7
  const dailyMap: Record<string, { revenue: number; orders: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'dd/MM')
    dailyMap[d] = { revenue: 0, orders: 0 }
  }
  for (const o of nonCancelled) {
    const d = format(new Date(o.created_at), 'dd/MM')
    if (dailyMap[d]) {
      dailyMap[d].revenue += o.total ?? 0
      dailyMap[d].orders += 1
    }
  }
  const dailyRevenue = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }))

  // Top products
  const productMap: Record<string, { sold: number; revenue: number }> = {}
  for (const o of nonCancelled) {
    for (const item of (o.items ?? []) as any[]) {
      const key = item.product_name
      if (!productMap[key]) productMap[key] = { sold: 0, revenue: 0 }
      productMap[key].sold += item.quantity ?? 0
      productMap[key].revenue += item.total_price ?? 0
    }
  }
  const topProducts = Object.entries(productMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // New customers in period
  const { count: newCustomers } = await supabaseAdmin
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)

  // Total purchase cost in period
  const { data: supplyData } = await supabaseAdmin
    .from('supply_records')
    .select('total_cost')
    .gte('supplied_at', since)
  const totalCost = (supplyData ?? []).reduce((s, r) => s + (r.total_cost ?? 0), 0)
  const grossProfit = totalRevenue - totalCost

  res.status(200).json({
    data: { totalRevenue, totalCost, grossProfit, totalOrders, newCustomers: newCustomers ?? 0, orderStatusData, dailyRevenue, topProducts },
  })
}
