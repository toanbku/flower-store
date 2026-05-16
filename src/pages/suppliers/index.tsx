import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Phone, Mail, MapPin, Truck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { mockSuppliers } from '@/lib/mock-data'
import type { Supplier } from '@/types'

function SupplierFormModal({ supplier, open, onClose }: { supplier?: Supplier; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Tên nhà cung cấp *</Label>
            <Input placeholder="Vườn Hoa Đà Lạt" defaultValue={supplier?.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Người liên hệ</Label>
              <Input placeholder="Nguyễn Văn A" defaultValue={supplier?.contact_name} />
            </div>
            <div className="space-y-1">
              <Label>Số điện thoại</Label>
              <Input placeholder="02633123456" defaultValue={supplier?.phone} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="contact@supplier.vn" defaultValue={supplier?.email} />
          </div>
          <div className="space-y-1">
            <Label>Địa chỉ</Label>
            <Input placeholder="TP. Đà Lạt, Lâm Đồng" defaultValue={supplier?.address} />
          </div>
          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Textarea placeholder="Giao hàng 3 lần/tuần, chuyên hoa hồng..." defaultValue={supplier?.notes} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onClose}>
            {supplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>()

  const filtered = mockSuppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Nhà cung cấp" subtitle="Quản lý các nhà cung cấp hoa">
      <div className="flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{mockSuppliers.length}</p>
                <p className="text-xs text-slate-400">Tổng NCC</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{mockSuppliers.filter(s => s.is_active).length}</p>
                <p className="text-xs text-slate-400">Đang hợp tác</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{mockSuppliers.filter(s => !s.is_active).length}</p>
                <p className="text-xs text-slate-400">Ngừng hợp tác</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm nhà cung cấp..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => { setEditSupplier(undefined); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm NCC
          </Button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(supplier => (
            <Card key={supplier.id} className={`transition-all hover:shadow-md ${!supplier.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {supplier.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{supplier.name}</h3>
                      {supplier.contact_name && (
                        <p className="text-xs text-slate-500">Liên hệ: {supplier.contact_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={supplier.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}>
                      {supplier.is_active ? 'Đang hợp tác' : 'Ngừng'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditSupplier(supplier); setShowForm(true) }}>
                          <Pencil className="w-4 h-4 mr-2" />Chỉnh sửa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email}
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" /> {supplier.address}
                    </div>
                  )}
                  {supplier.notes && (
                    <p className="text-xs text-slate-400 mt-2 pt-2 border-t">{supplier.notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-slate-400">
                  <span>Hợp tác từ: {formatDate(supplier.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <SupplierFormModal supplier={editSupplier} open={showForm} onClose={() => setShowForm(false)} />
    </DashboardLayout>
  )
}
