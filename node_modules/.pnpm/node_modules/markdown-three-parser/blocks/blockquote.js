// blocks/blockquote.js
// 修复多级引用：
// 1. 正确计算 > 的数量（原来用 replace(/\s/g,'') 会把 "> >" 变成 ">>" 计2层，但 ">> " 也计2层，没问题）
//    真正的 bug 是：parseMarkdown 里 handleHeading 先于 handleBlockquote 执行，
//    导致 "> ## 标题" 被标题拦截。修复在 parseMarkdown.js 里调换顺序。
// 2. 空行（仅含 ">"）时保持引用上下文，不 flush。
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'

export function createBlockquoteParser() {
  let blockquoteLevel = 0

  return {
    isInBlockquote() {
      return blockquoteLevel > 0
    },

    flush(html) {
      for (let i = 0; i < blockquoteLevel; i++) {
        html.push('</blockquote>')
      }
      blockquoteLevel = 0
    },

    handle(line, html, lineNo = 0) {
      const blockquoteMatch = line.match(/^((?:>\s*)+)(.*)/)
      if (!blockquoteMatch) {
        this.flush(html)
        return false
      }

      const currentLevel = (blockquoteMatch[1].match(/>/g) || []).length
      const content = blockquoteMatch[2].trim()

      if (currentLevel > blockquoteLevel) {
        for (let i = blockquoteLevel; i < currentLevel; i++) {
          // 只在开启新层时注入行号
          html.push(`<blockquote data-line="${lineNo}">`)
        }
      } else if (currentLevel < blockquoteLevel) {
        for (let i = blockquoteLevel; i > currentLevel; i--) {
          html.push('</blockquote>')
        }
      }
      blockquoteLevel = currentLevel

      if (content) {
        let { text: protectedHtmlText, map: htmlMap } = protectHTML(content)
        let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)
        let processedContent = escapeHTML(protectedCodeText)
        processedContent = processedContent.replace(
          /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
          (_, expr) => renderMath(expr, false)
        )
        processedContent = processedContent.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        processedContent = processedContent.replace(/\*(.+?)\*/g, '<em>$1</em>')
        processedContent = processedContent.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')
        processedContent = restoreCode(processedContent, codeMap)
        processedContent = restoreHTML(processedContent, htmlMap)
        html.push(`<p>${processedContent}</p>`)
      }

      return true
    }
  }
}