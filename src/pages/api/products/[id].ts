import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' })
  if (req.method === 'PUT') return updateProduct(id, req, res)
  if (req.method === 'DELETE') return deleteProduct(id, res)
  res.setHeader('Allow', ['PUT', 'DELETE'])
  res.status(405).end()
}

async function updateProduct(id: string, req: NextApiRequest, res: NextApiResponse) {
  const allowed = ['name', 'description', 'category_id', 'price', 'unit', 'is_active']
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key]
  }
  if ('price' in patch) patch.price = Number(patch.price)

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(patch)
    .eq('id', id)
    .select('*, category:categories(id, name)')
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}

async function deleteProduct(id: string, res: NextApiResponse) {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data: { id } })
}
