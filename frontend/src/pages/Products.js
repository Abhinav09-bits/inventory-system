import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../api';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    productApi.getAll().then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setEditing(null); setModal('add'); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || '' });
    setEditing(p);
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Must be > 0';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
      if (modal === 'add') {
        await productApi.create(payload);
        toast.success('Product created!');
      } else {
        await productApi.update(editing.id, payload);
        toast.success('Product updated!');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await productApi.delete(p.id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error deleting product');
    }
  };

  const stockClass = (q) => q === 0 ? 'stock-zero' : q <= 5 ? 'stock-low' : 'stock-ok';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Manage your inventory catalog</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className="sku-badge">{p.sku}</span></td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td><span className={`stock-badge ${stockClass(p.quantity)}`}>{p.quantity}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.description || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</div>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Widget Pro" />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WGT-001" />
                {errors.sku && <span className="error-text">{errors.sku}</span>}
              </div>
              <div className="form-group">
                <label>Price ($) *</label>
                <input type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                {errors.quantity && <span className="error-text">{errors.quantity}</span>}
              </div>
              <div className="form-group span2">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
