// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },        // ✅ added for Vercel
  server: {
    port: 3000,                      // ✅ kept your port
    // proxy removed — client.js now uses full VITE_API_URL directly
  },
})