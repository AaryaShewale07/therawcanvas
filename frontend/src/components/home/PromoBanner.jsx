import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'
import api from '../../utils/api'

const THEMES = {
    chocolate: {
        bg: 'from-chocolate-800 via-chocolate-900 to-chocolate-800',
        badge: 'bg-gold-500 text-chocolate-900',
        btn: 'bg-gold-500 text-chocolate-900 hover:bg-gold-400',
    },
    gold: {
        bg: 'from-amber-500 via-yellow-500 to-amber-600',
        badge: 'bg-chocolate-900 text-gold-400',
        btn: 'bg-chocolate-900 text-white hover:bg-chocolate-800',
    },
    pink: {
        bg: 'from-pink-500 via-rose-500 to-pink-600',
        badge: 'bg-white text-pink-600',
        btn: 'bg-white text-pink-600 hover:bg-pink-50',
    },
    purple: {
        bg: 'from-purple-600 via-indigo-600 to-purple-700',
        badge: 'bg-yellow-400 text-purple-900',
        btn: 'bg-white text-purple-700 hover:bg-purple-50',
    },
    festive: {
        bg: 'from-red-600 via-orange-500 to-yellow-500',
        badge: 'bg-white text-red-600',
        btn: 'bg-white text-red-600 hover:bg-red-50',
    },
    green: {
        bg: 'from-emerald-600 via-green-600 to-emerald-700',
        badge: 'bg-yellow-400 text-green-900',
        btn: 'bg-white text-green-700 hover:bg-green-50',
    },
}

const PromoBanner = () => {
    const [banners, setBanners] = useState([])
    const [currentIdx, setCurrentIdx] = useState(0)

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await api.get('/banners')
                setBanners(res.data.data || [])
            } catch (err) {
                console.error('Failed to load banners:', err)
            }
        }
        fetchBanners()
    }, [])

    useEffect(() => {
        if (banners.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIdx((i) => (i + 1) % banners.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [banners.length])

    if (banners.length === 0) return null

    const banner = banners[currentIdx]
    const theme = THEMES[banner.theme] || THEMES.chocolate

    const prev = () =>
        setCurrentIdx((i) => (i - 1 + banners.length) % banners.length)
    const next = () => setCurrentIdx((i) => (i + 1) % banners.length)

    return (
        <AnimatePresence mode="wait">
            <motion.section
                key={banner._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={`relative w-full bg-gradient-to-r ${theme.bg} overflow-hidden shadow-md`}
            >
                {/* Pattern overlay */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {banner.image && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <img
                            src={banner.image}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* ⭐ Compact mobile layout with proper spacing */}
                <div className="relative w-full px-3 sm:px-6 lg:px-10 pt-5 pb-5 sm:py-9">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-5 flex-nowrap sm:flex-wrap text-center">
                        {banners.length > 1 && (
                            <button
                                onClick={prev}
                                className="hidden sm:flex flex-shrink-0 bg-white/15 hover:bg-white/30 text-white rounded-full p-1.5 transition"
                                aria-label="Previous banner"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                        )}

                        {/* Smaller badge on mobile */}
                        {banner.badge && (
                            <span
                                className={`${theme.badge} px-1.5 py-0.5 sm:px-2.5 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wide shadow-md whitespace-nowrap flex-shrink-0 mt-3.5 sm:mt-0`}
                            >
                                {banner.badge}
                            </span>
                        )}

                        {/* MUCH smaller text on mobile + truncate long text */}
                        <div className="text-white min-w-0 flex-1 sm:flex-initial mt-3.5 sm:mt-0">
                            <p className="text-[11px] sm:text-xl font-bold leading-tight truncate">
                                {banner.title}
                            </p>
                            {banner.subtitle && (
                                <p className="text-[9px] sm:text-base text-white/90 leading-tight truncate">
                                    {banner.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Compact button on mobile */}
                        {banner.buttonText && banner.buttonLink && (
                            <Link
                                to={banner.buttonLink}
                                className={`${theme.btn} px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 whitespace-nowrap flex-shrink-0 mt-3.5 sm:mt-0`}
                            >
                                {banner.buttonText} →
                            </Link>
                        )}

                        {banners.length > 1 && (
                            <button
                                onClick={next}
                                className="hidden sm:flex flex-shrink-0 bg-white/15 hover:bg-white/30 text-white rounded-full p-1.5 transition"
                                aria-label="Next banner"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* ⭐ FIXED: Tiny dots with inline styles to guarantee sizing */}
                    {banners.length > 1 && (
                        <div className="flex justify-center items-center gap-1.5 mt-3 sm:mt-4">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIdx(idx)}
                                    style={{
                                        height: '4px',
                                        width: idx === currentIdx ? '18px' : '4px',
                                        backgroundColor:
                                            idx === currentIdx
                                                ? 'rgba(255,255,255,1)'
                                                : 'rgba(255,255,255,0.4)',
                                        borderRadius: '9999px',
                                        transition: 'all 0.3s ease',
                                        padding: 0,
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    aria-label={`Go to banner ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.section>
        </AnimatePresence>
    )
}

export default PromoBanner