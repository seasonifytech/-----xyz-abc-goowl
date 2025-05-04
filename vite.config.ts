import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig, Plugin } from "vite";
import path from "path";
import workboxBuild from 'workbox-build';

// Custom plugin to generate service worker
const generateSW = (): Plugin => ({
  name: 'generate-sw',
  async writeBundle() {
    const { count, size, warnings } = await workboxBuild.generateSW({
      swDest: 'dist/sw.js',
      globDirectory: 'dist',
      globPatterns: [
        '**/*.{html,js,css,png,jpg,jpeg,gif,svg,woff,woff2}'
      ],
      skipWaiting: true,
      clientsClaim: true,
      navigateFallback: '/index.html',
      navigateFallbackAllowlist: [/^(?!\/__).*/],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60
            }
          }
        },
        {
          urlPattern: /^https:\/\/tttjywqokdcktgqplksf\.supabase\.co/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60
            }
          }
        }
      ]
    });
    
    console.log('Generated service worker:', { count, size, warnings });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generateSW()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  resolve: {
    alias: {
      // Add alias to help resolve together-ai package
      'together-ai': path.resolve(__dirname, 'node_modules/together-ai')
    }
  },
  optimizeDeps: {
    include: ['together-ai']
  }
});