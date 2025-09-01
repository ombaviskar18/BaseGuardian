import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    force: true,
  },
  resolve: {
    alias: {},
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
