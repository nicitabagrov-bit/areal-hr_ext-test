import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    proxy: {
      // Все запросы на /api пересылаем на бэкенд,
      // предварительно убирая префикс /api:
      // фронт шлёт /api/auth/login, бэкенд получает /auth/login
      '/api': {
        target: 'http://localhost:3000', // <-- порт твоего бэкенда (вкладка «Порты» внизу VS Code)
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
