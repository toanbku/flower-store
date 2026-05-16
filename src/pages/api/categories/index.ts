import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, description, created_at')
    .order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}
