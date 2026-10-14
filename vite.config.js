import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createGeoLabApi } from './server/geolabApi.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function copyDir(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  const entries = readdirSync(src)
  for (const entry of entries) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === '1' ? '/GeoLab-high-school-geography-agh/' : '/',
  plugins: [
    react(),
    {
      name: 'geolab-agh-bff',
      configureServer(server) {
        server.middlewares.use(createGeoLabApi())
      },
      configurePreviewServer(server) {
        server.middlewares.use(createGeoLabApi())
      },
    },
    {
      name: 'cesium-assets',
      configureServer() {
        const cesiumSrc = join(__dirname, 'node_modules/cesium/Build/Cesium')
        const cesiumDest = join(__dirname, 'public/cesium')
        if (!existsSync(join(cesiumDest, 'Workers'))) {
          console.log('[cesium] Copying assets to public/cesium ...')
          copyDir(cesiumSrc, cesiumDest)
          console.log('[cesium] Copy done.')
        }
      },
      closeBundle() {
        const cesiumSrc = join(__dirname, 'node_modules/cesium/Build/Cesium')
        const cesiumDest = join(__dirname, 'dist/cesium')
        console.log('[cesium] Copying assets to dist/cesium ...')
        copyDir(cesiumSrc, cesiumDest)
        console.log('[cesium] Copy done.')

        const pictureSrc = join(__dirname, 'public/picture')
        const pictureDest = join(__dirname, 'dist/picture')
        if (existsSync(pictureSrc)) {
          console.log('[picture] Copying assets to dist/picture ...')
          copyDir(pictureSrc, pictureDest)
          console.log('[picture] Copy done.')
        }
      },
    },
  ],
  build: {
    assetsDir: 'assets',
    chunkSizeWarningLimit: 4000,
  },
})
