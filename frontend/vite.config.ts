import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy: o browser chama /api/... e o Vite encaminha para o Adonis (:3333).
// Assim você não precisa lidar com CORS na prática do dia a dia.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
})
