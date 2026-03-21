import { parseMarkdown } from 'markdown-three-parser'

self.onmessage = ({ data: { seq, text } }) => {
  const html = parseMarkdown(text)
  self.postMessage({ seq, html })
}