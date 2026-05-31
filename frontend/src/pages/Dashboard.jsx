import { useEffect, useState } from 'react'
import { getDashboard } from '../utils/api'
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="font-display text-3xl text-charcoal mt-1">{value ?? '—'}</p>
      <p className="text-sm text-secondary">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
        <p className="text-secondary text-sm mt-1">Overview of your business</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Total Products" value={data?.total_products} color="bg-primary" />
        <StatCard icon={Users} label="Total Customers" value={data?.total_customers} color="bg-charcoal" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={data?.total_orders} color="bg-primary-dark" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={data?.low_stock_products?.length} color="bg-amber-500" />
      </div>

      {/* Low Stock Table */}
      {data?.low_stock_products?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-medium text-charcoal text-sm">Low Stock Alerts</h2>
            <span className="badge bg-amber-50 text-amber-600 ml-auto">{data.low_stock_products.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-offwhite">
                <tr>
                  <th className="table-header px-6 py-3 text-left">Product</th>
                  <th className="table-header px-6 py-3 text-left">SKU</th>
                  <th className="table-header px-6 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.low_stock_products.map(p => (
                  <tr key={p.id} className="hover:bg-offwhite/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-charcoal">{p.name}</td>
                    <td className="px-6 py-3 text-sm text-secondary font-mono">{p.sku}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`badge ${p.quantity === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {p.quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.low_stock_products?.length === 0 && (
        <div className="card p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-medium text-charcoal text-sm">All products are well-stocked</p>
            <p className="text-secondary text-xs mt-0.5">No items are running low on inventory</p>
          </div>
        </div>
      )}
    </div>
  )
}
