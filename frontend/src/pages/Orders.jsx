import { useEffect, useState } from 'react'
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../utils/api'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { ShoppingCart, Plus, Trash2, Eye, X } from 'lucide-react'

function OrderForm({ onSubmit, onClose }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()]).then(([c, p]) => { setCustomers(c); setProducts(p) })
  }, [])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const setItem = (idx, key, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [key]: val } : item))

  const total = items.reduce((sum, item) => {
    const p = products.find(p => String(p.id) === String(item.product_id))
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerId) return toast.error('Select a customer')
    if (items.some(i => !i.product_id || !i.quantity)) return toast.error('Complete all order items')
    setLoading(true)
    try {
      await onSubmit({ customer_id: parseInt(customerId), items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })) })
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating order')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="label">Customer</label>
        <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">Select customer…</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Order Items</label>
          <button type="button" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={addItem}><Plus size={12} /> Add item</button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select className="input flex-1" value={item.product_id} onChange={e => setItem(idx, 'product_id', e.target.value)}>
                <option value="">Product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
              </select>
              <input className="input w-20 text-center" type="number" min="1" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} />
              {items.length > 1 && <button type="button" className="p-1.5 hover:bg-red-50 text-secondary hover:text-red-600 rounded-lg transition-colors" onClick={() => removeItem(idx)}><X size={14} /></button>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-offwhite rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-secondary">Estimated Total</span>
        <span className="font-display text-xl text-charcoal">₹{total.toFixed(2)}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
          {loading ? 'Placing…' : 'Place Order'}
        </button>
      </div>
    </form>
  )
}

function OrderDetail({ orderId, onClose }) {
  const [order, setOrder] = useState(null)
  useEffect(() => { getOrder(orderId).then(setOrder) }, [orderId])

  if (!order) return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-offwhite rounded-xl p-3">
          <p className="text-xs text-secondary mb-1">Customer</p>
          <p className="font-medium text-charcoal">{order.customer?.name || '—'}</p>
        </div>
        <div className="bg-offwhite rounded-xl p-3">
          <p className="text-xs text-secondary mb-1">Status</p>
          <span className="badge bg-green-50 text-green-600">{order.status}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-offwhite">
            <tr>
              <th className="table-header px-4 py-2 text-left">Product</th>
              <th className="table-header px-4 py-2 text-right">Qty</th>
              <th className="table-header px-4 py-2 text-right">Price</th>
              <th className="table-header px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-charcoal">{item.product?.name || `Product #${item.product_id}`}</td>
                <td className="px-4 py-2 text-right text-secondary">{item.quantity}</td>
                <td className="px-4 py-2 text-right text-secondary">₹{item.unit_price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-medium">₹{(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-secondary text-sm">Total Amount</span>
        <span className="font-display text-2xl text-charcoal">₹{order.total_amount.toFixed(2)}</span>
      </div>

      <button className="btn-secondary w-full justify-center" onClick={onClose}>Close</button>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [viewId, setViewId] = useState(null)

  const load = () => getOrders().then(setOrders).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (data) => {
    await createOrder(data)
    toast.success('Order placed!')
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try {
      await deleteOrder(id)
      toast.success('Order cancelled, stock restored')
      load()
    } catch { toast.error('Cannot cancel order') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-charcoal">Orders</h1>
          <p className="text-secondary text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders yet" description="Create your first order when a customer buys products" action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> New Order</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-offwhite border-b border-border">
                <tr>
                  <th className="table-header px-6 py-3 text-left">Order ID</th>
                  <th className="table-header px-6 py-3 text-left">Customer</th>
                  <th className="table-header px-6 py-3 text-left">Date</th>
                  <th className="table-header px-6 py-3 text-right">Total</th>
                  <th className="table-header px-6 py-3 text-center">Status</th>
                  <th className="table-header px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-offwhite/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-secondary">#{String(o.id).padStart(4,'0')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{o.customer?.name || `Customer #${o.customer_id}`}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">₹{o.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="badge bg-green-50 text-green-600">{o.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-offwhite text-secondary hover:text-primary transition-colors" onClick={() => setViewId(o.id)}>
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-secondary hover:text-red-600 transition-colors" onClick={() => handleDelete(o.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <Modal title="Create Order" onClose={() => setShowAdd(false)} size="lg"><OrderForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} /></Modal>}
      {viewId && <Modal title={`Order #${String(viewId).padStart(4,'0')}`} onClose={() => setViewId(null)} size="lg"><OrderDetail orderId={viewId} onClose={() => setViewId(null)} /></Modal>}
    </div>
  )
}
