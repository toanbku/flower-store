import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' })
  if (req.method !== 'PUT') return res.status(405).end()

  const allowed = ['name', 'phone', 'email', 'address', 'birthday', 'notes']
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key] || null
  }
  if (req.body.name) patch.name = String(req.body.name).trim()

  const { data, error } = await supabaseAdmin
    .from('customers')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
}
