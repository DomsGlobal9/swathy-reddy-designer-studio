import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/intake': {
        target: 'https://crm-b-ry43.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
