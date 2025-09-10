import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js';
import { protectCode, restoreCode } from '../utils/code.js';
import { renderMath } from '../utils/math.js';

export function flushList(html, listStack) {
  while (listStack.length > 0) {
    const { tag } = listStack.pop();
    html.push(`</${tag}>`);
  }
}

export function handleListItem(line, html, listStack) {
  const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
  if (!match) return false;

  const indent = match[1].length;
  const marker = match[2];
  const content = match[3];
  // 根据缩进计算层级，通常2个或4个空格为一级
  const level = Math.floor(indent / 2); // 这里使用2个空格作为一级缩进，更通用
  const isOrdered = /^\d+\./.test(marker);
  const currentTag = isOrdered ? 'ol' : 'ul';

  // 向上回溯，关闭所有比当前层级更深的列表
  while (listStack.length > level + 1) {
    const { tag } = listStack.pop();
    html.push(`</${tag}>`);
  }

  // 如果当前层级没有列表，或者需要开启一个新的列表
  if (listStack.length <= level) {
    // 如果是嵌套列表，确保父级列表的类型是正确的
    if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
      // 不关闭父级列表，而是直接推入新列表
      // 这也是修复的关键，在不同类型嵌套时不弹出
    }
    // 开启新列表
    listStack.push({ tag: currentTag, indent: indent });
    html.push(`<${currentTag}>`);
  } else if (listStack[listStack.length - 1].tag !== currentTag) {
    // 同一层级列表类型切换
    const { tag } = listStack.pop();
    html.push(`</${tag}>`);
    listStack.push({ tag: currentTag, indent: indent });
    html.push(`<${currentTag}>`);
  }


  const { text: protectedHtmlText, map: htmlMap } = protectHTML(content);
  const { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);
  const taskMatch = protectedCodeText.match(/^\[( |x|X)\]\s+(.*)/);

  if (taskMatch) {
    const checked = taskMatch[1].toLowerCase() === 'x';
    const text = restoreHTML(restoreCode(escapeHTML(taskMatch[2]), codeMap), htmlMap);
    html.push(`<li><input type="checkbox" ${checked ? 'checked' : ''} > ${text}</li>`);
  } else {
    let processedContent = escapeHTML(protectedCodeText);
    processedContent = processedContent.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
      (_, expr) => renderMath(expr, false));
    processedContent = restoreCode(processedContent, codeMap);
    processedContent = restoreHTML(processedContent, htmlMap);
    html.push(`<li>${processedContent}</li>`);
  }
  return true;
}