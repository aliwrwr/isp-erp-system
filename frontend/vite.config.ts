import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',   // Changed to absolute path to fix nested route history mode issues
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',   // inline the SW registration script into index.html (avoids missing registerSW.js with base:./)
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: false,  // use public/manifest.json instead (avoids base:'./' path issues)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,   // ظٹط³ظ…ط­ ط¨ط§ظ„ظˆطµظˆظ„ ظ…ظ† ط§ظ„ط´ط¨ظƒط© ط§ظ„ظ…ط­ظ„ظٹط©
    port: 5180,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5180,
    strictPort: true,
  },
})

