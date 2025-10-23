import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      base: '/chill-demo/', // For GitHub Pages deployment
      plugins: [react()],
    }
  } else {
    return {
      base: '/', // For local development
      plugins: [react(),cesium()],
    }
  }
})