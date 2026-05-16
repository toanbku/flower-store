import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select(`
      id, product_id, quantity, min_quantity, last_restocked_at, updated_at,
      product:products(id, name, unit, category:categories(name))
    `)
    .order('quantity', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}
