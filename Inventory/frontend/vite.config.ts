import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['a07de615d670.ngrok-free.app'],
    port: 5173
  }
});

