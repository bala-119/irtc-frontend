import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/irtc-frontend/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/v1/user': 'http://localhost:3001',
      '/v1/train': {
        target: 'http://localhost:3003',
        rewrite: (path) => path.replace(/^\/v1\/train/, '/train')
      },
      '/v1/booking': 'http://localhost:3004',
      '/v1/payment': {
        target: 'http://localhost:3005',
        rewrite: (path) => path.replace(/^\/v1\/payment/, '/api/payments')
      }
    }
  }
});
