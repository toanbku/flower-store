import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getSuppliers(res)
  if (req.method === 'POST') return createSupplier(req, res)
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}

async function getSuppliers(res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .order('is_active', { ascending: false })
    .order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}

async function createSupplier(req: NextApiRequest, res: NextApiResponse) {
  const { name, contact_name, phone, email, address, notes } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Thiếu tên nhà cung cấp' })

  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .insert({ name: name.trim(), contact_name: contact_name || null, phone: phone || null, email: email || null, address: address || null, notes: notes || null, is_active: true })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ data })
}
