import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

// SePay gửi POST mỗi khi có giao dịch vào tài khoản MSB 7727081998.
// Cấu hình URL này trong dashboard SePay → Webhook.
// Đặt SEPAY_API_TOKEN vào .env.local (lấy từ dashboard SePay).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = process.env.SEPAY_API_TOKEN
  if (token) {
    const authHeader = req.headers['authorization'] ?? ''
    if (authHeader !== `Apikey ${token}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
  }

  const { transferType, content, transferAmount } = req.body ?? {}

  // Bỏ qua giao dịch ra
  if (transferType !== 'in') {
    return res.status(200).json({ success: true })
  }

  // Tìm mã đơn hàng trong nội dung chuyển khoản (format: DH + 12 chữ số)
  const match = (content as string | undefined)?.match(/DH\d{12}/i)
  if (!match) {
    return res.status(200).json({ success: true })
  }

  const orderNumber = match[0].toUpperCase()

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, total, payment_status')
    .eq('order_number', orderNumber)
    .single()

  if (!order || order.payment_status === 'paid') {
    return res.status(200).json({ success: true })
  }

  const newStatus = transferAmount >= order.total ? 'paid' : 'partial'

  await supabaseAdmin
    .from('orders')
    .update({ payment_status: newStatus, payment_method: 'transfer' })
    .eq('id', order.id)

  return res.status(200).json({ success: true })
}
