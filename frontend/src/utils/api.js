import axios from 'axios'

// ⭐ Use environment variable with fallback
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: { 'Content-Type': 'application/json' },
})

// ============ REQUEST INTERCEPTOR ============
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    // ⭐ Only attach valid tokens (prevents "Bearer undefined" issues)
    if (token && token !== 'undefined' && token !== 'null' && token.length > 20) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (token === 'undefined' || token === 'null') {
      // Clean up invalid tokens
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
    // Network error (no internet)
    if (!error.response) {
      console.error('Network error - check your connection')
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
      })
    }

    const status = error.response?.status
    const message = error.response?.data?.message || ''

    // ⭐ Auto-logout only on truly invalid tokens
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

        // Only redirect from admin pages (not on every 401)
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/'
        }
      }
    }

    // ⭐ Rate limit error (429)
    if (status === 429) {
      console.warn('Too many requests')
    }

    // ⭐ Server error (500+)
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
  createRazorpayOrder: (amount) => api.post('/orders/create-razorpay-order', { amount }),
  checkout: (data) => api.post('/orders/checkout', data),
  getMy: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  // Admin
  getAll: (params) => api.get('/dashboard/orders', { params }),
  getStats: () => api.get('/dashboard/orders/stats'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// ============ AUTH ============
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
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
  createOrder: (data) => api.post('/bookings/create-order', data),
  verifyPayment: (data) => api.post('/bookings/verify', data),
  getById: (id) => api.get(`/bookings/${id}`),
  // Admin
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

export default api