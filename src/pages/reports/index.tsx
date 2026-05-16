import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { mockRevenueData, mockTopProducts } from '@/lib/mock-data'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'

const orderStatusData = [
  { name: 'Đã giao', value: 142, color: '#34d399' },
  { name: 'Đang làm', value: 18, color: '#60a5fa' },
  { name: 'Chờ xử lý', value: 12, color: '#fbbf24' },
  { name: 'Đã huỷ', value: 8, color: '#f87171' },
]

const weeklyData = [
  { week: 'T2', orders: 12, revenue: 3200000 },
  { week: 'T3', orders: 8, revenue: 2100000 },
  { week: 'T4', orders: 15, revenue: 4500000 },
  { week: 'T5', orders: 10, revenue: 2800000 },
  { week: 'T6', orders: 18, revenue: 5100000 },
  { week: 'T7', orders: 24, revenue: 7200000 },
  { week: 'CN', orders: 20, revenue: 6000000 },
]

const CustomTooltipRevenue = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{formatCurrency(payload[0].value)}</p>
        {payload[1] && <p className="text-xs text-blue-600">{payload[1].value} đơn hàng</p>}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('week')

  const totalRevenue = mockRevenueData.reduce((s, d) => s + d.revenue, 0)
  const avgRevenue = Math.round(totalRevenue / mockRevenueData.length)

  return (
    <DashboardLayout title="Báo cáo" subtitle="Phân tích doanh thu và hiệu quả kinh doanh">
      <div className="flex flex-col gap-6">
        {/* Period selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600">Thống kê tổng quan</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-rose-600 bg-rose-50', change: '+18%' },
            { label: 'Tổng đơn hàng', value: '180', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', change: '+12%' },
            { label: 'Khách hàng mới', value: '14', icon: Users, color: 'text-green-600 bg-green-50', change: '+5%' },
            { label: 'SP bán chạy nhất', value: 'Bó hoa SN', icon: Package, color: 'text-purple-600 bg-purple-50', change: '24 bó' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">{s.value}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">{s.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue + Orders chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Doanh thu & đơn hàng trong tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipRevenue />} />
                  <Bar yAxisId="left" dataKey="revenue" fill="#f43f5e" radius={[4, 4, 0, 0]} opacity={0.9} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Phân bố đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="42%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {orderStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Xu hướng doanh thu</CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">TB/ngày: <span className="font-semibold text-slate-900">{formatCurrency(avgRevenue)}</span></span>
              <span className="text-slate-500">Tổng: <span className="font-semibold text-rose-600">{formatCurrency(totalRevenue)}</span></span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Doanh thu']} />
                <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTopProducts.map((product, i) => {
                const maxRevenue = mockTopProducts[0].revenue
                const pct = Math.round((product.revenue / maxRevenue) * 100)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 truncate">{product.name}</span>
                        <span className="text-sm font-semibold text-slate-900 ml-2 flex-shrink-0">{formatCurrency(product.revenue)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{product.sold} bán</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
