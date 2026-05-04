import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ShoppingBag, Package, BarChart3,
  Plus, Pencil, Trash2, X, Check, AlertTriangle,
  ChevronDown, Image as ImageIcon,
} from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { getOrders } from '../../api/orders';
import { logout } from '../../api/auth';
import { formatPrice } from '../../utils/formatPrice';

// ── Blank form state for a new product ──────────────────────
const BLANK = {
  name: '',
  description: '',
  price: '',
  category: 'Pastries',
  image: '',
  available: true,
  bestSeller: false,
  tags: [],
};

const CATEGORY_OPTIONS = ['Bread', 'Pastries', 'Drinks'];
const TAG_OPTIONS = ['Vegan', 'New', 'Seasonal', 'Contains Gluten', 'Contains Dairy', 'Contains Nuts'];

// ── Small reusable field components ─────────────────────────
function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 tracking-wide"
        style={{ color: 'var(--ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
        {label}{required && <span style={{ color: 'var(--rose)' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <motion.input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
      style={{
        background: 'var(--parchment2)',
        border: '1px solid var(--parchment3)',
        color: 'var(--ink)',
        fontFamily: 'DM Sans, sans-serif',
      }}
      whileFocus={{ borderColor: 'var(--amber)', boxShadow: '0 0 0 2px rgba(200,145,58,0.15)' }}
      transition={{ duration: 0.15 }}
      {...rest}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <motion.textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
      style={{
        background: 'var(--parchment2)',
        border: '1px solid var(--parchment3)',
        color: 'var(--ink)',
        fontFamily: 'DM Sans, sans-serif',
      }}
      whileFocus={{ borderColor: 'var(--amber)', boxShadow: '0 0 0 2px rgba(200,145,58,0.15)' }}
      transition={{ duration: 0.15 }}
    />
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5">
      <div className="relative rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? 'var(--espresso)' : 'var(--parchment3)', width: 40, height: 22 }}>
        <motion.div
          className="absolute rounded-full"
          style={{ width: 18, height: 18, top: 2, background: checked ? 'var(--amber)' : '#fff' }}
          animate={{ left: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </div>
      <span className="text-sm" style={{ color: 'var(--ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </span>
    </button>
  );
}

// ── Product Form Modal ───────────────────────────────────────
function ProductFormModal({ initial, onSave, onClose }) {
  const [form,   setForm]   = useState(initial || BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name  = 'Name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                   e.price = 'Enter a valid price';
    if (!form.image.trim())        e.image = 'Image URL is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, price: Number(form.price) });
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag) => {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter((t) => t !== tag)
      : [...form.tags, tag]
    );
  };

  const isEdit = !!initial?._id;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(30,20,10,0.6)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 24px 64px rgba(30,20,10,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--parchment3)' }}>
          <div>
            <h2 className="font-serif font-semibold text-lg" style={{ color: 'var(--ink)' }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs font-light mt-0.5" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              {isEdit ? `Editing: ${initial.name}` : 'Fill in the details below'}
            </p>
          </div>
          <motion.button onClick={onClose} whileTap={{ scale: 0.88 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--parchment2)' }}>
            <X size={14} style={{ color: 'var(--ink-muted)' }} />
          </motion.button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4">
          {form.image && (
            <motion.div className="w-full h-36 rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--parchment3)' }}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <img src={form.image} alt="Preview" className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }} />
            </motion.div>
          )}

          <Field label="Image URL" required>
            <div className="relative">
              <ImageIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--ink-muted)' }} />
              <Input value={form.image} onChange={(e) => set('image', e.target.value)}
                placeholder="https://images.unsplash.com/..." style={{ paddingLeft: 34 }} />
            </div>
            {errors.image && <p className="text-xs mt-1" style={{ color: 'var(--rose)', fontFamily: 'DM Sans, sans-serif' }}>{errors.image}</p>}
          </Field>

          <Field label="Product Name" required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Chocolate Croissant" />
            {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--rose)', fontFamily: 'DM Sans, sans-serif' }}>{errors.name}</p>}
          </Field>

          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the product..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₱)" required>
              <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)}
                placeholder="120" min="0" step="0.01" />
              {errors.price && <p className="text-xs mt-1" style={{ color: 'var(--rose)', fontFamily: 'DM Sans, sans-serif' }}>{errors.price}</p>}
            </Field>
            <Field label="Category">
              <div className="relative">
                <select value={form.category} onChange={(e) => set('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: 'var(--parchment2)', border: '1px solid var(--parchment3)', color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif' }}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--ink-muted)' }} />
              </div>
            </Field>
          </div>

          <div className="flex gap-6 py-1">
            <Toggle checked={form.available} onChange={(v) => set('available', v)} label="Available on menu" />
            <Toggle checked={form.bestSeller} onChange={(v) => set('bestSeller', v)} label="Best Seller" />
          </div>

          <Field label="Tags">
            <div className="flex flex-wrap gap-2 mt-1">
              {TAG_OPTIONS.map((tag) => {
                const active = form.tags.includes(tag);
                return (
                  <motion.button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={active
                      ? { background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }
                      : { background: 'var(--parchment2)', color: 'var(--ink-soft)', border: '1px solid var(--parchment3)', fontFamily: 'DM Sans, sans-serif' }
                    }
                    whileTap={{ scale: 0.92 }}>
                    {active && <Check size={9} className="inline mr-1" />}
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 sticky bottom-0"
          style={{ background: 'var(--card)', borderTop: '1px solid var(--parchment3)' }}>
          <motion.button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: saving ? 'rgba(30,20,10,0.4)' : 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}
            whileTap={{ scale: 0.97 }}>
            {saving ? (
              <motion.div className="w-4 h-4 rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'var(--amber)' }}
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
            ) : (
              <><Check size={14} />{isEdit ? 'Save Changes' : 'Add Product'}</>
            )}
          </motion.button>
          <motion.button onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--parchment2)', color: 'var(--ink)', border: '1px solid var(--parchment3)', fontFamily: 'DM Sans, sans-serif' }}
            whileTap={{ scale: 0.97 }}>
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Delete confirmation modal ────────────────────────────────
function DeleteConfirmModal({ product, onConfirm, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,20,10,0.6)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 24px 64px rgba(30,20,10,0.2)' }}
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--rose-pale)' }}>
          <AlertTriangle size={22} style={{ color: 'var(--rose)' }} />
        </div>
        <h3 className="font-serif font-semibold text-lg text-center mb-1" style={{ color: 'var(--ink)' }}>
          Delete Product?
        </h3>
        <p className="text-sm text-center font-light mb-5"
          style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{product.name}</strong> will be permanently removed from the menu.
        </p>
        <div className="flex gap-3">
          <motion.button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--rose)', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
            whileTap={{ scale: 0.97 }}>
            Delete
          </motion.button>
          <motion.button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--parchment2)', color: 'var(--ink)', border: '1px solid var(--parchment3)', fontFamily: 'DM Sans, sans-serif' }}
            whileTap={{ scale: 0.97 }}>
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [modal,     setModal]     = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [ordersErr, setOrdersErr] = useState(null);

  // Fetch orders from the API on mount
  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => setOrdersErr(err.message));
  }, []);

  const handleLogout = () => {
    logout(); // clears JWT from localStorage
    navigate('/', { replace: true });
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const stats = [
    { label: 'Total Orders', value: orders.length,            icon: ShoppingBag },
    { label: 'Revenue',      value: formatPrice(totalRevenue), icon: BarChart3   },
    { label: 'Menu Items',   value: products.length,           icon: Package     },
  ];

  const handleSave = async (product) => {
    if (modal?.type === 'edit') {
      await updateProduct(product);
    } else {
      await addProduct(product);
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (delTarget) await deleteProduct(delTarget._id);
    setDelTarget(null);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--parchment)' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(245,239,230,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--parchment3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--espresso)' }}>
            <span className="font-serif font-bold text-sm" style={{ color: 'var(--amber)' }}>C</span>
          </div>
          <div>
            <p className="font-serif font-bold text-base tracking-widest" style={{ color: 'var(--ink)' }}>CRMB</p>
            <p className="text-xs font-light" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>Admin Panel</p>
          </div>
        </div>
        <motion.button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--rose-pale)', color: 'var(--rose)', border: '1px solid rgba(196,121,106,0.25)', fontFamily: 'DM Sans, sans-serif' }}
          whileTap={{ scale: 0.95 }}>
          <LogOut size={14} />
          Logout
        </motion.button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="rounded-2xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 1px 2px rgba(30,20,10,0.04), 0 4px 14px rgba(30,20,10,0.06)' }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <s.icon size={18} style={{ color: 'var(--amber)', marginBottom: 8 }} />
              <p className="font-serif font-semibold text-xl" style={{ color: 'var(--ink)' }}>{s.value}</p>
              <p className="text-xs font-light mt-0.5" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-4"
            style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            Recent Orders
          </p>
          {ordersErr ? (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: 'var(--card)', border: '1px solid var(--parchment3)' }}>
              <p className="text-sm" style={{ color: 'var(--rose)', fontFamily: 'DM Sans, sans-serif' }}>{ordersErr}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--card)', border: '1px solid var(--parchment3)' }}>
              <p className="font-serif italic text-lg" style={{ color: 'var(--ink-muted)' }}>No orders yet</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 1px 2px rgba(30,20,10,0.04), 0 4px 14px rgba(30,20,10,0.06)' }}>
              {orders.slice(0, 8).map((order, i) => (
                <motion.div key={order._id}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: i < Math.min(orders.length, 8) - 1 ? '1px solid var(--parchment2)' : 'none' }}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <div>
                    <p className="font-mono-custom text-xs font-medium" style={{ color: 'var(--ink)' }}>{order.orderId}</p>
                    <p className="text-xs font-light mt-0.5" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                      {new Date(order.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}{order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <span className="font-serif font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                    {formatPrice(order.total)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Menu management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs tracking-[0.2em] uppercase font-medium"
              style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              Menu Items ({products.length})
            </p>
            <motion.button onClick={() => setModal({ type: 'add' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
              style={{ background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}
              whileTap={{ scale: 0.95 }}>
              <Plus size={13} />
              Add Item
            </motion.button>
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--parchment3)', boxShadow: '0 1px 2px rgba(30,20,10,0.04), 0 4px 14px rgba(30,20,10,0.06)' }}>
            <AnimatePresence>
              {products.map((p, i) => (
                <motion.div key={p._id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < products.length - 1 ? '1px solid var(--parchment2)' : 'none' }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, padding: 0 }}
                  transition={{ delay: i * 0.03 }}
                  layout>
                  <img src={p.image} alt={p.name}
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    style={{ border: '1px solid var(--parchment3)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{p.name}</p>
                    <p className="text-xs font-light" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                      {p.category} · {formatPrice(p.price)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: p.available ? 'var(--sage-pale)' : 'var(--rose-pale)',
                      color: p.available ? 'var(--sage)' : 'var(--rose)',
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                    {p.available ? 'Active' : 'Hidden'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <motion.button onClick={() => setModal({ type: 'edit', product: p })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--parchment2)', border: '1px solid var(--parchment3)' }}
                      whileTap={{ scale: 0.85 }}>
                      <Pencil size={12} style={{ color: 'var(--ink-soft)' }} />
                    </motion.button>
                    <motion.button onClick={() => setDelTarget(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--rose-pale)', border: '1px solid rgba(196,121,106,0.2)' }}
                      whileTap={{ scale: 0.85 }}>
                      <Trash2 size={12} style={{ color: 'var(--rose)' }} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {products.length === 0 && (
              <div className="p-10 text-center">
                <p className="font-serif italic text-lg mb-1" style={{ color: 'var(--ink-muted)' }}>No products yet</p>
                <p className="text-sm font-light" style={{ color: 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                  Tap "Add Item" to create your first menu item
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modal && (
          <ProductFormModal
            key="product-form"
            initial={modal.type === 'edit' ? modal.product : null}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {delTarget && (
          <DeleteConfirmModal
            key="delete-confirm"
            product={delTarget}
            onConfirm={handleDelete}
            onClose={() => setDelTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
