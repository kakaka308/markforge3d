import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mock = (name) => resolve(__dirname, `src/__mocks__/${name}`)

export default defineConfig({
  test: {
    environment: 'node',
    alias: [
      // 先匹配语言包（更具体的规则放前面）
      { find: /^prismjs\/components\/.*$/, replacement: mock('prismjs-lang.js') },
      // 再匹配主包
      { find: 'prismjs', replacement: mock('prismjs.js') },
      { find: 'katex',   replacement: mock('katex.js') },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['*.js', 'blocks/**/*.js', 'utils/**/*.js'],
      exclude: ['vite.config.js', 'src/__mocks__/**']
    }
  }
})