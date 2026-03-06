import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'index.js',
      name: 'MarkdownThreeParser',
      fileName: (format) => `markdown-three-parser.${format}.js`
    },
    rollupOptions: {
      external: ['katex'],
      output: {
        globals: {
          katex: 'katex'
        }
      }
    }
  }
})