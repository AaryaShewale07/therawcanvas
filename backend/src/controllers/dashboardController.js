import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Order from '../models/Order.js'
import Booking from '../models/Booking.js'

const percentChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

// Helper: Calculate revenue for a specific category from ORDERS
const calculateOrderCategoryRevenue = async (category) => {
  const result = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        orderStatus: { $ne: 'cancelled' },
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.category': category,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        count: { $sum: '$items.quantity' },
      },
    },
  ])
  return {
    revenue: result[0]?.total || 0,
    itemsSold: result[0]?.count || 0,
  }
}

// Helper: Calculate revenue from WORKSHOP BOOKINGS
const calculateBookingRevenue = async () => {
  const result = await Booking.aggregate([
    {
      $match: {
        status: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        count: { $sum: '$peopleCount' },
      },
    },
  ])
  return {
    revenue: result[0]?.total || 0,
    itemsSold: result[0]?.count || 0,
  }
}

// @desc    Get dashboard overview stats
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalUsers,
    usersThisMonth,
    usersLastMonth,
    artCount,
    chocolatesCount,
    giftingCount,
    workshopsCount,
    artLastMonth,
    chocolatesLastMonth,
    giftingLastMonth,
    workshopsLastMonth,
    totalViews,
    recentPosts,
    totalOrderRevenueAgg,
    artRevenue,
    chocolatesRevenue,
    giftingRevenue,
    workshopsOrderRevenue,
    bookingRevenue,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    Post.countDocuments({ category: 'art' }),
    Post.countDocuments({ category: 'chocolates' }),
    Post.countDocuments({ category: 'gifting' }),
    Post.countDocuments({ category: 'workshops' }),
    Post.countDocuments({
      category: 'art',
      createdAt: { $lte: endOfLastMonth },
    }),
    Post.countDocuments({
      category: 'chocolates',
      createdAt: { $lte: endOfLastMonth },
    }),
    Post.countDocuments({
      category: 'gifting',
      createdAt: { $lte: endOfLastMonth },
    }),
    Post.countDocuments({
      category: 'workshops',
      createdAt: { $lte: endOfLastMonth },
    }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt')
      .populate('createdBy', 'name'),
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    calculateOrderCategoryRevenue('art'),
    calculateOrderCategoryRevenue('chocolates'),
    calculateOrderCategoryRevenue('gifting'),
    calculateOrderCategoryRevenue('workshops'),
    calculateBookingRevenue(),
  ])

  const growthValue = percentChange(usersThisMonth, usersLastMonth)
  const totalViewsValue = totalViews[0]?.total || 0
  const totalOrderRevenue = totalOrderRevenueAgg[0]?.total || 0

  // ⭐ Total Revenue = Orders + Bookings
  const totalRevenue = totalOrderRevenue + bookingRevenue.revenue

  // ⭐ Workshop revenue = Order workshops + Booking workshops
  const totalWorkshopRevenue = workshopsOrderRevenue.revenue + bookingRevenue.revenue
  const totalWorkshopUnits = workshopsOrderRevenue.itemsSold + bookingRevenue.itemsSold

  const formatTimeAgo = (date) => {
    const diff = Math.floor((now - new Date(date)) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return new Date(date).toLocaleDateString()
  }

  res.json({
    success: true,
    data: {
      quickStats: {
        totalUsers,
        revenue: totalRevenue,
        pageViews: totalViewsValue,
        growth: growthValue,
      },
      contentStats: {
        art: {
          value: artCount,
          change: percentChange(artCount - artLastMonth, artLastMonth),
          revenue: artRevenue.revenue,
          itemsSold: artRevenue.itemsSold,
        },
        chocolates: {
          value: chocolatesCount,
          change: percentChange(chocolatesCount - chocolatesLastMonth, chocolatesLastMonth),
          revenue: chocolatesRevenue.revenue,
          itemsSold: chocolatesRevenue.itemsSold,
        },
        gifting: {
          value: giftingCount,
          change: percentChange(giftingCount - giftingLastMonth, giftingLastMonth),
          revenue: giftingRevenue.revenue,
          itemsSold: giftingRevenue.itemsSold,
        },
        workshops: {
          value: workshopsCount,
          change: percentChange(workshopsCount - workshopsLastMonth, workshopsLastMonth),
          revenue: totalWorkshopRevenue,  // ⭐ NOW INCLUDES BOOKINGS
          itemsSold: totalWorkshopUnits,   // ⭐ NOW INCLUDES TICKETS
        },
      },
      recentPosts: recentPosts.map((p) => ({
        id: p._id,
        title: p.title,
        category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
        status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
        date: formatTimeAgo(p.createdAt),
        author: p.createdBy?.name || 'Unknown',
      })),
    },
  })
})

// @desc    Get all orders for admin with filters
// @route   GET /api/dashboard/orders
// @access  Private/Admin
export const getAdminOrders = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query

  let query = {}

  if (status && status !== 'all') {
    query.orderStatus = status
  }

  let orders = await Order.find(query)
    .populate('user', 'name email phone')
    .sort('-createdAt')

  if (category && category !== 'all') {
    orders = orders.filter((order) =>
      order.items.some((item) => item.category === category)
    )
  }

  if (search) {
    const searchLower = search.toLowerCase()
    orders = orders.filter(
      (order) =>
        order._id.toString().toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.shippingAddress?.phone?.includes(search)
    )
  }

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  })
})

// @desc    Get order statistics
// @route   GET /api/dashboard/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    placedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    revenueAgg,
    bookingRevenueAgg,
  ] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ orderStatus: 'placed' }),
    Order.countDocuments({ orderStatus: 'shipped' }),
    Order.countDocuments({ orderStatus: 'delivered' }),
    Order.countDocuments({ orderStatus: 'cancelled' }),
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ])

  const orderRevenue = revenueAgg[0]?.total || 0
  const bookingRevenue = bookingRevenueAgg[0]?.total || 0
  const totalRevenue = orderRevenue + bookingRevenue

  res.json({
    success: true,
    data: {
      totalOrders,
      placedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    },
  })
})