import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Total Products', value: stats?.total_products ?? 0, icon: Package, color: '#6366f1' },
    { label: 'Total Customers', value: stats?.total_customers ?? 0, icon: Users, color: '#10b981' },
    { label: 'Total Orders', value: stats?.total_orders ?? 0, icon: ShoppingCart, color: '#f59e0b' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">System overview and metrics</div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={20} style={{ color }} className="stat-icon" />
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {stats?.low_stock_products?.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <AlertTriangle size={18} className="alert-icon" />
          <div>
            <div className="alert-title">Low Stock Alert ({stats.low_stock_products.length} products)</div>
            <div className="alert-body">
              {stats.low_stock_products.map(p => (
                <span key={p.id} style={{ marginRight: 12 }}>
                  <strong>{p.name}</strong> — {p.quantity} left
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, marginBottom: 16, color: 'var(--text-secondary)' }}>
          QUICK STATS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>LOW STOCK ITEMS</div>
            <div style={{ fontSize: 24, fontFamily: "'Space Mono', monospace", color: 'var(--warning)' }}>
              {stats?.low_stock_products?.length ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>products ≤ 5 units</div>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>SYSTEM STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 14, color: '#10b981' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
