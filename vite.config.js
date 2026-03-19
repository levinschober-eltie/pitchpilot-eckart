import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Eckart Werke - Energietransformation',
        short_name: 'Eckart Energie',
        description: 'Phasenkonzept zur ganzheitlichen Energietransformation',
        start_url: '/pitchpilot-eckart/',
        scope: '/pitchpilot-eckart/',
        display: 'standalone',
        background_color: '#1B2A4A',
        theme_color: '#1B2A4A',
        icons: [
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-chunks',
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.energy-charts\.info\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'energy-api',
              expiration: { maxEntries: 5, maxAgeSeconds: 24 * 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/archive-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'solar-api',
              expiration: { maxEntries: 5, maxAgeSeconds: 7 * 24 * 60 * 60 },
              networkTimeoutSeconds: 15,
            },
          },
        ],
      },
    }),
  ],
  base: '/pitchpilot-eckart/',
  build: {
    sourcemap: 'hidden',
    target: ['es2020', 'chrome80', 'firefox80', 'safari14', 'edge80'],
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
