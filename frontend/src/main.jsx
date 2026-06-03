import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'
import { enableSecurityProtection } from './utils/security' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <App />
          <Toaster position="top-right" />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  </BrowserRouter>
)