import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getOrders(req, res)
  if (req.method === 'POST') return createOrder(req, res)
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

async function getOrders(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, order_number, customer_name, customer_phone,
      status, delivery_type, delivery_date,
      subtotal, discount, total,
      payment_status, payment_method,
      created_by, created_at, updated_at,
      items:order_items(id, product_name, quantity, unit_price, total_price)
    `)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}

async function createOrder(req: NextApiRequest, res: NextApiResponse) {
  const {
    customer_name, customer_phone, customer_id,
    delivery_type, delivery_address, delivery_date,
    payment_status, payment_method,
    note, discount = 0,
    items,
  } = req.body

  if (!customer_name) return res.status(400).json({ error: 'Thiếu tên khách hàng' })
  if (!items?.length) return res.status(400).json({ error: 'Đơn hàng phải có ít nhất 1 sản phẩm' })

  const subtotal: number = items.reduce(
    (sum: number, i: { quantity: number; unit_price: number }) => sum + i.quantity * i.unit_price,
    0
  )
  const total = subtotal - (discount || 0)

  // Insert order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_name,
      customer_phone: customer_phone || null,
      customer_id: customer_id || null,
      delivery_type: delivery_type || 'pickup',
      delivery_address: delivery_address || null,
      delivery_date: delivery_date || null,
      payment_status: payment_status || 'unpaid',
      payment_method: payment_method || null,
      note: note || null,
      subtotal,
      discount,
      total,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) return res.status(500).json({ error: orderError.message })

  // Insert order items
  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(
      items.map((i: { product_id?: string; product_name: string; quantity: number; unit_price: number }) => ({
        order_id: order.id,
        product_id: i.product_id || null,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.quantity * i.unit_price,
      }))
    )

  if (itemsError) {
    // Rollback order if items failed
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    return res.status(500).json({ error: itemsError.message })
  }

  res.status(201).json({ data: order })
}
