import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, AlertTriangle, Package, TrendingDown, ArrowDownCircle, History, ShoppingCart } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { InventoryItem, Supplier, SupplyRecord } from '@/types'

function StockStatusBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0) return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Hết hàng</Badge>
  if (qty <= min) return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">Sắp hết</Badge>
  return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Còn hàng</Badge>
}

interface RestockModalProps {
  item: InventoryItem | null
  suppliers: Supplier[]
  open: boolean
  onClose: () => void
  onSaved: () => void
}

function RestockModal({ item, suppliers, open, onClose, onSaved }: RestockModalProps) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setQuantity('')
      setSupplierId('')
      setCostPerUnit('')
      setNotes('')
    }
  }, [open])

  if (!item) return null

  async function handleSave() {
    if (!quantity || Number(quantity) <= 0) return toast({ title: 'Số lượng không hợp lệ', variant: 'destructive' })
    setSaving(true)
    const res = await fetch('/api/inventory/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: item!.product_id,
        quantity: Number(quantity),
        supplier_id: supplierId || null,
        unit_cost: costPerUnit ? Number(costPerUnit) : null,
        note: notes || null,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) return toast({ title: json.error ?? 'Lỗi nhập hàng', variant: 'destructive' })
    toast({ title: `Đã nhập thêm ${quantity} ${item!.product?.unit ?? ''}` })
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nhập hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-900">{item.product?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Tồn hiện tại: <span className="font-semibold text-slate-700">{item.quantity}</span>
            </p>
          </div>
          <div className="space-y-1">
            <Label>Số lượng nhập thêm *</Label>
            <Input type="number" min={1} placeholder="50" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Nhà cung cấp</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger>
              <SelectContent>
                {suppliers.filter(s => s.is_active).map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Giá nhập / đơn vị (VNĐ)</Label>
            <Input type="number" placeholder="8000" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Input placeholder="Nhập ghi chú..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Xác nhận nhập hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplyRecords, setSupplyRecords] = useState<SupplyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null)
  const [activeTab, setActiveTab] = useState('stock')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [invRes, supRes] = await Promise.all([
      fetch('/api/inventory'),
      fetch('/api/suppliers'),
    ])
    const [invJson, supJson] = await Promise.all([invRes.json(), supRes.json()])
    setInventory(invJson.data ?? [])
    setSuppliers(supJson.data ?? [])
    setLoading(false)
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    const res = await fetch('/api/inventory/supply-records')
    const json = await res.json()
    setSupplyRecords(json.data ?? [])
    setHistoryLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (activeTab === 'history') fetchHistory()
  }, [activeTab, fetchHistory])

  const filtered = inventory.filter(item => {
    const name = item.product?.name?.toLowerCase() ?? ''
    const matchSearch = name.includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && item.quantity > 0 && item.quantity <= item.min_quantity) ||
      (filter === 'out' && item.quantity === 0)
    return matchSearch && matchFilter
  })

  const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= i.min_quantity).length
  const outOfStock = inventory.filter(i => i.quantity === 0).length
  const healthy = inventory.length - lowStock - outOfStock

  return (
    <DashboardLayout title="Kho hàng" subtitle="Theo dõi tồn kho và nhập hàng">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          ) : (
            [
              { label: 'Tổng mặt hàng', value: inventory.length, icon: Package, color: 'bg-blue-50 text-blue-600', f: 'all' as const },
              { label: 'Còn hàng', value: healthy, icon: Package, color: 'bg-green-50 text-green-600', f: 'all' as const },
              { label: 'Sắp hết', value: lowStock, icon: TrendingDown, color: 'bg-orange-50 text-orange-600', f: 'low' as const },
              { label: 'Hết hàng', value: outOfStock, icon: AlertTriangle, color: 'bg-red-50 text-red-600', f: 'out' as const },
            ].map(s => (
              <Card
                key={s.label}
                className={`cursor-pointer transition-all hover:shadow-md ${filter === s.f && s.f !== 'all' ? 'ring-2 ring-rose-300' : ''}`}
                onClick={() => setFilter(s.f)}
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
            ))
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="stock" className="gap-1.5"><Package className="w-4 h-4" />Tồn kho</TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5"><History className="w-4 h-4" />Lịch sử nhập hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <div className="flex items-center gap-3 mb-3">
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
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filtered.map(item => {
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
                {!loading && filtered.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-10">Không tìm thấy mặt hàng</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            {historyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {(() => {
                    const totalQty = supplyRecords.reduce((s, r) => s + r.quantity, 0)
                    const totalCost = supplyRecords.reduce((s, r) => s + (r.total_cost ?? 0), 0)
                    const withCost = supplyRecords.filter(r => r.unit_cost).length
                    return [
                      { label: 'Số lần nhập', value: `${supplyRecords.length} lần`, icon: History, color: 'bg-blue-50 text-blue-600' },
                      { label: 'Tổng số lượng nhập', value: `${totalQty.toLocaleString()} đơn vị`, icon: ShoppingCart, color: 'bg-rose-50 text-rose-600' },
                      { label: 'Tổng chi phí nhập', value: totalCost > 0 ? formatCurrency(totalCost) : `${withCost}/${supplyRecords.length} có giá`, icon: Package, color: 'bg-emerald-50 text-emerald-600' },
                    ].map(s => (
                      <Card key={s.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{s.value}</p>
                            <p className="text-xs text-slate-400">{s.label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  })()}
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Ngày nhập</TableHead>
                          <TableHead className="font-semibold text-slate-700">Sản phẩm</TableHead>
                          <TableHead className="font-semibold text-slate-700">Nhà cung cấp</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Số lượng</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Giá nhập/đv</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Tổng tiền</TableHead>
                          <TableHead className="font-semibold text-slate-700">Ghi chú</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplyRecords.map(record => (
                          <TableRow key={record.id}>
                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(record.supplied_at)}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-slate-900">{record.product?.name ?? '—'}</span>
                              {record.product?.unit && (
                                <span className="text-xs text-slate-400 ml-1">/ {record.product.unit}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {record.supplier?.name ?? <span className="text-slate-300">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-slate-900">
                              {record.quantity.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-slate-600">
                              {record.unit_cost ? formatCurrency(record.unit_cost) : <span className="text-slate-300">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-emerald-700">
                              {record.total_cost ? formatCurrency(record.total_cost) : <span className="text-slate-300">—</span>}
                            </TableCell>
                            <TableCell className="text-xs text-slate-400 max-w-[160px] truncate">
                              {record.note ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {supplyRecords.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-10">Chưa có lịch sử nhập hàng</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <RestockModal
        item={restockItem}
        suppliers={suppliers}
        open={!!restockItem}
        onClose={() => setRestockItem(null)}
        onSaved={() => { fetchData(); if (activeTab === 'history') fetchHistory() }}
      />
    </DashboardLayout>
  )
}
