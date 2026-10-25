import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'সফর - গফরগাঁও স্মার্ট ট্রান্সপোর্ট ও ইমার্জেন্সি',
          short_name: 'সফর অ্যাপ',
          description: 'গফরগাঁওয়ের স্থানীয় যাত্রী ও চালকদের স্মার্ট ডিজিটাল প্ল্যাটফর্ম — লাইভ ম্যাপ, ভাড়ার হিসাব, নির্ভরযোগ্য চালক ও জরুরি সেবা।',
          theme_color: '#059669',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'download-zip-and-api-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.includes('safar-gafargaon-clean-source.zip')) {
              res.setHeader('Content-Disposition', 'attachment; filename="safar-gafargaon-clean-source.zip"');
              res.setHeader('Content-Type', 'application/zip');
            }

            if (req.url && (req.url === '/api/live/health' || req.url.startsWith('/api/live/health?'))) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({
                status: 'online',
                server: 'সফর গফরগাঁও বিল্ট-ইন লাইভ এজ সার্ভার',
                edgeColo: 'Local / Edge Simulator',
                timestamp: new Date().toISOString(),
                activeDriversCount: 12,
                activePassengersCount: 6,
                features: {
                  webSockets: true,
                  liveGpsStreaming: true,
                  emergencyAlerts: true
                }
              }));
              return;
            }

            if (req.url && (req.url === '/api/live/drivers' || req.url.startsWith('/api/live/drivers?'))) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({
                success: true,
                count: 12,
                message: 'Active drivers stream operational'
              }));
              return;
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
