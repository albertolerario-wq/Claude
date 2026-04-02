import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is set during CI (GitHub Pages) to '/Claude/bue/'
// On Replit / local dev it defaults to '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    host: true,
    port: 5174,
  },
})
