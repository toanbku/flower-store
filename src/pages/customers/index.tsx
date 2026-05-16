import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Eye, Users, TrendingUp, Star } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockCustomers } from '@/lib/mock-data'
import type { Customer } from '@/types'

function CustomerFormModal({ customer, open, onClose }: { customer?: Customer; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Họ và tên *</Label>
              <Input placeholder="Nguyễn Thị Lan" defaultValue={customer?.name} />
            </div>
            <div className="space-y-1">
              <Label>Số điện thoại *</Label>
              <Input placeholder="0901234567" defaultValue={customer?.phone} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="email@gmail.com" defaultValue={customer?.email} />
          </div>
          <div className="space-y-1">
            <Label>Địa chỉ</Label>
            <Input placeholder="123 Lê Lợi, Q1, TP.HCM" defaultValue={customer?.address} />
          </div>
          <div className="space-y-1">
            <Label>Ngày sinh</Label>
            <Input type="date" defaultValue={customer?.birthday} />
          </div>
          <div className="space-y-1">
            <Label>Ghi chú</Label>
            <Input placeholder="Ghi chú về khách hàng..." defaultValue={customer?.notes} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onClose}>
            {customer ? 'Lưu thay đổi' : 'Thêm khách hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getInitials(name: string) {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
}

function CustomerTierBadge({ spent }: { spent: number }) {
  if (spent >= 5000000) return <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">VIP</span>
  if (spent >= 2000000) return <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Thân thiết</span>
  return <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Thường</span>
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | undefined>()

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  const totalSpent = mockCustomers.reduce((s, c) => s + c.total_spent, 0)
  const vipCount = mockCustomers.filter(c => c.total_spent >= 5000000).length

  return (
    <DashboardLayout title="Khách hàng" subtitle="Quản lý thông tin và lịch sử mua hàng">
      <div className="flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng khách hàng', value: mockCustomers.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Khách VIP', value: vipCount, icon: Star, color: 'bg-amber-50 text-amber-600' },
            { label: 'Tổng doanh thu', value: formatCurrency(totalSpent), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
            { label: 'Đơn TB / khách', value: Math.round(mockCustomers.reduce((s, c) => s + c.total_orders, 0) / mockCustomers.length), icon: Users, color: 'bg-purple-50 text-purple-600' },
          ].map(s => (
            <Card key={s.label}>
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
            <Input placeholder="Tìm theo tên, SĐT..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => { setEditCustomer(undefined); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm khách hàng
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                  <TableHead className="font-semibold text-slate-700">Liên hệ</TableHead>
                  <TableHead className="font-semibold text-slate-700">Phân loại</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Tổng đơn</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tổng chi tiêu</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ngày tham gia</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{customer.name}</p>
                          {customer.birthday && (
                            <p className="text-xs text-slate-400">Sinh: {formatDate(customer.birthday)}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-slate-700">{customer.phone || '—'}</p>
                        {customer.email && <p className="text-xs text-slate-400">{customer.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <CustomerTierBadge spent={customer.total_spent} />
                    </TableCell>
                    <TableCell className="text-center font-semibold text-slate-700">{customer.total_orders}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-rose-600">{formatCurrency(customer.total_spent)}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{formatDate(customer.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Xem lịch sử</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditCustomer(customer); setShowForm(true) }}>
                            <Pencil className="w-4 h-4 mr-2" />Chỉnh sửa
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

      <CustomerFormModal customer={editCustomer} open={showForm} onClose={() => setShowForm(false)} />
    </DashboardLayout>
  )
}
