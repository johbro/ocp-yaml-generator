import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Set VITE_BASE at build time when deploying to GitHub Pages project site
// e.g. VITE_BASE=/ocp-yaml-generator/ npm run build
export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE || '/',
})
