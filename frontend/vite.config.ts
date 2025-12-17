import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        // Treat SVGs as icons (scales to 1em)
        icon: true,
      },
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sports',
        short_name: 'Sports',
        description: 'Track exercises and statistics',
        // Should match CSS --main-bg in dark theme to avoid a visible seam under Android status bar
        theme_color: '#2e2e2e',
        background_color: '#2e2e2e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable',
          },
          {
            src: '/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@uikit': path.resolve(__dirname, './UiKit'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
