import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,   // يسمح بالوصول من الشبكة المحلية
    port: 5173,
  },
  preview: {
    host: true,   // يسمح بالوصول من الشبكة المحلية في وضع الإنتاج
    port: 5173,
  },
})
