import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../api';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    customerApi.getAll().then(setCustomers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = () => { setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const closeModal = () => setModal(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await customerApi.create(form);
      toast.success('Customer added!');
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.full_name}"?`)) return;
    try {
      await customerApi.delete(c.id);
      toast.success('Customer deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error deleting customer');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-subtitle">Manage customer records</div>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p>No customers yet. Add your first customer.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.full_name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
                      <Trash2 size={14} />
                    </button>
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
              <div className="modal-title">Add Customer</div>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-grid full">
              <div className="form-group">
                <label>Full Name *</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
                {errors.full_name && <span className="error-text">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
