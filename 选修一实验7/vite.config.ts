import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [react(), cesium()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Use relative asset URLs so this app works both from its own preview server
  // and when the built directory is mounted below the main GeoSim site.
  base: './',
  build: {
    outDir: '../public/选修一实验7',
    emptyOutDir: true,
    rollupOptions: {
      external: ['cesium'],
    },
  },
})
