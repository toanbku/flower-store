import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Phone, Mail, MapPin, Truck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { Supplier } from '@/types'

interface SupplierFormModalProps {
  supplier?: Supplier
  open: boolean
  onClose: () => void
  onSaved: () => void
}

function SupplierFormModal({ supplier, open, onClose, onSaved }: SupplierFormModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(supplier?.name ?? '')
      setContactName(supplier?.contact_name ?? '')
      setPhone(supplier?.phone ?? '')
      setEmail(supplier?.email ?? '')
      setAddress(supplier?.address ?? '')
      setNotes(supplier?.notes ?? '')
    }
  }, [open, supplier])

  async function handleSave() {
    if (!name.trim()) return toast({ title: 'Thiếu tên nhà cung cấp', variant: 'destructive' })
    setSaving(true)
    const body = { name, contact_name: contactName || null, phone: phone || null, email: email || null, address: address || null, notes: notes || null }
    const res = supplier
      ? await fetch(`/api/suppliers/${supplier.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) return toast({ title: json.error ?? 'Lỗi', variant: 'destructive' })
    toast({ title: supplier ? 'Đã cập nhật nhà cung cấp' : 'Đã thêm nhà cung cấp' })
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Tên nhà cung cấp *</Label>
            <Input placeholder="Vườn Hoa Đà Lạt" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Người liên hệ</Label>
              <Input placeholder="Nguyễn Văn A" value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Số điện thoại</Label>
              <Input placeholder="02633123456" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="contact@supplier.vn" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Địa chỉ</Label>
            <Input placeholder="TP. Đà Lạt, Lâm Đồng" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Textarea placeholder="Giao hàng 3 lần/tuần, chuyên hoa hồng..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : supplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SuppliersPage() {
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>()

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/suppliers')
    const json = await res.json()
    setSuppliers(json.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  async function handleToggleActive(supplier: Supplier) {
    const res = await fetch(`/api/suppliers/${supplier.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !supplier.is_active }),
    })
    if (!res.ok) return toast({ title: 'Lỗi cập nhật', variant: 'destructive' })
    toast({ title: supplier.is_active ? 'Đã ngừng hợp tác' : 'Đã kích hoạt hợp tác' })
    fetchSuppliers()
  }

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Nhà cung cấp" subtitle="Quản lý các nhà cung cấp hoa">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          ) : (
            [
              { label: 'Tổng NCC', value: suppliers.length, color: 'bg-blue-50 text-blue-600' },
              { label: 'Đang hợp tác', value: suppliers.filter(s => s.is_active).length, color: 'bg-green-50 text-green-600' },
              { label: 'Ngừng hợp tác', value: suppliers.filter(s => !s.is_active).length, color: 'bg-slate-100 text-slate-500' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Truck className="w-5 h-5" />
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

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm nhà cung cấp..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => { setEditSupplier(undefined); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm NCC
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
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
                          <DropdownMenuItem onClick={() => handleToggleActive(supplier)}>
                            <Truck className="w-4 h-4 mr-2" />
                            {supplier.is_active ? 'Ngừng hợp tác' : 'Kích hoạt'}
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
            {filtered.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-10 col-span-2">Không tìm thấy nhà cung cấp</p>
            )}
          </div>
        )}
      </div>

      <SupplierFormModal supplier={editSupplier} open={showForm} onClose={() => setShowForm(false)} onSaved={fetchSuppliers} />
    </DashboardLayout>
  )
}
