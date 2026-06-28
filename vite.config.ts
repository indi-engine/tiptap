import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

const CSS_PLACEHOLDER = '__TIPTAP_ELEMENT_CSS_PLACEHOLDER__'

function inlineElementCss(): Plugin {
  return {
    name: 'inline-tiptap-element-css',
    enforce: 'post',
    generateBundle(_, bundle) {
      let cssFileName: string | undefined
      let cssSource: string | Uint8Array | undefined

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          cssFileName = fileName
          cssSource = chunk.source
          break
        }
      }

      if (!cssFileName || cssSource === undefined) return

      const cssSourceText =
        typeof cssSource === 'string'
          ? cssSource
          : Buffer.from(cssSource).toString('utf8')
      const escapedCss = JSON.stringify(cssSourceText)

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue
        chunk.code = chunk.code.replace(JSON.stringify(CSS_PLACEHOLDER), escapedCss)
      }

      delete bundle[cssFileName]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), inlineElementCss()],
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
