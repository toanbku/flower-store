import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { product_id, quantity, supplier_id, unit_cost, note } = req.body
  if (!product_id) return res.status(400).json({ error: 'Thiếu sản phẩm' })
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Số lượng không hợp lệ' })

  const total_cost = unit_cost ? Number(unit_cost) * Number(quantity) : null

  // Insert supply_record — trigger tự động cộng vào inventory
  const { error } = await supabaseAdmin.from('supply_records').insert({
    product_id,
    supplier_id: supplier_id || null,
    quantity: Number(quantity),
    unit_cost: unit_cost ? Number(unit_cost) : null,
    total_cost,
    note: note || null,
    supplied_at: new Date().toISOString(),
  })
  if (error) return res.status(500).json({ error: error.message })

  // Trả về inventory mới nhất
  const { data, error: invErr } = await supabaseAdmin
    .from('inventory')
    .select('id, product_id, quantity, min_quantity, last_restocked_at, product:products(id, name, unit, category:categories(name))')
    .eq('product_id', product_id)
    .single()
  if (invErr) return res.status(500).json({ error: invErr.message })

  res.status(200).json({ data })
}
