import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Banque IA',
        short_name: 'BanqueIA',
        start_url: '/',
        display: 'standalone',
        background_color: '#061a33',
        theme_color: '#0b2f5b',
        icons: [
          {
            src: '/logo-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})