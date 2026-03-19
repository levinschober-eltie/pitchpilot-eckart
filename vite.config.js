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
      },
    }),
  ],
  base: '/pitchpilot-eckart/',
  build: {
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
