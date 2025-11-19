import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base for GitHub Pages deployment
  // Change to '/' if using a custom domain like elliottelford.com
  base: process.env.GITHUB_PAGES ? '/Mercury/' : '/',
  build: {
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
        },
      },
    },
  },
})
