import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/frontend': path.resolve(__dirname, './src/frontend'),
      '@/backend': path.resolve(__dirname, './src/backend'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  optimizeDeps: {
    include: ['@monaco-editor/react'],
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    host: process.env.VITE_HOST || 'localhost',
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:9871',
        changeOrigin: true,
      },
    },
  },
  build: {
    cssMinify: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'monaco-editor': ['@monaco-editor/react'],
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
})
