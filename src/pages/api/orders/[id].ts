import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' })

  if (req.method === 'GET') return getOrder(id, res)
  if (req.method === 'PUT') return updateOrder(id, req, res)
  if (req.method === 'DELETE') return cancelOrder(id, res)
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

async function getOrder(id: string, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
  res.status(200).json({ data })
}

async function updateOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  const allowed = ['status', 'payment_status', 'payment_method', 'note', 'delivery_address', 'delivery_date']
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key]
  }

  if (!Object.keys(patch).length) return res.status(400).json({ error: 'Không có trường nào để cập nhật' })

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}

async function cancelOrder(id: string, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}
