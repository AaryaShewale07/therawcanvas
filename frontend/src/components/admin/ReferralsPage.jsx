import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineGift, HiOutlineUsers, HiOutlineCash } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { referralsAPI } from '../../utils/api'

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await referralsAPI.getAll()
        setReferrals(data.data || [])
      } catch (err) {
        toast.error('Failed to load referrals')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = {
    total: referrals.length,
    rewarded: referrals.filter((r) => r.status === 'rewarded').length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    totalPayout: referrals.filter((r) => r.status === 'rewarded').length * 100,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-chocolate-900">
          🎁 Referrals
        </h1>
        <p className="text-chocolate-500 mt-1">
          Track all referrals across your platform
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-elegant">
          <HiOutlineUsers className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-chocolate-900">{stats.total}</p>
          <p className="text-xs text-chocolate-500">Total Referrals</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-elegant">
          <HiOutlineGift className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-chocolate-900">{stats.rewarded}</p>
          <p className="text-xs text-chocolate-500">Rewarded</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-elegant">
          <HiOutlineUsers className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-chocolate-900">{stats.pending}</p>
          <p className="text-xs text-chocolate-500">Pending</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-elegant">
          <HiOutlineCash className="w-8 h-8 text-primary-500 mb-2" />
          <p className="text-2xl font-bold text-chocolate-900">₹{stats.totalPayout}</p>
          <p className="text-xs text-chocolate-500">Total Payout</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-elegant p-6">
        <h2 className="text-xl font-heading font-bold text-chocolate-900 mb-4">
          All Referrals
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
          </div>
        ) : referrals.length === 0 ? (
          <p className="text-center py-8 text-chocolate-500">No referrals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-chocolate-500 border-b border-cream-100">
                  <th className="pb-3 font-medium">Referrer</th>
                  <th className="pb-3 font-medium">Referee</th>
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Reward</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {referrals.map((r) => (
                  <tr key={r._id} className="border-b border-cream-50">
                    <td className="py-3">
                      <p className="font-semibold text-chocolate-900">
                        {r.referrer?.name}
                      </p>
                      <p className="text-xs text-chocolate-400">
                        {r.referrer?.email}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-chocolate-900">
                        {r.referee?.name}
                      </p>
                      <p className="text-xs text-chocolate-400">
                        {r.referee?.email}
                      </p>
                    </td>
                    <td className="py-3 font-mono text-xs text-chocolate-700">
                      {r.referralCodeUsed}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          r.status === 'rewarded'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-chocolate-600">
                      {r.rewardCoupon ? (
                        <>
                          <p className="font-mono font-bold">{r.rewardCoupon.code}</p>
                          <p className="text-xs text-chocolate-400">
                            ₹{r.rewardCoupon.discountValue} off
                          </p>
                        </>
                      ) : (
                        <span className="text-chocolate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-chocolate-500">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferralsPage