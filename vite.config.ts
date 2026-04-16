import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/logo-hospital.png', 'fonts/*.woff2'],
      manifest: {
        name: 'Hospital Nivel 1 Puerto Esperanza Misiones',
        short_name: 'Hospital Esperanza',
        description: 'Información y servicios del hospital desde tu celular',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#1e40af',
        theme_color: '#1e40af',
        orientation: 'portrait-primary',
        lang: 'es-AR',
        icons: [
          {
            src: 'icons/logo-hospital.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})