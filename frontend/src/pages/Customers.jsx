import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../utils/api'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { Users, Plus, Trash2, Mail, Phone } from 'lucide-react'

function CustomerForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) return toast.error('All fields are required')
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving customer')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="label">Full Name</label>
        <input className="input" placeholder="Jane Smith" value={form.name} onChange={set('name')} />
      </div>
      <div>
        <label className="label">Email Address</label>
        <input className="input" type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} />
      </div>
      <div>
        <label className="label">Phone Number</label>
        <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
          {loading ? 'Saving…' : 'Add Customer'}
        </button>
      </div>
    </form>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const load = () => getCustomers().then(setCustomers).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (data) => {
    await createCustomer(data)
    toast.success('Customer added!')
    load()
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete customer "${name}"?`)) return
    try {
      await deleteCustomer(id)
      toast.success('Customer deleted')
      load()
    } catch { toast.error('Cannot delete customer (may have orders)') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-charcoal">Customers</h1>
          <p className="text-secondary text-sm mt-1">{customers.length} registered customers</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Add your first customer to start taking orders" action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Customer</button>} />
      ) : (
        <div className="grid gap-3">
          {customers.map(c => (
            <div key={c.id} className="card px-6 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-display text-lg">{c.name[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal text-sm">{c.name}</p>
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-secondary">
                    <Mail size={11} /> {c.email}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-secondary">
                    <Phone size={11} /> {c.phone}
                  </span>
                </div>
              </div>
              <span className="text-xs text-secondary/60 hidden md:block">#{c.id}</span>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-secondary hover:text-red-600 transition-colors" onClick={() => handleDelete(c.id, c.name)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <Modal title="Add Customer" onClose={() => setShowAdd(false)}><CustomerForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} /></Modal>}
    </div>
  )
}
