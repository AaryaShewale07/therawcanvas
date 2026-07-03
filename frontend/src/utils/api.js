import axios from 'axios'

// ⭐ Use environment variable with fallback
const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second default timeout
  headers: { 'Content-Type': 'application/json' },
})

// ============ REQUEST INTERCEPTOR ============
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token && token !== 'undefined' && token !== 'null' && token.length > 20) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (token === 'undefined' || token === 'null') {
      localStorage.removeItem('token')
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ============ RESPONSE INTERCEPTOR ============
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network error - check your connection')
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
      })
    }

    const status = error.response?.status
    const message = error.response?.data?.message || ''

    if (status === 401) {
      const isAuthIssue =
        message.toLowerCase().includes('malformed') ||
        message.toLowerCase().includes('jwt expired') ||
        message.toLowerCase().includes('invalid token') ||
        message.toLowerCase().includes('token failed')

      if (isAuthIssue) {
        console.warn('Session expired, clearing auth...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/'
        }
      }
    }

    if (status === 429) {
      console.warn('Too many requests')
    }

    if (status >= 500) {
      console.error('Server error:', message)
    }

    return Promise.reject(error)
  }
)

// ============ POSTS / PRODUCTS ============
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  getFeatured: () => api.get('/posts/featured'),
  getLatest: () => api.get('/posts/latest'),
  getStats: () => api.get('/posts/stats'),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
}

// ============ CART ============
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (postId, quantity = 1) => api.post('/cart/add', { postId, quantity }),
  update: (postId, quantity) => api.put('/cart/update', { postId, quantity }),
  remove: (postId) => api.delete(`/cart/remove/${postId}`),
  clear: () => api.delete('/cart/clear'),
}

// ============ WISHLIST ============
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (postId) => api.post('/wishlist/toggle', { postId }),
  remove: (postId) => api.delete(`/wishlist/${postId}`),
}

// ============ ORDERS ============
export const ordersAPI = {
  createRazorpayOrder: (amount) =>
    api.post('/orders/create-razorpay-order', { amount }, { timeout: 90000 }),
  checkout: (data) => api.post('/orders/checkout', data, { timeout: 90000 }),
  getMy: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  // ⭐ NEW — Check first-order referral discount
  checkReferralDiscount: () => api.get('/orders/check-referral-discount'),
  // Admin
  getAll: (params) => api.get('/dashboard/orders', { params }),
  getStats: () => api.get('/dashboard/orders/stats'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// ============ AUTH ============
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (data) => api.post('/auth/google', data), // ⭐ Added Google endpoint
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  verifyBackup: (data) => api.post('/auth/verify-backup', data), // ⭐ Added
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
}

// ============ REVIEWS ============
export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getStats: () => api.get('/reviews/stats'),
  getMy: () => api.get('/reviews/me'),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
}

// ============ BOOKINGS (Workshop) ============
export const bookingsAPI = {
  createOrder: (data) =>
    api.post('/bookings/create-order', data, { timeout: 90000 }),
  verifyPayment: (data) =>
    api.post('/bookings/verify', data, { timeout: 90000 }),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: () => api.get('/bookings'),
}

// ============ CONTACT ============
export const contactAPI = {
  send: (data) => api.post('/contact', data),
}

// ============ NEWSLETTER ============
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
  unsubscribe: (email) => api.post('/newsletter/unsubscribe', { email }),
}

// ============ DASHBOARD (Admin) ============
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  getOrders: (params) => api.get('/dashboard/orders', { params }),
  getOrderStats: () => api.get('/dashboard/orders/stats'),
}

// ============ COUPONS ============
export const couponsAPI = {
  // User
  validate: (code, orderAmount) =>
    api.post('/coupons/validate', { code, orderAmount }),
  getMy: () => api.get('/coupons/my'),
  // Admin
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
}

// ============ REFERRALS ============
export const referralsAPI = {
  getMy: () => api.get('/referrals/my'),
  apply: (code) => api.post('/referrals/apply', { referralCode: code }),
  // Admin
  getAll: () => api.get('/referrals/admin/all'),
  triggerReward: (orderId) =>
    api.post(`/referrals/admin/trigger-reward/${orderId}`),
}

export default api