import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard, ShoppingBag, Package, Warehouse,
  Users, Truck, BarChart3, LogOut, Flower2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/inventory', label: 'Kho hàng', icon: Warehouse },
  { href: '/customers', label: 'Khách hàng', icon: Users },
  { href: '/suppliers', label: 'Nhà cung cấp', icon: Truck },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
]

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  user: User | null
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const router = useRouter()

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Người dùng'
  const initials = getInitials(displayName)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 ease-in-out flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-slate-700', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="flex-shrink-0 w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
          <Flower2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight text-white">Hoa Xinh</p>
            <p className="text-[10px] text-slate-400 leading-tight">Quản lý cửa hàng</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-rose-500 text-white font-medium shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-2 space-y-1">
        {/* User info */}
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-400">Quản lý</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-sm transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  )
}
