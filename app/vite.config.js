import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({ transformAssetUrls }),
    quasar(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  hmr: {
    protocol: 'wss',
    host: 'unhallowed-spooky-haunting-jr9v757pvxq4h54p9-5173.app.github.dev',
  },
})
