import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { product_id, supplier_id, limit = '100' } = req.query

  let query = supabaseAdmin
    .from('supply_records')
    .select(`
      id, quantity, unit_cost, total_cost, note, supplied_at, created_at,
      product:products(id, name, unit),
      supplier:suppliers(id, name)
    `)
    .order('supplied_at', { ascending: false })
    .limit(Number(limit))

  if (product_id) query = query.eq('product_id', String(product_id))
  if (supplier_id) query = query.eq('supplier_id', String(supplier_id))

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json({ data })
}
