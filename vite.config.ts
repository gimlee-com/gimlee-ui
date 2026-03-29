/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['gimlee.svg', 'favicon.ico', 'apple-touch-icon.png', 'gimlee-192x192.png', 'gimlee-512x512.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Gimlee Marketplace',
        short_name: 'Gimlee',
        description: 'Decentralized P2P Cryptocurrency Marketplace',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: 'gimlee.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'gimlee.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: 'gimlee-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'gimlee-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:12060',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@milkdown/react', '@milkdown/core', '@milkdown/ctx', '@milkdown/prose'],
  },
  css: {    modules: {
      generateScopedName: mode === 'production' ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['src/vitest-setup.ts'],
          globals: true,
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }
    ]
  }
}));