import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://leejyang00.github.io/52-card-workout/
export default defineConfig({
  base: '/52-card-workout/',
  plugins: [react(), tailwindcss()],
})
