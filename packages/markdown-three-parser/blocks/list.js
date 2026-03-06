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

export function handleListItem(line, html, listStack) {
  const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/)
  if (!match) return false

  const indent = match[1].length
  const marker = match[2]
  const content = match[3]
  const level = Math.floor(indent / 2)
  const isOrdered = /^\d+\./.test(marker)
  const currentTag = isOrdered ? 'ol' : 'ul'

  // 向上回溯，关闭所有比当前层级更深的列表
  while (listStack.length > level + 1) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
  }

  if (listStack.length <= level) {
    listStack.push({ tag: currentTag, indent })
    html.push(`<${currentTag}>`)
  } else if (listStack[listStack.length - 1].tag !== currentTag) {
    // 同层级列表类型切换（有序 ↔ 无序）
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
    listStack.push({ tag: currentTag, indent })
    html.push(`<${currentTag}>`)
  }

  const { text: protectedHtmlText, map: htmlMap } = protectHTML(content)
  const { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)
  const taskMatch = protectedCodeText.match(/^\[( |x|X)\]\s+(.*)/)

  if (taskMatch) {
    const checked = taskMatch[1].toLowerCase() === 'x'
    const text = restoreHTML(restoreCode(escapeHTML(taskMatch[2]), codeMap), htmlMap)
    html.push(`<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${text}</li>`)
  } else {
    let processedContent = escapeHTML(protectedCodeText)
    processedContent = processedContent.replace(
      /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
      (_, expr) => renderMath(expr, false)
    )
    processedContent = restoreCode(processedContent, codeMap)
    processedContent = restoreHTML(processedContent, htmlMap)
    html.push(`<li>${processedContent}</li>`)
  }
  return true
}