import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Eye, Trash2, QrCode } from 'lucide-react'
import { PaymentQR } from '@/components/PaymentQR'
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, DELIVERY_TYPE_MAP } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import type { Order, OrderStatus, Customer, Product } from '@/types'
import Link from 'next/link'

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang làm' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const info = ORDER_STATUS_MAP[status]
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${info.color}`}>
      {info.label}
    </span>
  )
}

// ─── New Order Modal ─────────────────────────────────────────────────────────

type NewOrderForm = {
  customer_id: string
  customer_name: string
  customer_phone: string
  delivery_type: 'pickup' | 'delivery'
  delivery_address: string
  delivery_date: string
  payment_status: 'unpaid' | 'partial' | 'paid'
  payment_method: 'cash' | 'transfer' | 'card'
  note: string
}

type OrderItem = { product_id: string; product_name: string; quantity: number; unit_price: number }

const EMPTY_FORM: NewOrderForm = {
  customer_id: '',
  customer_name: '',
  customer_phone: '',
  delivery_type: 'pickup',
  delivery_address: '',
  delivery_date: '',
  payment_status: 'unpaid',
  payment_method: 'cash',
  note: '',
}

function NewOrderModal({ open, onClose, onCreated }: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [form, setForm] = useState<NewOrderForm>(EMPTY_FORM)
  const [items, setItems] = useState<OrderItem[]>([{ product_id: '', product_name: '', quantity: 1, unit_price: 0 }])
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('') // '' = khách lẻ
  const [createdOrder, setCreatedOrder] = useState<{ order_number: string; total: number } | null>(null)

  useEffect(() => {
    if (!open) return
    Promise.all([fetch('/api/customers'), fetch('/api/products')]).then(async ([cr, pr]) => {
      const [cj, pj] = await Promise.all([cr.json(), pr.json()])
      setCustomers(cj.data ?? [])
      setProducts((pj.data ?? []).filter((p: Product) => p.is_active))
    })
  }, [open])

  const set = (key: keyof NewOrderForm, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSelectCustomer = (value: string) => {
    setSelectedCustomerId(value)
    if (value === '__new__') {
      set('customer_id', '')
      set('customer_name', '')
      set('customer_phone', '')
    } else {
      const c = customers.find(c => c.id === value)
      if (c) {
        set('customer_id', c.id)
        set('customer_name', c.name)
        set('customer_phone', c.phone ?? '')
      }
    }
  }

  const addItem = () => setItems(prev => [...prev, { product_id: '', product_name: '', quantity: 1, unit_price: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const setItemProduct = (i: number, productId: string) => {
    const p = products.find(p => p.id === productId)
    if (!p) return
    setItems(prev => prev.map((it, idx) => idx === i
      ? { ...it, product_id: p.id, product_name: p.name, unit_price: p.price }
      : it
    ))
  }
  const setItemQty = (i: number, qty: number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: qty } : it))

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const handleClose = () => {
    setForm(EMPTY_FORM)
    setItems([{ product_id: '', product_name: '', quantity: 1, unit_price: 0 }])
    setSelectedCustomerId('')
    setCreatedOrder(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.customer_name.trim()) return toast({ title: 'Thiếu tên khách hàng', variant: 'destructive' })
    if (items.some(i => !i.product_name)) return toast({ title: 'Vui lòng chọn sản phẩm cho tất cả dòng', variant: 'destructive' })

    setSaving(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Tạo đơn thất bại')
      onCreated()
      if (form.payment_method === 'transfer') {
        setCreatedOrder({ order_number: json.data.order_number, total: json.data.total })
      } else {
        toast({ title: 'Tạo đơn hàng thành công', variant: 'success' })
        handleClose()
      }
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const isExistingCustomer = selectedCustomerId && selectedCustomerId !== '__new__'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdOrder ? 'QR Thanh toán' : 'Tạo đơn hàng mới'}
          </DialogTitle>
        </DialogHeader>

        {createdOrder ? (
          <div className="py-4 space-y-4">
            <p className="text-center text-sm text-slate-600">
              Đơn hàng <span className="font-semibold text-slate-900">#{createdOrder.order_number}</span> đã tạo thành công.
              Cho khách quét mã QR hoặc chuyển khoản theo thông tin bên dưới.
            </p>
            <PaymentQR orderNumber={createdOrder.order_number} amount={createdOrder.total} />
          </div>
        ) : (
          <div className="space-y-4">
          {/* Customer select */}
          <div className="space-y-1">
            <Label>Khách hàng</Label>
            <Select value={selectedCustomerId} onValueChange={handleSelectCustomer}>
              <SelectTrigger><SelectValue placeholder="Chọn khách hàng hoặc nhập mới" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__new__">+ Khách lẻ (nhập tay)</SelectItem>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{c.phone ? ` — ${c.phone}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tên khách hàng *</Label>
              <Input
                placeholder="Nguyễn Thị Lan"
                value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)}
                readOnly={!!isExistingCustomer}
                className={isExistingCustomer ? 'bg-slate-50 text-slate-500' : ''}
              />
            </div>
            <div className="space-y-1">
              <Label>Số điện thoại</Label>
              <Input
                placeholder="0901234567"
                value={form.customer_phone}
                onChange={e => set('customer_phone', e.target.value)}
                readOnly={!!isExistingCustomer}
                className={isExistingCustomer ? 'bg-slate-50 text-slate-500' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Hình thức</Label>
              <Select value={form.delivery_type} onValueChange={v => set('delivery_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Tự lấy</SelectItem>
                  <SelectItem value="delivery">Giao hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Ngày giao / lấy hàng</Label>
              <Input type="datetime-local" value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)} />
            </div>
          </div>

          {form.delivery_type === 'delivery' && (
            <div className="space-y-1">
              <Label>Địa chỉ giao hàng *</Label>
              <Input placeholder="123 Lê Lợi, Q1, TP.HCM" value={form.delivery_address} onChange={e => set('delivery_address', e.target.value)} />
            </div>
          )}

          {/* Items */}
          <div>
            <Label className="mb-2 block">Danh sách sản phẩm</Label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select value={item.product_id} onValueChange={v => setItemProduct(i, v)}>
                      <SelectTrigger><SelectValue placeholder="Chọn sản phẩm" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {formatCurrency(p.price)}/{p.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number" min={1}
                    value={item.quantity}
                    onChange={e => setItemQty(i, Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm font-medium w-28 text-right text-slate-600 flex-shrink-0">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0" onClick={() => removeItem(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="border-dashed w-full">
                <Plus className="w-4 h-4 mr-1" /> Thêm sản phẩm
              </Button>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="text-sm text-slate-500">Tổng cộng</span>
              <span className="text-lg font-bold text-rose-600">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Thanh toán</Label>
              <Select value={form.payment_status} onValueChange={v => set('payment_status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="partial">Một phần</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Phương thức</Label>
              <Select value={form.payment_method} onValueChange={v => set('payment_method', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="card">Thẻ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Textarea placeholder="Yêu cầu đặc biệt, nội dung thiệp..." rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
          </div>
        </div>
        )}

        <DialogFooter>
          {createdOrder ? (
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleClose}>
              Đóng
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={saving}>Huỷ</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showNewOrder, setShowNewOrder] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setOrders(json.data ?? [])
    } catch {
      toast({ title: 'Không thể tải đơn hàng', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Đã huỷ đơn hàng', variant: 'success' })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o))
    } catch {
      toast({ title: 'Huỷ đơn thất bại', variant: 'destructive' })
    }
  }

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? orders.length
      : orders.filter(o => o.status === tab.value).length
    return acc
  }, {} as Record<string, number>)

  return (
    <DashboardLayout title="Đơn hàng" subtitle="Quản lý và theo dõi tất cả đơn hàng">
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm theo mã đơn, khách hàng..."
              className="pl-9 w-72"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setShowNewOrder(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tạo đơn hàng
          </Button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.value
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {tab.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Mã đơn</TableHead>
                  <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                  <TableHead className="font-semibold text-slate-700">Sản phẩm</TableHead>
                  <TableHead className="font-semibold text-slate-700">Hình thức</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tổng tiền</TableHead>
                  <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-700">Thời gian</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      Không có đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : filtered.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/orders/${order.id}`} className="font-semibold text-rose-600 hover:underline">
                        #{order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-900">{order.customer_name}</p>
                      {order.customer_phone && <p className="text-xs text-slate-400">{order.customer_phone}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600 max-w-[160px] truncate">
                        {order.items?.map(i => i.product_name).join(', ')}
                      </p>
                      {order.items && order.items.length > 1 && (
                        <p className="text-xs text-slate-400">{order.items.length} sản phẩm</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">{DELIVERY_TYPE_MAP[order.delivery_type]}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PAYMENT_STATUS_MAP[order.payment_status].color}`}>
                        {PAYMENT_STATUS_MAP[order.payment_status].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatDateTime(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/orders/${order.id}`}><Eye className="w-4 h-4 mr-2" />Xem chi tiết</Link>
                          </DropdownMenuItem>
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleCancel(order.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />Huỷ đơn
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <NewOrderModal
        open={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        onCreated={fetchOrders}
      />
    </DashboardLayout>
  )
}
