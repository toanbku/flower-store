import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp, ShoppingBag, Clock, AlertTriangle,
  ArrowUpRight, ArrowRight, Plus,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP } from '@/lib/utils'
import { mockOrders, mockInventory, mockRevenueData } from '@/lib/mock-data'
import Link from 'next/link'

const orderStatusDistribution = [
  { name: 'Chờ xử lý', value: 3, color: '#fbbf24' },
  { name: 'Đang làm', value: 2, color: '#60a5fa' },
  { name: 'Sẵn sàng', value: 1, color: '#a78bfa' },
  { name: 'Đã giao', value: 8, color: '#34d399' },
]

const lowStockItems = mockInventory
  .filter(i => i.quantity <= i.min_quantity)
  .slice(0, 5)

const recentOrders = mockOrders.slice(0, 5)

function StatCard({ title, value, sub, icon: Icon, trend, color }: {
  title: string; value: string; sub: string; icon: React.ElementType;
  trend?: string; color: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            <ArrowUpRight className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          </div>
        )}
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
  return (
    <DashboardLayout title="Tổng quan" subtitle="Xin chào, Hương! Đây là tình hình hôm nay.">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(2280000)}
          sub="Đã xác nhận thanh toán"
          icon={TrendingUp}
          color="bg-rose-500"
          trend="+12% so với hôm qua"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value="14"
          sub="3 đơn mới, 11 đã xử lý"
          icon={ShoppingBag}
          color="bg-blue-500"
          trend="+3 đơn so với hôm qua"
        />
        <StatCard
          title="Chờ xử lý"
          value="3"
          sub="Cần xử lý ngay"
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Hàng sắp hết"
          value={String(lowStockItems.length)}
          sub="Cần nhập thêm hàng"
          icon={AlertTriangle}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Doanh thu 7 ngày qua</CardTitle>
            <span className="text-xs text-slate-500">{formatCurrency(23330000)} tổng</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mockRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderStatusDistribution} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {orderStatusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
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
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
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
            <div className="divide-y">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.product?.name}</p>
                    <p className="text-xs text-slate-400">Tối thiểu: {item.min_quantity}</p>
                  </div>
                  <Badge
                    className={item.quantity === 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}
                  >
                    {item.quantity}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="px-6 pb-4 pt-2">
              <Link href="/inventory">
                <Button size="sm" variant="outline" className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-1" /> Nhập hàng
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
