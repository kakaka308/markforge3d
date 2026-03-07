// blocks/heading.js
// 修复12：正则从 {1,5} 改为 {1,6}，正确支持标准 Markdown 的全部六级标题。
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'

export function handleHeading(line, html, lineNo = 0) {
  const headingMatch = line.trim().match(/^(#{1,6})\s+(.*)/)
  if (!headingMatch) return false

  const level = headingMatch[1].length
  let content = headingMatch[2]

  let { text: protectedHtmlText, map: htmlMap } = protectHTML(content)
  let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)
  let processedContent = escapeHTML(protectedCodeText)

  processedContent = processedContent.replace(
    /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
    (_, expr) => renderMath(expr, false)
  )

  processedContent = restoreCode(processedContent, codeMap)
  processedContent = restoreHTML(processedContent, htmlMap)

  const id = content.trim().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase()
  html.push(`<h${level} id="${id}" data-line="${lineNo}">${processedContent}</h${level}>`)
  return true
}