// vitest.config.js — 测试专用配置（从 vite.config.js 分离）
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mock = (name) => resolve(__dirname, `src/__mocks__/${name}`)

export default defineConfig({
  test: {
    environment: 'node',
    alias: [
      { find: /^prismjs\/components\/.*$/, replacement: mock('prismjs-lang.js') },
      { find: 'prismjs', replacement: mock('prismjs.js') },
      { find: 'katex',   replacement: mock('katex.js') }
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['*.js', 'blocks/**/*.js', 'utils/**/*.js'],
      exclude: ['vite.config.js', 'vitest.config.js', 'src/__mocks__/**']
    }
  }
})