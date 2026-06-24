import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
     lib: {
       entry: path.resolve(__dirname, 'src/tiptap-element.ts'),
       name: 'TiptapElement',
       fileName: 'tiptap-element',
       formats: ['es'],
     },
     cssCodeSplit: false
  }
})