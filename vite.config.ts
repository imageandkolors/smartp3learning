import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    middlewareMode: false,
    hmr: {
      host: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      port: 443,
      protocol: 'wss'
    }
  }
})
