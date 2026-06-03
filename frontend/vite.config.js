import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ============ SERVER (Development) ============
  server: {
    host: '0.0.0.0',  // ⭐ Allow access from other devices on network
    port: 3000,
    open: true,
  },

  // ============ PREVIEW (Production Test) ============
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },

  // ============ PATH ALIASES ============
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@assets': '/src/assets',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@context': '/src/context',
      '@styles': '/src/styles',
    },
  },

  // ============ PRODUCTION BUILD (Security) ============
  build: {
    // ⭐ CRITICAL: Disable source maps (hides original code)
    sourcemap: false,

    // ⭐ Output directory
    outDir: 'dist',

    // ⭐ Clear output folder before build
    emptyOutDir: true,

    // ⭐ Use terser for better minification
    minify: 'terser',

    // ⭐ Terser options - aggressive minification
    terserOptions: {
      compress: {
        drop_console: true,        // Remove console.log in production
        drop_debugger: true,       // Remove debugger statements
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
        ],
        passes: 2,                 // Run compression twice
      },
      mangle: {
        toplevel: true,            // Mangle top-level variable names
        safari10: true,            // Safari 10 compatibility
      },
      format: {
        comments: false,           // Remove ALL comments
      },
    },

    // ⭐ Code splitting for better performance & smaller files
    rollupOptions: {
      output: {
        // Split vendor code into separate chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-icons'],
          'utils-vendor': ['axios', 'react-hot-toast'],
        },
        // ⭐ Use hash in filenames (cache-busting + hides original names)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // ⭐ Increase chunk size warning limit (large bundles are okay if split)
    chunkSizeWarningLimit: 1000,

    // ⭐ CSS code splitting
    cssCodeSplit: true,

    // ⭐ Asset inlining threshold (small files become base64)
    assetsInlineLimit: 4096,
  },

  // ============ OPTIMIZATIONS ============
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})