import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@chroma-core/default-embed': path.resolve(__dirname, './src/mocks/chroma-default-embed.ts'),
    },
  },
})
