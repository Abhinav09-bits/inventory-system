import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'

function ProductForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || { name: '', sku: '', price: '', quantity: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') return toast.error('All fields are required')
    setLoading(true)
    try {
      await onSubmit({ name: form.name, sku: form.sku, price: parseFloat(form.price), quantity: parseInt(form.quantity) })
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Product Name</label>
          <input className="input" placeholder="e.g. iPhone 15 Pro" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">SKU / Code</label>
          <input className="input font-mono" placeholder="IPH-15-PRO" value={form.sku} onChange={set('sku')} disabled={!!initial} />
        </div>
        <div>
          <label className="label">Price (₹)</label>
          <input className="input" type="number" min="0" step="0.01" placeholder="999.00" value={form.price} onChange={set('price')} />
        </div>
        <div className="col-span-2">
          <label className="label">Quantity in Stock</label>
          <input className="input" type="number" min="0" placeholder="100" value={form.quantity} onChange={set('quantity')} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => getProducts().then(setProducts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (data) => {
    await createProduct(data)
    toast.success('Product added!')
    load()
  }

  const handleUpdate = async (data) => {
    await updateProduct(editing.id, data)
    toast.success('Product updated!')
    setEditing(null)
    load()
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      load()
    } catch { toast.error('Cannot delete product') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-charcoal">Products</h1>
          <p className="text-secondary text-sm mt-1">{products.length} items in inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to get started" action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Product</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-offwhite border-b border-border">
                <tr>
                  <th className="table-header px-6 py-3 text-left">Product</th>
                  <th className="table-header px-6 py-3 text-left">SKU</th>
                  <th className="table-header px-6 py-3 text-right">Price</th>
                  <th className="table-header px-6 py-3 text-right">Stock</th>
                  <th className="table-header px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-offwhite/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-secondary font-mono">{p.sku}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">₹{p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`badge ${p.quantity === 0 ? 'bg-red-50 text-red-600' : p.quantity <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-offwhite text-secondary hover:text-primary transition-colors" onClick={() => setEditing(p)}>
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-secondary hover:text-red-600 transition-colors" onClick={() => handleDelete(p.id, p.name)}>
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

      {showAdd && <Modal title="Add Product" onClose={() => setShowAdd(false)}><ProductForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} /></Modal>}
      {editing && <Modal title="Edit Product" onClose={() => setEditing(null)}><ProductForm initial={editing} onSubmit={handleUpdate} onClose={() => setEditing(null)} /></Modal>}
    </div>
  )
}
