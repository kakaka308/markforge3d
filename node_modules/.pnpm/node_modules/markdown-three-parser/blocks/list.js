// blocks/list.js
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'

export function flushList(html, listStack) {
  while (listStack.length > 0) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
  }
}

export function handleListItem(line, html, listStack, lineNo = 0) {
  const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/)
  if (!match) return false

  const indent = match[1].length
  const marker = match[2]
  const content = match[3]
  const level = Math.floor(indent / 2)
  const isOrdered = /^\d+\./.test(marker)
  const currentTag = isOrdered ? 'ol' : 'ul'

  while (listStack.length > level + 1) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
  }

  if (listStack.length <= level) {
    listStack.push({ tag: currentTag, indent })
    html.push(`<${currentTag}>`)
  } else if (listStack[listStack.length - 1].tag !== currentTag) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
    listStack.push({ tag: currentTag, indent })
    html.push(`<${currentTag}>`)
  }

  const { text: protectedHtmlText, map: htmlMap } = protectHTML(content)
  const { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)
  // 问题1修复：任务列表不加 disabled，改为用 data-line 让前端 JS 处理点击
  const taskMatch = protectedCodeText.match(/^\[( |x|X)\]\s+(.*)/)

  if (taskMatch) {
    const checked = taskMatch[1].toLowerCase() === 'x'
    const text = restoreHTML(restoreCode(escapeHTML(taskMatch[2]), codeMap), htmlMap)
    // 不加 disabled，加 data-line 和 data-task 让 PreviewPane 拦截点击更新 markdown
    html.push(
      `<li data-line="${lineNo}" data-task="true">` +
      `<input type="checkbox" ${checked ? 'checked' : ''} data-line="${lineNo}"> ${text}</li>`
    )
  } else {
    let processedContent = escapeHTML(protectedCodeText)
    processedContent = processedContent.replace(
      /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
      (_, expr) => renderMath(expr, false)
    )
    processedContent = restoreCode(processedContent, codeMap)
    processedContent = restoreHTML(processedContent, htmlMap)
    html.push(`<li data-line="${lineNo}">${processedContent}</li>`)
  }
  return true
}