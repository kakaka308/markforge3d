// blocks/blockquote.js
// 修复：改为工厂函数，消除模块级单例状态。
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'

export function createBlockquoteParser() {
  let inBlockquote = false
  let blockquoteLevel = 0

  return {
    flush(html) {
      if (blockquoteLevel > 0) {
        for (let i = 0; i < blockquoteLevel; i++) {
          html.push('</blockquote>')
        }
        blockquoteLevel = 0
        inBlockquote = false
      }
    },

    handle(line, html) {
      const blockquoteMatch = line.match(/^(\s*>+\s*)(.*)/)
      if (!blockquoteMatch) {
        if (inBlockquote) {
          this.flush(html)
        }
        return false
      }

      const quoteMarkers = blockquoteMatch[1].replace(/\s/g, '')
      const currentLevel = quoteMarkers.length
      const content = blockquoteMatch[2].trim()

      if (currentLevel !== blockquoteLevel) {
        if (currentLevel > blockquoteLevel) {
          for (let i = blockquoteLevel; i < currentLevel; i++) {
            html.push('<blockquote>')
          }
        } else {
          for (let i = blockquoteLevel; i > currentLevel; i--) {
            html.push('</blockquote>')
          }
        }
        blockquoteLevel = currentLevel
      }

      if (content) {
        let { text: protectedHtmlText, map: htmlMap } = protectHTML(content)
        let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)
        let processedContent = escapeHTML(protectedCodeText)
        processedContent = processedContent.replace(
          /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
          (_, expr) => renderMath(expr, false)
        )
        processedContent = restoreCode(processedContent, codeMap)
        processedContent = restoreHTML(processedContent, htmlMap)
        html.push(`<p>${processedContent}</p>`)
      }

      inBlockquote = true
      return true
    }
  }
}