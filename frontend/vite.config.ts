import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [react(), tailwindcss(),
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'cypress/**/*', 'src/types/**'],
      extension: ['.js', '.ts', '.tsx'],
      requireEnv: true,
      cypress: true
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
});

/// <reference types="vite/client" />