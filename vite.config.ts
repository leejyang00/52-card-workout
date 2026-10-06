import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://burno.app (custom domain on GitHub Pages)
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
