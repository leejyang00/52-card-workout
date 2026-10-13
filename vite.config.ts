import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://burno.app (custom domain on GitHub Pages)
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // challenge.html is the same app with its own link preview. GitHub Pages serves it at
      // /challenge, so challenge links work without a router.
      input: { main: 'index.html', challenge: 'challenge.html' },
    },
  },
})
