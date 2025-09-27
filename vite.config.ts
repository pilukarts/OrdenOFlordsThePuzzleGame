import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'frontend', // apunta a tu carpeta frontend
  plugins: [react()],
  server: {
    port: 3000
  }
})
