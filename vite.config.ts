import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // '' loads non-VITE_ vars too; SCALEEZY_PORTAL_KEY stays on the dev server, like api/proxy.js in production.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/intake': {
          target: env.SCALEEZY_BASE_URL || 'https://crm-b-ry43.onrender.com',
          changeOrigin: true,
          secure: false,
          headers: { 'X-Portal-Key': env.SCALEEZY_PORTAL_KEY || '' }
        }
      }
    }
  };
});
