// blocks/paragraph.js
// 修复5：将内联语法的处理抽取为独立的 parseInline 函数，
// 明确处理优先级，修复多个删除线的惰性匹配边界问题。
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'
import { parseAttrs } from '../utils/attrs.js'

/**
 * 处理内联语法，按优先级排队：
 * 1. 保护 HTML 标签 & 内联代码（避免其内容被后续规则干扰）
 * 2. 数学公式 $...$
 * 3. 脚注引用
 * 4. 图片 ![alt](src){attrs}
 * 5. 嵌入链接 [text](url){embed}
 * 6. 普通链接 [text](url)
 * 7. 粗斜体 ***...***
 * 8. 粗体 **...**
 * 9. 斜体 *...*
 * 10. 删除线 ~~...~~（修复：改用贪婪匹配避免跨 ~~ 干扰）
 * 11. 脚注定义引用 [^key]
 * 12. 恢复代码 & HTML
 */
export function parseInline(text, inlineFootnotes) {
  // Step 1: 保护已有 HTML 标签和内联代码
  let { text: protectedHtmlText, map: htmlMap } = protectHTML(text)
  let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)

  // Step 2: 转义普通文本中的 HTML 特殊字符
  let out = escapeHTML(protectedCodeText)

  // Step 3: 数学公式
  out = out.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, expr) =>
    renderMath(expr.trim(), false)
  )

  // Step 4: 脚注内联 [^key](content)
  out = out.replace(/\[\^(.+?)\]\((.+?)\)/g, (_, key, content) => {
    const footnoteKey = key.trim() || `inline-${Object.keys(inlineFootnotes).length + 1}`
    inlineFootnotes[footnoteKey] = escapeHTML(content)
    return `<sup id="ref-${footnoteKey}"><a href="#footnote-${footnoteKey}">${footnoteKey}</a></sup>`
  })

  // Step 5: 图片 ![alt](src){attrs}
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
    const extra = attrStr ? ' ' + parseAttrs(attrStr) : ''
    return `<img alt="${escapeHTML(alt)}" src="${escapeHTML(src)}"${extra} />`
  })

  // Step 6: 嵌入链接 [text](url){embed}
  out = out.replace(
    /\[([^\]]+?)\]\(([^)]+)\)\{embed\}/g,
    (_, linkText, url) =>
      `<iframe src="${escapeHTML(url)}" title="${escapeHTML(linkText)}" width="100%" height="400px" style="border:none;"></iframe>`
  )

  // Step 7: 普通链接 [text](url)
  out = out.replace(
    /\[([^\]]+?)\]\(([^)]+)\)/g,
    (_, linkText, url) =>
      `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" ` +
      `data-link-text="${escapeHTML(linkText)}" data-url="${escapeHTML(url)}">${escapeHTML(linkText)}</a> ` +
      `<button class="embed-toggle-btn">内嵌</button>`
  )

  // Step 8-10: 文本样式（必须按 *** > ** > * 顺序处理）
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // 修复5：删除线改用非贪婪但加边界限制，防止跨行误匹配
  out = out.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')

  // Step 11: 脚注引用 [^key]
  out = out.replace(
    /\[\^(.+?)\]/g,
    (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`
  )

  // Step 12: 恢复被保护的代码和 HTML 标签
  out = restoreCode(out, codeMap)
  out = restoreHTML(out, htmlMap)

  return out
}

export function flushParagraph(paragraphLines, html, inlineFootnotes) {
  if (paragraphLines.length === 0) return

  let text = paragraphLines.join('\n')
  let processedText = parseInline(text, inlineFootnotes)

  // 段落内换行转 <br>
  processedText = processedText.replace(/\n/g, '<br />')

  html.push(`<p>${processedText}</p>`)
  paragraphLines.length = 0
}