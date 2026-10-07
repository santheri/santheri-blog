import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.santheribhat.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api.santheribhat.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
