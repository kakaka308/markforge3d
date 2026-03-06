// parseMarkdown.js
// 修复1（核心）：所有块级解析器改为工厂函数调用，
// 每次 parseMarkdown() 执行时创建全新的解析器实例，
// 彻底消除模块级单例状态导致的跨次解析状态污染 Bug。
import { flushParagraph } from './blocks/paragraph.js'
import { handleListItem, flushList } from './blocks/list.js'
import { createTableParser } from './blocks/table.js'
import { createBlockquoteParser } from './blocks/blockquote.js'
import { handleHeading } from './blocks/heading.js'
import { createCodeBlockParser } from './blocks/codeBlock.js'
import { createMathBlockParser } from './blocks/mathBlock.js'
import { createThreeBlockParser } from './blocks/threeBlock.js'
import { renderFootnotes } from './footnotes.js'

export default function parseMarkdown(markdownText) {
  if (!markdownText) return ''

  const lines = markdownText.split('\n')
  const html = []
  const listStack = []
  const paragraphLines = []
  const footnotes = {}
  const inlineFootnotes = {}

  // 每次调用创建全新的解析器实例，状态完全独立
  const codeBlock = createCodeBlockParser()
  const mathBlock = createMathBlockParser()
  const threeBlock = createThreeBlockParser()
  const tableParser = createTableParser()
  const blockquote = createBlockquoteParser()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ====== 分割线 ======
    if (/^(\*\s*\*\s*\*|---|___)\s*$/.test(line)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      html.push('<hr />')
      continue
    }

    // ====== 代码块 ======
    if (codeBlock.startOrEnd(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }
    if (codeBlock.isInBlock()) {
      codeBlock.handleLine(line)
      continue
    }

    // ====== 数学公式块 ======
    if (mathBlock.startOrEnd(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }
    if (mathBlock.isInBlock()) {
      mathBlock.handleLine(line)
      continue
    }

    // ====== Three.js 块 ======
    if (threeBlock.startOrEnd(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }
    if (threeBlock.isInBlock()) {
      threeBlock.handleObject(line)
      continue
    }

    // ====== 表格 ======
    if (line.trim().startsWith('|')) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (!tableParser.isInTable()) tableParser.start()
      tableParser.addRow(line)
      continue
    } else if (tableParser.isInTable()) {
      tableParser.parse(html)
    }

    // ====== 标题 ======
    if (handleHeading(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }

    // ====== 引用 ======
    if (blockquote.handle(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }

    // ====== 列表 ======
    if (handleListItem(line, html, listStack)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }

    // ====== 段落（空行处理）======
    if (line.trim() === '') {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (listStack.length > 0) {
        flushList(html, listStack)
      }

      // 统计连续空行，插入额外间距
      let extraEmptyLines = 0
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') {
        extraEmptyLines++
        j++
      }
      for (let k = 0; k < extraEmptyLines; k++) {
        html.push('<p><br /></p>')
      }
      i = j - 1
    } else {
      paragraphLines.push(line)
    }
  }

  // ====== 循环结束收尾 ======
  flushParagraph(paragraphLines, html, inlineFootnotes)
  flushList(html, listStack)
  blockquote.flush(html)
  if (tableParser.isInTable()) tableParser.parse(html)

  // 未闭合的块级元素强制关闭
  codeBlock.flush(html)
  mathBlock.flush(html)
  threeBlock.flush(html)

  // 脚注渲染
  renderFootnotes(html, footnotes, inlineFootnotes)

  return html.join('\n')
}