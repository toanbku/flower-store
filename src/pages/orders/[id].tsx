import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Printer, MapPin, Calendar, Phone, User, CreditCard, Package } from 'lucide-react'
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, PAYMENT_METHOD_MAP, DELIVERY_TYPE_MAP } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import type { Order, OrderStatus, PaymentStatus, PaymentMethod } from '@/types'

const STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'ready', 'delivered']

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Track pending changes separately so user explicitly saves
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | ''>('')
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState<PaymentStatus | ''>('')
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethod | ''>('')

  useEffect(() => {
    if (!id || typeof id !== 'string') return
    setLoading(true)
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setOrder(json.data)
        setPendingStatus(json.data.status)
        setPendingPaymentStatus(json.data.payment_status)
        setPendingPaymentMethod(json.data.payment_method ?? '')
      })
      .catch(() => toast({ title: 'Không thể tải đơn hàng', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!order) return
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: pendingStatus,
          payment_status: pendingPaymentStatus,
          payment_method: pendingPaymentMethod || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setOrder(json.data)
      toast({ title: 'Đã lưu thay đổi', variant: 'success' })
    } catch (err: any) {
      toast({ title: err.message || 'Lưu thất bại', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = order && (
    pendingStatus !== order.status ||
    pendingPaymentStatus !== order.payment_status ||
    (pendingPaymentMethod || null) !== (order.payment_method ?? null)
  )

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Đơn hàng" subtitle="Đang tải...">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-52 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout title="Không tìm thấy">
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <p className="text-lg mb-4">Đơn hàng không tồn tại</p>
          <Link href="/orders"><Button variant="outline">Quay lại danh sách</Button></Link>
        </div>
      </DashboardLayout>
    )
  }

  const statusInfo = ORDER_STATUS_MAP[order.status]
  const paymentInfo = PAYMENT_STATUS_MAP[order.payment_status]
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status)

  return (
    <DashboardLayout title={`Đơn hàng #${order.order_number}`} subtitle="Chi tiết và cập nhật trạng thái đơn">
      <div className="max-w-4xl mx-auto">
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/orders">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-700 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-2" /> In đơn</Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              size="sm"
              disabled={!hasChanges || saving}
              onClick={handleSave}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>

        {/* Status Progress */}
        {order.status !== 'cancelled' && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-rose-500 z-0 transition-all"
                  style={{ width: `${(currentStatusIdx / (STATUS_FLOW.length - 1)) * 100}%` }}
                />
                {STATUS_FLOW.map((s, i) => {
                  const info = ORDER_STATUS_MAP[s]
                  const done = i <= currentStatusIdx
                  return (
                    <div key={s} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        done ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${done ? 'text-rose-600' : 'text-slate-400'}`}>{info.label}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{order.customer_name}</p>
                    {order.customer_phone && (
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Phone className="w-3 h-3" /> {order.customer_phone}
                      </div>
                    )}
                  </div>
                </div>
                {order.delivery_type === 'delivery' && order.delivery_address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
                {order.delivery_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{DELIVERY_TYPE_MAP[order.delivery_type]}: {formatDateTime(order.delivery_date)}</span>
                  </div>
                )}
                {order.note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <span className="font-medium">Ghi chú:</span> {order.note}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Sản phẩm đặt hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-400">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900">{formatCurrency(item.total_price)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Tạm tính</span><span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span><span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-1 border-t">
                    <span>Tổng cộng</span>
                    <span className="text-rose-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-xs font-medium px-3 py-2 rounded-lg border text-center ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Cập nhật trạng thái</label>
                  <Select value={pendingStatus} onValueChange={v => setPendingStatus(v as OrderStatus)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="processing">Đang làm</SelectItem>
                      <SelectItem value="ready">Sẵn sàng</SelectItem>
                      <SelectItem value="delivered">Đã giao</SelectItem>
                      <SelectItem value="cancelled">Đã huỷ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${paymentInfo.color}`}>{paymentInfo.label}</span>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phương thức</span>
                    <span className="font-medium">{PAYMENT_METHOD_MAP[order.payment_method]}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Tổng</span>
                  <span className="text-rose-600">{formatCurrency(order.total)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Cập nhật thanh toán</label>
                  <Select value={pendingPaymentStatus} onValueChange={v => setPendingPaymentStatus(v as PaymentStatus)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                      <SelectItem value="partial">Thanh toán 1 phần</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Phương thức</label>
                  <Select value={pendingPaymentMethod} onValueChange={v => setPendingPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Chọn..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                      <SelectItem value="transfer">Chuyển khoản</SelectItem>
                      <SelectItem value="card">Thẻ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Meta */}
            <Card>
              <CardContent className="py-4 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Nhân viên tạo</span>
                  <span className="font-medium text-slate-700">{order.created_by || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tạo lúc</span>
                  <span>{formatDateTime(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cập nhật</span>
                  <span>{formatDateTime(order.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
