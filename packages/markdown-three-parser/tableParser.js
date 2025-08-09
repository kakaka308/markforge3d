// tableParser.js
import { escapeHTML, protectHTML, restoreHTML, protectCode, restoreCode } from './utils';

// 表格单元格内联 Markdown 解析（部分内联样式）
function inlineParse(text) {
  const { text: protectedHtmlText, map: htmlMap } = protectHTML(text);
  const { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

  let result = escapeHTML(protectedCodeText);

  result = result
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');

  result = restoreCode(result, codeMap);
  result = restoreHTML(result, htmlMap);
  return result;
}

// 解析并生成表格 HTML
export function parseTable(tableRows, html) {
  if (tableRows.length < 2) {
    tableRows.length = 0; // 清空数组
    return;
  }
  // 解析表头和对齐方式
  const headers = tableRows[0].split('|').map(s => s.trim());
  const aligns = tableRows[1].split('|').map(s => s.trim());

  // 解析对齐类型
  const alignTypes = aligns.map(a => {
    if (/^:-+:$/.test(a)) return 'center';
    if (/^-+:$/.test(a)) return 'right';
    if (/^:-+$/.test(a)) return 'left';
    return null;
  });

  html.push('<table><thead><tr>');
  headers.forEach((h, i) => {
    const alignAttr = alignTypes[i] ? ` style="text-align:${alignTypes[i]}"` : '';
    html.push(`<th${alignAttr}>${inlineParse(h)}</th>`);
  });
  html.push('</tr></thead><tbody>');

  for (let i = 2; i < tableRows.length; i++) {
    const cols = tableRows[i].split('|').map(s => s.trim());
    html.push('<tr>');
    cols.forEach((c, i) => {
      const alignAttr = alignTypes[i] ? ` style="text-align:${alignTypes[i]}"` : '';
      html.push(`<td${alignAttr}>${inlineParse(c)}</td>`);
    });
    html.push('</tr>');
  }
  html.push('</tbody></table>');
  tableRows.length = 0; // 清空数组
}