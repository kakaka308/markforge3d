// listParser.js
import { escapeHTML, protectHTML, restoreHTML, protectCode, restoreCode } from './utils';

// 处理列表项
export function handleListItem(line, listStack, html) {
  const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!match) return false;
  const indent = match[1].length;
  const marker = match[2];
  const content = match[3];
  const level = Math.floor(indent / 2);
  const isOrdered = /^\d+\./.test(marker);
  const currentTag = isOrdered ? 'ol' : 'ul';

  while (listStack.length > level + 1) {
    const { tag } = listStack.pop();
    html.push(`</${tag}>`);
  }

  if (listStack.length === 0 || level >= listStack.length) {
    if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }
    listStack.push({ tag: currentTag, indent: indent });
    html.push(`<${currentTag}>`);
  }

  if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
    const { tag } = listStack.pop();
    html.push(`</${tag}>`);
    listStack.push({ tag: currentTag, indent: indent });
    html.push(`<${currentTag}>`);
  }

  const { text: protectedHtmlText, map: htmlMap } = protectHTML(content);
  const { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

  // 处理任务列表项
  const taskMatch = protectedCodeText.match(/^\[( |x|X)\]\s+(.*)/);
  if (taskMatch) {
    const checked = taskMatch[1].toLowerCase() === 'x';
    const text = restoreHTML(restoreCode(escapeHTML(taskMatch[2]), codeMap), htmlMap);
    html.push(`<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${text}</li>`);
  } else {
    html.push(`<li>${restoreHTML(restoreCode(escapeHTML(protectedCodeText), codeMap), htmlMap)}</li>`);
  }
  return true;
}

// 关闭所有未闭合的列表标签。
export function flushList(listStack, html) {
  while (listStack.length > 0) {
    const { tag } = listStack.pop();
    html.push(`</${tag}>`);
  }
}