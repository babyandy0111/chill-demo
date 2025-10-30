import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const baseConfig = {
    plugins: [react(), basicSsl()], // Add the basicSsl plugin
    server: {
      // The https property is now handled by the plugin
    },
  };

  if (command === 'build') {
    return {
      ...baseConfig,
      base: '/chill-demo/', // For GitHub Pages deployment
    }
  } else {
    return {
      ...baseConfig,
      base: '/chill-demo', // For local development
    }
  }
})