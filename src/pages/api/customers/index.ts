import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getCustomers(res)
  if (req.method === 'POST') return createCustomer(req, res)
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}

async function getCustomers(res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}

async function createCustomer(req: NextApiRequest, res: NextApiResponse) {
  const { name, phone, email, address, birthday, notes } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Thiếu tên khách hàng' })

  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert({ name: name.trim(), phone: phone || null, email: email || null, address: address || null, birthday: birthday || null, notes: notes || null })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ data })
}
