import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineX,
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { couponsAPI } from '../../utils/api'

const CouponModal = ({ coupon, onClose, onSave }) => {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || 5,
    maxDiscount: coupon?.maxDiscount || '',
    minOrderAmount: coupon?.minOrderAmount || 0,
    applicableRoles: coupon?.applicableRoles || ['all'],
    usageLimit: coupon?.usageLimit || '',
    perUserLimit: coupon?.perUserLimit || 1,
    validUntil: coupon?.validUntil
      ? new Date(coupon.validUntil).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: coupon?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // ⭐ Simplified — only "all" or "user" (loyalty)
  const handleRoleChange = (role) => {
    setForm((f) => ({ ...f, applicableRoles: [role] }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!form.code.trim()) return toast.error('Code is required')
    if (!form.validUntil) return toast.error('Expiry date required')

    setSaving(true)
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrderAmount: Number(form.minOrderAmount),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit),
      }

      const res = coupon?._id
        ? await couponsAPI.update(coupon._id, payload)
        : await couponsAPI.create(payload)

      toast.success(coupon?._id ? 'Coupon updated!' : 'Coupon created!')
      onSave(res.data.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* HEADER */}
        <div className="flex-shrink-0 bg-white border-b border-cream-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-heading font-bold text-chocolate-900">
              {coupon?._id ? '✏️ Edit Coupon' : '🎟️ New Coupon'}
            </h2>
            <p className="text-xs text-chocolate-500 mt-0.5">
              {coupon?._id
                ? 'Update the coupon details'
                : 'Create a new discount coupon'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-full transition"
          >
            <HiOutlineX className="w-5 h-5 text-chocolate-600" />
          </button>
        </div>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-chocolate-700">
              Coupon Code *
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="SAVE5"
              className="w-full px-4 py-3 rounded-xl border border-cream-300 uppercase focus:border-chocolate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-chocolate-700">
              Description
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="5% off instant discount"
              className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:border-chocolate-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                name="discountValue"
                type="number"
                value={form.discountValue}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 outline-none"
              />
            </div>
          </div>

          {form.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Max Discount Cap (₹){' '}
                <span className="text-chocolate-400 font-normal">optional</span>
              </label>
              <input
                name="maxDiscount"
                type="number"
                value={form.maxDiscount}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Min Order (₹)
              </label>
              <input
                name="minOrderAmount"
                type="number"
                value={form.minOrderAmount}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Valid Until *
              </label>
              <input
                name="validUntil"
                type="date"
                value={form.validUntil}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Total Uses{' '}
                <span className="text-chocolate-400 font-normal">
                  blank = unlimited
                </span>
              </label>
              <input
                name="usageLimit"
                type="number"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-chocolate-700">
                Per-User Limit
              </label>
              <input
                name="perUserLimit"
                type="number"
                value={form.perUserLimit}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 outline-none"
              />
            </div>
          </div>

          {/* ⭐ SIMPLIFIED ROLE SELECTOR — only "All" or "Loyalty" */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-chocolate-700">
              Coupon Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('all')}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  form.applicableRoles.includes('all')
                    ? 'bg-chocolate-800 text-white border-chocolate-800'
                    : 'bg-white text-chocolate-600 border-cream-300 hover:border-chocolate-400'
                }`}
              >
                <div className="text-2xl mb-1">🌐</div>
                <div className="font-bold text-sm">Public</div>
                <div
                  className={`text-xs mt-1 ${
                    form.applicableRoles.includes('all')
                      ? 'text-white/80'
                      : 'text-chocolate-500'
                  }`}
                >
                  Available to all users
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  form.applicableRoles.includes('user')
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-chocolate-600 border-cream-300 hover:border-primary-400'
                }`}
              >
                <div className="text-2xl mb-1">👑</div>
                <div className="font-bold text-sm">Loyalty</div>
                <div
                  className={`text-xs mt-1 ${
                    form.applicableRoles.includes('user')
                      ? 'text-white/80'
                      : 'text-chocolate-500'
                  }`}
                >
                  Only for customers with 5+ orders
                </div>
              </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-chocolate-500 mt-3 flex items-start gap-1.5">
              <span>💡</span>
              <span>
                {form.applicableRoles.includes('all')
                  ? 'This coupon will be visible and usable by everyone.'
                  : 'This is a loyalty reward — only customers who have completed 5 or more orders can see and use this coupon.'}
              </span>
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-cream-50 rounded-xl hover:bg-cream-100 transition">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-5 h-5 accent-chocolate-700"
            />
            <div>
              <span className="font-semibold text-chocolate-700 block">
                Coupon is Active
              </span>
              <span className="text-xs text-chocolate-500">
                Users can only apply active coupons at checkout
              </span>
            </div>
          </label>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 bg-white border-t border-cream-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-chocolate-600 font-medium hover:bg-cream-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl hover:bg-chocolate-700 disabled:opacity-60 flex items-center gap-2 shadow-lg"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HiOutlinePlus className="w-4 h-4" />
                {coupon?._id ? 'Update Coupon' : 'Create Coupon'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const { data } = await couponsAPI.getAll()
      setCoupons(data.data || [])
    } catch (err) {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSave = (saved) => {
    setCoupons((prev) => {
      const exists = prev.find((c) => c._id === saved._id)
      if (exists) return prev.map((c) => (c._id === saved._id ? saved : c))
      return [saved, ...prev]
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    try {
      await couponsAPI.delete(id)
      setCoupons((prev) => prev.filter((c) => c._id !== id))
      toast.success('Coupon deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  // Helper to display coupon type
  const getCouponTypeLabel = (roles) => {
    if (roles.includes('all')) return { label: '🌐 Public', color: 'bg-blue-100 text-blue-700' }
    if (roles.includes('user')) return { label: '👑 Loyalty (5+ orders)', color: 'bg-purple-100 text-purple-700' }
    return { label: roles.join(', '), color: 'bg-gray-100 text-gray-700' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">
            🎟️ Coupons
          </h1>
          <p className="text-chocolate-500 mt-1">
            {coupons.length} total ·{' '}
            {coupons.filter((c) => c.isActive).length} active
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl shadow-lg hover:bg-chocolate-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create Coupon
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-elegant">
          <HiOutlineTicket className="w-14 h-14 text-chocolate-300 mx-auto mb-4" />
          <p className="text-chocolate-500 mb-4">No coupons yet</p>
          <button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl hover:bg-chocolate-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => {
            const typeInfo = getCouponTypeLabel(c.applicableRoles || [])
            return (
              <motion.div
                key={c._id}
                layout
                className="bg-white rounded-2xl shadow-elegant border-2 border-dashed border-chocolate-200 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-chocolate-700 to-chocolate-900 p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase font-bold opacity-70">
                      Code
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${
                        c.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {c.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                  <p className="text-2xl font-black tracking-wider">{c.code}</p>
                  <p className="text-sm mt-1 opacity-80">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} OFF`}
                    {c.maxDiscount && ` (max ₹${c.maxDiscount})`}
                  </p>
                </div>

                <div className="p-4 space-y-2 text-sm">
                  {c.description && (
                    <p className="text-chocolate-600 line-clamp-2">
                      {c.description}
                    </p>
                  )}

                  {/* ⭐ Coupon type badge */}
                  <div>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>

                  <div className="flex justify-between text-chocolate-500 text-xs">
                    <span>Min order: ₹{c.minOrderAmount || 0}</span>
                    <span>
                      Used: {c.usedCount}
                      {c.usageLimit ? `/${c.usageLimit}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-chocolate-500 text-xs">
                    <span>Per user: {c.perUserLimit}</span>
                    <span>
                      Exp: {new Date(c.validUntil).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {c.isReferralReward && (
                    <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                      🎁 Referral Reward
                    </span>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-cream-100">
                    <button
                      onClick={() => {
                        setEditing(c)
                        setModalOpen(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-chocolate-600 hover:bg-cream-50 rounded-lg"
                    >
                      <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <CouponModal
            coupon={editing}
            onClose={() => {
              setModalOpen(false)
              setEditing(null)
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default CouponsPage