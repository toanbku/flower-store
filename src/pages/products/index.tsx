import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ToggleLeft, Package } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockProducts, mockCategories } from '@/lib/mock-data'
import type { Product } from '@/types'

function ProductFormModal({ product, open, onClose }: { product?: Product; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Tên sản phẩm *</Label>
            <Input placeholder="Hoa hồng đỏ nhập khẩu" defaultValue={product?.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Danh mục</Label>
              <Select defaultValue={product?.category_id || ''}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  {mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Đơn vị *</Label>
              <Select defaultValue={product?.unit || 'cành'}>
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
            <Input type="number" placeholder="15000" defaultValue={product?.price} />
          </div>
          <div className="space-y-1">
            <Label>Mô tả</Label>
            <Textarea placeholder="Mô tả ngắn về sản phẩm..." defaultValue={product?.description} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onClose}>
            {product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()

  const filtered = mockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <DashboardLayout title="Sản phẩm" subtitle="Quản lý danh mục hoa và sản phẩm">
      <div className="flex flex-col gap-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng sản phẩm', value: mockProducts.length, color: 'text-blue-600 bg-blue-50' },
            { label: 'Đang bán', value: mockProducts.filter(p => p.is_active).length, color: 'text-green-600 bg-green-50' },
            { label: 'Danh mục', value: mockCategories.length, color: 'text-purple-600 bg-purple-50' },
            { label: 'Ngừng bán', value: mockProducts.filter(p => !p.is_active).length, color: 'text-slate-500 bg-slate-100' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</div>
                <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm sản phẩm..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Tất cả danh mục" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => { setEditProduct(undefined); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        </div>

        {/* Table */}
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
                {filtered.map(product => (
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
                          <DropdownMenuItem>
                            <ToggleLeft className="w-4 h-4 mr-2" />
                            {product.is_active ? 'Ngừng bán' : 'Kích hoạt'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Xoá
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

      <ProductFormModal product={editProduct} open={showForm} onClose={() => setShowForm(false)} />
    </DashboardLayout>
  )
}
