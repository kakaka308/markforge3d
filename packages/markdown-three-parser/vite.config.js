import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'index.js', // 相对于 markdown-three-parser 根目录
      name: 'MarkdownThreeParser', // 打包后UMD库的全局变量名
      fileName: (format) => `markdown-three-parser.${format}.js`
    },
    rollupOptions: {
      external: ['katex'], // katex 不打包进来
      output: {
        globals: {
          katex: 'katex'
        }
      }
    }
  }
});
