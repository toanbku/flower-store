import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { subDays } from 'date-fns'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [ordersRes, inventoryRes] = await Promise.all([
    supabaseAdmin.from('orders').select('total, status, payment_status, created_at'),
    supabaseAdmin.from('inventory').select('quantity, min_quantity'),
  ])

  const orders = ordersRes.data ?? []
  const inventory = inventoryRes.data ?? []

  const todayOrders = orders.filter(o => new Date(o.created_at) >= todayStart)

  res.status(200).json({
    data: {
      revenue_today: todayOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total ?? 0), 0),
      orders_today: todayOrders.length,
      orders_pending: orders.filter(o => o.status === 'pending').length,
      orders_processing: orders.filter(o => o.status === 'processing').length,
      low_stock_count: inventory.filter(i => i.quantity <= i.min_quantity).length,
    },
  })
}
