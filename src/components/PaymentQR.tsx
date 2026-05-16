import { useState } from 'react'
import { Copy, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const BANK_ACCOUNT = '7727081998'
const BANK_CODE = 'MSB'

interface PaymentQRProps {
  orderNumber: string
  amount: number
}

export function PaymentQR({ orderNumber, amount }: PaymentQRProps) {
  const [copied, setCopied] = useState(false)

  const qrUrl =
    `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_CODE}` +
    `&amount=${amount}&des=${orderNumber}&template=compact`

  const copyAccount = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <img
          src={qrUrl}
          alt="QR thanh toán"
          className="w-48 h-48 rounded-lg border border-slate-200"
        />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-xs text-slate-500">Ngân hàng MSB</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-mono font-bold text-slate-900 text-sm">{BANK_ACCOUNT}</span>
          <button
            onClick={copyAccount}
            className="text-slate-400 hover:text-rose-600 transition-colors"
            title="Sao chép số tài khoản"
          >
            {copied
              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
              : <Copy className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-sm font-bold text-rose-600">{formatCurrency(amount)}</p>
        <p className="text-xs text-slate-500">
          Nội dung: <span className="font-mono font-medium text-slate-700">{orderNumber}</span>
        </p>
      </div>
    </div>
  )
}
