import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp, ShoppingBag, Clock, AlertTriangle,
  ArrowRight, Plus,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP } from '@/lib/utils'
import Link from 'next/link'
import type { Order, InventoryItem } from '@/types'

interface DashboardStats {
  revenue_today: number
  orders_today: number
  orders_pending: number
  orders_processing: number
  low_stock_count: number
}

interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

interface OrderStatusData {
  name: string
  value: number
  color: string
}

function StatCard({ title, value, sub, icon: Icon, color, loading }: {
  title: string; value: string; sub: string; icon: React.ElementType
  color: string; loading?: boolean
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [statsRes, ordersRes, inventoryRes, reportsRes] = await Promise.all([
      fetch('/api/dashboard'),
      fetch('/api/orders'),
      fetch('/api/inventory'),
      fetch('/api/reports?period=week'),
    ])
    const [statsJson, ordersJson, inventoryJson, reportsJson] = await Promise.all([
      statsRes.json(),
      ordersRes.json(),
      inventoryRes.json(),
      reportsRes.json(),
    ])
    setStats(statsJson.data)
    setRecentOrders((ordersJson.data ?? []).slice(0, 5))
    setLowStockItems(
      (inventoryJson.data ?? []).filter((i: InventoryItem) => i.quantity <= i.min_quantity).slice(0, 5)
    )
    setDailyRevenue(reportsJson.data?.dailyRevenue ?? [])
    setOrderStatusData(reportsJson.data?.orderStatusData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const totalWeekRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0)

  return (
    <DashboardLayout title="Tổng quan" subtitle="Xin chào! Đây là tình hình hôm nay.">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats?.revenue_today ?? 0)}
          sub="Đã xác nhận thanh toán"
          icon={TrendingUp}
          color="bg-rose-500"
          loading={loading}
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={String(stats?.orders_today ?? 0)}
          sub={`${stats?.orders_processing ?? 0} đang xử lý`}
          icon={ShoppingBag}
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          title="Chờ xử lý"
          value={String(stats?.orders_pending ?? 0)}
          sub="Cần xử lý ngay"
          icon={Clock}
          color="bg-amber-500"
          loading={loading}
        />
        <StatCard
          title="Hàng sắp hết"
          value={String(stats?.low_stock_count ?? 0)}
          sub="Cần nhập thêm hàng"
          icon={AlertTriangle}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Doanh thu 7 ngày qua</CardTitle>
            {!loading && (
              <span className="text-xs text-slate-500">{formatCurrency(totalWeekRevenue)} tổng</span>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {orderStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Đơn hàng gần đây</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 -mr-2">
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status]
                  return (
                    <div key={order.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">#{order.order_number}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{order.customer_name} · {formatDateTime(order.created_at)}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 ml-3">{formatCurrency(order.total)}</p>
                    </div>
                  )
                })}
                {recentOrders.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">Chưa có đơn hàng nào</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Hàng sắp hết</CardTitle>
            <Link href="/inventory">
              <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 -mr-2">
                Kho <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.product?.name}</p>
                        <p className="text-xs text-slate-400">Tối thiểu: {item.min_quantity}</p>
                      </div>
                      <Badge className={item.quantity === 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}>
                        {item.quantity}
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-6">Kho hàng ổn định</p>
                  )}
                </div>
                <div className="px-6 pb-4 pt-2">
                  <Link href="/inventory">
                    <Button size="sm" variant="outline" className="w-full border-dashed">
                      <Plus className="w-4 h-4 mr-1" /> Nhập hàng
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
