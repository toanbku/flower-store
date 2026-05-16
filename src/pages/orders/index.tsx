import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Filter } from 'lucide-react'
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, DELIVERY_TYPE_MAP } from '@/lib/utils'
import { mockOrders, mockProducts } from '@/lib/mock-data'
import type { Order, OrderStatus } from '@/types'
import Link from 'next/link'

const STATUS_TABS: { value: string; label: string }[] = [
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

function NewOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState([{ product_id: '', product_name: '', quantity: 1, unit_price: 0 }])

  const addItem = () => setItems(prev => [...prev, { product_id: '', product_name: '', quantity: 1, unit_price: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tên khách hàng *</Label>
              <Input placeholder="Nguyễn Thị Lan" />
            </div>
            <div className="space-y-1">
              <Label>Số điện thoại *</Label>
              <Input placeholder="0901234567" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Hình thức</Label>
              <Select defaultValue="pickup">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Tự lấy</SelectItem>
                  <SelectItem value="delivery">Giao hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Ngày giao / lấy hàng</Label>
              <Input type="datetime-local" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Địa chỉ giao hàng</Label>
            <Input placeholder="Để trống nếu tự lấy" />
          </div>

          {/* Items */}
          <div>
            <Label className="mb-2 block">Danh sách sản phẩm</Label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Select onValueChange={val => {
                      const p = mockProducts.find(p => p.id === val)
                      if (p) setItems(prev => prev.map((it, idx) => idx === i ? { ...it, product_id: p.id, product_name: p.name, unit_price: p.price } : it))
                    }}>
                      <SelectTrigger><SelectValue placeholder="Chọn sản phẩm" /></SelectTrigger>
                      <SelectContent>
                        {mockProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} – {formatCurrency(p.price)}/{p.unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: Number(e.target.value) } : it))}
                    className="w-20"
                    placeholder="SL"
                  />
                  <div className="text-sm font-medium w-24 text-right text-slate-600">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </div>
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(i)}>
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
              <Select defaultValue="unpaid">
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
              <Select defaultValue="cash">
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
            <Textarea placeholder="Yêu cầu đặc biệt, nội dung thiệp..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onClose}>Tạo đơn hàng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showNewOrder, setShowNewOrder] = useState(false)

  const filtered = mockOrders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? mockOrders.length
      : mockOrders.filter(o => o.status === tab.value).length
    return acc
  }, {} as Record<string, number>)

  return (
    <DashboardLayout title="Đơn hàng" subtitle="Quản lý và theo dõi tất cả đơn hàng">
      <div className="flex flex-col gap-4">
        {/* Top bar */}
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

        {/* Tabs */}
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
                {counts[tab.value]}
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
                {filtered.length === 0 ? (
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
                      <div>
                        <p className="font-medium text-slate-900">{order.customer_name}</p>
                        {order.customer_phone && <p className="text-xs text-slate-400">{order.customer_phone}</p>}
                      </div>
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
                      <div>
                        <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PAYMENT_STATUS_MAP[order.payment_status].color}`}>
                          {PAYMENT_STATUS_MAP[order.payment_status].label}
                        </span>
                      </div>
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
                          <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" />Cập nhật trạng thái</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />Huỷ đơn
                          </DropdownMenuItem>
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
      <NewOrderModal open={showNewOrder} onClose={() => setShowNewOrder(false)} />
    </DashboardLayout>
  )
}
