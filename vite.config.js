import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pitchpilot-eckart/',
  build: {
    target: ['es2015', 'chrome64', 'firefox60', 'safari11.1', 'edge79'],
  },
})
