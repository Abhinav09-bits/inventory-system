import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'

const links = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display text-charcoal text-lg leading-none">InventHub</p>
            <p className="text-xs text-secondary mt-0.5">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(({ path, label, icon: Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-secondary">© 2025 InventHub</p>
      </div>
    </aside>
  )
}
