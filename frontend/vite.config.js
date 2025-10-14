import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- ⬇️ ADD THIS SERVER PROXY CONFIGURATION ⬇️ ---
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // Your backend server URL
        changeOrigin: true,
      },
    },
  },
})