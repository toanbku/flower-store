import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getProducts(req, res)
  if (req.method === 'POST') return createProduct(req, res)
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}

async function getProducts(_req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:categories(id, name)')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}

async function createProduct(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, category_id, price, unit } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Thiếu tên sản phẩm' })
  if (!price || isNaN(Number(price))) return res.status(400).json({ error: 'Giá không hợp lệ' })

  const { data: product, error: pErr } = await supabaseAdmin
    .from('products')
    .insert({ name: name.trim(), description: description || null, category_id: category_id || null, price: Number(price), unit: unit || 'cành', is_active: true })
    .select('*, category:categories(id, name)')
    .single()
  if (pErr) return res.status(500).json({ error: pErr.message })

  // Create an empty inventory row so it shows up in kho ngay
  await supabaseAdmin.from('inventory').insert({ product_id: product.id, quantity: 0, min_quantity: 10 })

  res.status(201).json({ data: product })
}
