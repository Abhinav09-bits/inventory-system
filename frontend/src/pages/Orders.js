import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Eye, PlusCircle, MinusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi, customerApi, productApi } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'detail'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    Promise.all([orderApi.getAll(), customerApi.getAll(), productApi.getAll()])
      .then(([o, c, p]) => { setOrders(o); setCustomers(c); setProducts(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
    setErrors({});
    setModal('create');
  };

  const openDetail = async (order) => {
    try {
      const full = await orderApi.getById(order.id);
      setSelectedOrder(full);
      setModal('detail');
    } catch {
      toast.error('Could not load order details');
    }
  };

  const closeModal = () => { setModal(null); setSelectedOrder(null); };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({
    ...f,
    items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  }));

  const calcTotal = () => {
    return form.items.reduce((sum, item) => {
      const p = products.find(p => p.id === Number(item.product_id));
      return sum + (p ? p.price * Number(item.quantity || 0) : 0);
    }, 0);
  };

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = 'Select a customer';
    if (form.items.some(i => !i.product_id)) e.items = 'Select a product for each item';
    if (form.items.some(i => !i.quantity || Number(i.quantity) < 1)) e.items = 'Quantity must be ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        customer_id: Number(form.customer_id),
        items: form.items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) }))
      };
      await orderApi.create(payload);
      toast.success('Order placed!');
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}? Stock will be restored.`)) return;
    try {
      await orderApi.delete(o.id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">Manage customer orders</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p>No orders yet. Create your first order.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span className="sku-badge">#{o.id}</span></td>
                  <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                  <td><strong>${Number(o.total_amount).toFixed(2)}</strong></td>
                  <td><span className="status-badge status-pending">{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openDetail(o)}><Eye size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div className="modal-title">Create Order</div>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Customer *</label>
              <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                <option value="">Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
                ))}
              </select>
              {errors.customer_id && <span className="error-text">{errors.customer_id}</span>}
            </div>

            <label style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: "'Space Mono', monospace" }}>
              Order Items *
            </label>
            {errors.items && <div className="error-text" style={{ marginBottom: 8 }}>{errors.items}</div>}

            <div className="order-items-list" style={{ marginTop: 8 }}>
              {form.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock
                      </option>
                    ))}
                  </select>
                  <input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty"
                  />
                  <button className="remove-item-btn" onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                    <MinusCircle size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button className="add-item-btn" onClick={addItem}>
              <PlusCircle size={15} /> Add Item
            </button>

            <div style={{ marginTop: 18, padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Estimated Total</span>
              <strong style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: 'var(--accent-hover)' }}>
                ${calcTotal().toFixed(2)}
              </strong>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {modal === 'detail' && selectedOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div className="modal-title">Order #{selectedOrder.id}</div>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="order-detail-grid">
              <div className="detail-field">
                <label>Status</label>
                <span className="status-badge status-pending">{selectedOrder.status}</span>
              </div>
              <div className="detail-field">
                <label>Date</label>
                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-field">
                <label>Customer</label>
                <span>{selectedOrder.customer?.full_name}</span>
              </div>
              <div className="detail-field">
                <label>Email</label>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedOrder.customer?.email}</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: "'Space Mono', monospace", display: 'block', marginBottom: 10 }}>Items</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedOrder.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.product?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.product?.sku} × {item.quantity}</div>
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: 'var(--accent-hover)' }}>
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>Total Amount</span>
              <strong style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: 'var(--success)' }}>
                ${Number(selectedOrder.total_amount).toFixed(2)}
              </strong>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
