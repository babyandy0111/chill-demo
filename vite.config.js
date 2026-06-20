import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import basicSsl from '@vitejs/plugin-basic-ssl' // Commented out

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const baseConfig = {
    plugins: [react({
      babel: {
        plugins: ['./cga-plugin.cjs']
      }
    }), /* basicSsl() */], // Add the basicSsl plugin
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      allowedHosts: true,
      host: true,
      // The https property is now handled by the plugin
    },
  };

  if (command === 'build') {
    return {
      ...baseConfig,
      base: '/', // For GitHub Pages deployment
    }
  } else {
    return {
      ...baseConfig,
      base: '/', // For local development
    }
  }
})