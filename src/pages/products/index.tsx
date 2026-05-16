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
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Package, ToggleLeft, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { Product } from '@/types'

interface Category {
  id: string
  name: string
}

interface ProductFormModalProps {
  product?: Product
  categories: Category[]
  open: boolean
  onClose: () => void
  onSaved: () => void
}

function ProductFormModal({ product, categories, open, onClose, onSaved }: ProductFormModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('cành')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(product?.name ?? '')
      setDescription(product?.description ?? '')
      setCategoryId(product?.category_id ?? '')
      setPrice(product?.price ? String(product.price) : '')
      setUnit(product?.unit ?? 'cành')
    }
  }, [open, product])

  async function handleSave() {
    if (!name.trim()) return toast({ title: 'Thiếu tên sản phẩm', variant: 'destructive' })
    if (!price || isNaN(Number(price))) return toast({ title: 'Giá không hợp lệ', variant: 'destructive' })
    setSaving(true)
    const body = { name, description: description || null, category_id: categoryId || null, price: Number(price), unit }
    const res = product
      ? await fetch(`/api/products/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) return toast({ title: json.error ?? 'Lỗi', variant: 'destructive' })
    toast({ title: product ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm' })
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Tên sản phẩm *</Label>
            <Input placeholder="Hoa hồng đỏ nhập khẩu" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Danh mục</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Đơn vị *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cành">Cành</SelectItem>
                  <SelectItem value="bó">Bó</SelectItem>
                  <SelectItem value="chậu">Chậu</SelectItem>
                  <SelectItem value="hộp">Hộp</SelectItem>
                  <SelectItem value="lẵng">Lẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Giá bán (VNĐ) *</Label>
            <Input type="number" placeholder="15000" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Mô tả</Label>
            <Textarea placeholder="Mô tả ngắn về sản phẩm..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [prodRes, catRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories'),
    ])
    const [prodJson, catJson] = await Promise.all([prodRes.json(), catRes.json()])
    setProducts(prodJson.data ?? [])
    setCategories(catJson.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleToggleActive(product: Product) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !product.is_active }),
    })
    if (!res.ok) return toast({ title: 'Lỗi cập nhật', variant: 'destructive' })
    toast({ title: product.is_active ? 'Đã ngừng bán sản phẩm' : 'Đã kích hoạt sản phẩm' })
    fetchData()
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Xoá sản phẩm "${product.name}"?`)) return
    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    if (!res.ok) return toast({ title: 'Lỗi xoá sản phẩm', variant: 'destructive' })
    toast({ title: 'Đã xoá sản phẩm' })
    fetchData()
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <DashboardLayout title="Sản phẩm" subtitle="Quản lý danh mục hoa và sản phẩm">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
            ))
          ) : (
            [
              { label: 'Tổng sản phẩm', value: products.length, color: 'text-blue-600' },
              { label: 'Đang bán', value: products.filter(p => p.is_active).length, color: 'text-green-600' },
              { label: 'Danh mục', value: categories.length, color: 'text-purple-600' },
              { label: 'Ngừng bán', value: products.filter(p => !p.is_active).length, color: 'text-slate-500' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm sản phẩm..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Tất cả danh mục" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => { setEditProduct(undefined); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Sản phẩm</TableHead>
                  <TableHead className="font-semibold text-slate-700">Danh mục</TableHead>
                  <TableHead className="font-semibold text-slate-700">Đơn vị</TableHead>
                  <TableHead className="font-semibold text-slate-700">Giá bán</TableHead>
                  <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ngày tạo</TableHead>
                  <TableHead className="w-10" />
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
                ) : filtered.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          {product.description && <p className="text-xs text-slate-400 truncate max-w-[200px]">{product.description}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {product.category?.name || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{product.unit}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">{formatCurrency(product.price)}</span>
                    </TableCell>
                    <TableCell>
                      {product.is_active
                        ? <Badge variant="success" className="text-xs">Đang bán</Badge>
                        : <Badge variant="secondary" className="text-xs">Ngừng bán</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{formatDate(product.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditProduct(product); setShowForm(true) }}>
                            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                            <ToggleLeft className="w-4 h-4 mr-2" />
                            {product.is_active ? 'Ngừng bán' : 'Kích hoạt'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(product)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-10">Không tìm thấy sản phẩm</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductFormModal product={editProduct} categories={categories} open={showForm} onClose={() => setShowForm(false)} onSaved={fetchData} />
    </DashboardLayout>
  )
}
