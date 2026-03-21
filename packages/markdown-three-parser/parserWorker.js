import { parseMarkdown } from './index.js'

self.onmessage = ({ data: { seq, text } }) => {
  const html = parseMarkdown(text)
  self.postMessage({ seq, html })
}