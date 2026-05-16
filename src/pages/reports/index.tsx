import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Users, Package, TrendingDown, DollarSign } from 'lucide-react'

interface ReportsData {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  totalOrders: number
  newCustomers: number
  orderStatusData: { name: string; value: number; color: string }[]
  dailyRevenue: { date: string; revenue: number; orders: number }[]
  topProducts: { name: string; sold: number; revenue: number }[]
}

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
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReports = useCallback(async (p: string) => {
    setLoading(true)
    const res = await fetch(`/api/reports?period=${p}`)
    const json = await res.json()
    setData(json.data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { fetchReports(period) }, [fetchReports, period])

  const topProduct = data?.topProducts?.[0]
  const avgRevenue = data && data.dailyRevenue.length > 0
    ? Math.round(data.totalRevenue / data.dailyRevenue.length)
    : 0

  return (
    <DashboardLayout title="Báo cáo" subtitle="Phân tích doanh thu và hiệu quả kinh doanh">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600">Thống kê tổng quan</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
              <SelectItem value="quarter">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : (
            [
              { label: 'Tổng doanh thu', value: formatCurrency(data?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-rose-600 bg-rose-50' },
              { label: 'Tổng đơn hàng', value: String(data?.totalOrders ?? 0), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
              { label: 'Khách hàng mới', value: String(data?.newCustomers ?? 0), icon: Users, color: 'text-green-600 bg-green-50' },
              { label: 'SP bán chạy nhất', value: topProduct?.name ?? '—', icon: Package, color: 'text-purple-600 bg-purple-50' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">{s.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Lời / Lỗ */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 mb-3">Lời / Lỗ (so với chi phí nhập hàng)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))
            ) : (() => {
              const revenue = data?.totalRevenue ?? 0
              const cost = data?.totalCost ?? 0
              const profit = data?.grossProfit ?? 0
              const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
              const isProfit = profit >= 0
              return [
                { label: 'Doanh thu giao hàng', value: formatCurrency(revenue), icon: TrendingUp, color: 'text-rose-600 bg-rose-50' },
                { label: 'Chi phí nhập hàng', value: formatCurrency(cost), icon: TrendingDown, color: 'text-orange-600 bg-orange-50', note: cost === 0 ? 'Chưa nhập giá vốn' : null },
                {
                  label: isProfit ? 'Lợi nhuận gộp' : 'Lỗ gộp',
                  value: `${isProfit ? '+' : ''}${formatCurrency(profit)}`,
                  sub: cost > 0 ? `Biên: ${margin}%` : null,
                  icon: DollarSign,
                  color: isProfit ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50',
                  valueColor: isProfit ? 'text-emerald-700' : 'text-red-700',
                },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{s.label}</p>
                        <p className={`text-lg font-bold mt-0.5 truncate ${(s as any).valueColor ?? 'text-slate-900'}`}>{s.value}</p>
                        {(s as any).sub && <p className="text-xs text-slate-400 mt-0.5">{(s as any).sub}</p>}
                        {(s as any).note && <p className="text-xs text-amber-500 mt-0.5">{(s as any).note}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Doanh thu & đơn hàng theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data?.dailyRevenue ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltipRevenue />} />
                    <Bar yAxisId="left" dataKey="revenue" fill="#f43f5e" radius={[4, 4, 0, 0]} opacity={0.9} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Phân bố đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data?.orderStatusData ?? []} cx="50%" cy="42%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {(data?.orderStatusData ?? []).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Xu hướng doanh thu</CardTitle>
            {!loading && data && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">TB/ngày: <span className="font-semibold text-slate-900">{formatCurrency(avgRevenue)}</span></span>
                <span className="text-slate-500">Tổng: <span className="font-semibold text-rose-600">{formatCurrency(data.totalRevenue)}</span></span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.dailyRevenue ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Doanh thu']} />
                  <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.topProducts ?? []).map((product, i) => {
                  const maxRevenue = data!.topProducts[0]?.revenue ?? 1
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
                {(data?.topProducts ?? []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Chưa có dữ liệu doanh thu</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
