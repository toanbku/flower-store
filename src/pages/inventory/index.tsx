import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, AlertTriangle, Package, TrendingDown, ArrowDownCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { mockInventory } from '@/lib/mock-data'
import type { InventoryItem } from '@/types'

function StockStatusBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0) return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Hết hàng</Badge>
  if (qty <= min) return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">Sắp hết</Badge>
  return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Còn hàng</Badge>
}

function RestockModal({ item, open, onClose }: { item: InventoryItem | null; open: boolean; onClose: () => void }) {
  if (!item) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nhập hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-900">{item.product?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Tồn hiện tại: <span className="font-semibold text-slate-700">{item.quantity}</span></p>
          </div>
          <div className="space-y-1">
            <Label>Số lượng nhập thêm *</Label>
            <Input type="number" min={1} placeholder="50" />
          </div>
          <div className="space-y-1">
            <Label>Nhà cung cấp</Label>
            <Input placeholder="Vườn Hoa Đà Lạt" />
          </div>
          <div className="space-y-1">
            <Label>Giá nhập / đơn vị (VNĐ)</Label>
            <Input type="number" placeholder="8000" />
          </div>
          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Input placeholder="Nhập ghi chú..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onClose}>Xác nhận nhập hàng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null)

  const filtered = mockInventory.filter(item => {
    const name = item.product?.name.toLowerCase() || ''
    const matchSearch = name.includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && item.quantity > 0 && item.quantity <= item.min_quantity) ||
      (filter === 'out' && item.quantity === 0)
    return matchSearch && matchFilter
  })

  const totalItems = mockInventory.length
  const lowStock = mockInventory.filter(i => i.quantity > 0 && i.quantity <= i.min_quantity).length
  const outOfStock = mockInventory.filter(i => i.quantity === 0).length
  const healthy = totalItems - lowStock - outOfStock

  return (
    <DashboardLayout title="Kho hàng" subtitle="Theo dõi tồn kho và nhập hàng">
      <div className="flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng mặt hàng', value: totalItems, icon: Package, color: 'bg-blue-50 text-blue-600', filter: 'all' as const },
            { label: 'Còn hàng', value: healthy, icon: Package, color: 'bg-green-50 text-green-600', filter: 'all' as const },
            { label: 'Sắp hết', value: lowStock, icon: TrendingDown, color: 'bg-orange-50 text-orange-600', filter: 'low' as const },
            { label: 'Hết hàng', value: outOfStock, icon: AlertTriangle, color: 'bg-red-50 text-red-600', filter: 'out' as const },
          ].map(s => (
            <Card
              key={s.label}
              className={`cursor-pointer transition-all hover:shadow-md ${filter === s.filter && s.filter !== 'all' ? 'ring-2 ring-rose-300' : ''}`}
              onClick={() => setFilter(s.filter)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm sản phẩm..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1">
            {[{ v: 'all', l: 'Tất cả' }, { v: 'low', l: 'Sắp hết' }, { v: 'out', l: 'Hết hàng' }].map(f => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v as typeof filter)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  filter === f.v ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Sản phẩm</TableHead>
                  <TableHead className="font-semibold text-slate-700">Danh mục</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Tồn kho</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Tồn tối thiểu</TableHead>
                  <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-700">Nhập lần cuối</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(item => {
                  const isLow = item.quantity <= item.min_quantity
                  return (
                    <TableRow key={item.id} className={isLow ? 'bg-red-50/40' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {isLow && <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                          <span className="font-medium text-slate-900">{item.product?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">{item.product?.category?.name}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xl font-bold ${item.quantity === 0 ? 'text-red-600' : item.quantity <= item.min_quantity ? 'text-orange-600' : 'text-slate-900'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{item.product?.unit}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-slate-500">{item.min_quantity}</span>
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge qty={item.quantity} min={item.min_quantity} />
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {item.last_restocked_at ? formatDate(item.last_restocked_at) : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => setRestockItem(item)}
                        >
                          <ArrowDownCircle className="w-3 h-3 mr-1" /> Nhập hàng
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <RestockModal item={restockItem} open={!!restockItem} onClose={() => setRestockItem(null)} />
    </DashboardLayout>
  )
}
