// parseMarkdown.js
import { escapeHTML, protectHTML, restoreHTML, protectCode, restoreCode, parseAttrs } from './utils';
import { renderMath } from './math';
import { handleListItem, flushList } from './listParser';
import { parseTable } from './tableParser';

// Markdown 解析主函数
export function parseMarkdown(md = '') {
  const lines = md.split('\n');
  const html = [];
  let inCodeBlock = false;
  let codeLang = '';
  const listStack = [];
  let paragraphLines = [];
  let inTable = false;
  let tableRows = [];
  const footnotes = {};
  const inlineFootnotes = {};
  let inMathBlock = false;
  let mathBlockLines = [];

  // 处理并输出段落内容
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      // 改成 <br /> 保留换行
      let text = paragraphLines.join('<br />');

      let { text: protectedHtmlText, map: htmlMap } = protectHTML(text);
      let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

      let processedText = escapeHTML(protectedCodeText);

      processedText = processedText.replace(/\[\^(.+?)\]\((.+?)\)/g, (_, key, content) => {
        const footnoteKey = key.trim() || `inline-footnote-${Object.keys(inlineFootnotes).length + 1}`;
        inlineFootnotes[footnoteKey] = escapeHTML(content);
        return `<sup id="ref-${footnoteKey}"><a href="#footnote-${footnoteKey}">${footnoteKey}</a></sup>`;
      });

      processedText = processedText
        .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
          const extra = attrStr ? ' ' + parseAttrs(attrStr) : '';
          return `<img alt="${escapeHTML(alt)}" src="${escapeHTML(src)}"${extra} />`;
        })
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, linkText, url) => `<a href="${escapeHTML(url)}" target="_blank">${escapeHTML(linkText)}</a>`)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`);

      processedText = processedText.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, expr) => {
        return renderMath(expr, false);
      });

      processedText = restoreCode(processedText, codeMap);
      processedText = restoreHTML(processedText, htmlMap);

      html.push(`<p>${processedText}</p>`);
      paragraphLines = [];
    }
  };

  // 主循环解析每行
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // 处理代码块
    if (/^```/.test(trimmed)) {
      if (inCodeBlock) {
        html.push(`</code></pre>`);
        inCodeBlock = false;
        codeLang = '';
      } else {
        flushParagraph();
        flushList(listStack, html);
        if (inTable) {
          parseTable(tableRows, html);
          inTable = false;
        }
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        html.push(`<pre><code class="language-${escapeHTML(codeLang)}">`);
      }
      continue;
    }

    if (inCodeBlock) {
      html.push(escapeHTML(line));
      continue;
    }

    // 处理块级数学公式
    if (trimmed === '$$') {
      flushParagraph();
      flushList(listStack, html);
      if (inMathBlock) {
        const mathContent = mathBlockLines.join('\n');
        html.push(renderMath(mathContent, true));
        inMathBlock = false;
        mathBlockLines = [];
      } else {
        inMathBlock = true;
        mathBlockLines = [];
      }
      continue;
    }

    if (inMathBlock) {
      mathBlockLines.push(line);
      continue;
    }

    // 空行处理
    if (trimmed === '') {
      flushParagraph();
      flushList(listStack, html);
      if (inTable) {
        parseTable(tableRows, html);
        inTable = false;
      }
      // 保留空行
      html.push('<br />');
      continue;
    }

    // 脚注定义
    const footnoteDefMatch = trimmed.match(/^\[\^(.+?)\]:\s*(.*)/);
    if (footnoteDefMatch) {
      const key = footnoteDefMatch[1].trim();
      const content = footnoteDefMatch[2];
      footnotes[key] = content;
      continue;
    }

    // 表格行
    if (trimmed.includes('|')) {
      flushParagraph();
      flushList(listStack, html);
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      parseTable(tableRows, html);
      inTable = false;
    }

    // 标题
    const headingMatch = trimmed.match(/^(#{1,5})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList(listStack, html);
      if (inTable) {
        parseTable(tableRows, html);
        inTable = false;
      }
      const level = headingMatch[1].length;
      let content = headingMatch[2];

      let { text: protectedHtmlText, map: htmlMap } = protectHTML(content);
      let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

      let processedContent = escapeHTML(protectedCodeText);
      processedContent = processedContent.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, expr) => renderMath(expr, false));

      processedContent = restoreCode(processedContent, codeMap);
      processedContent = restoreHTML(processedContent, htmlMap);

      html.push(`<h${level}>${processedContent}</h${level}>`);
      continue;
    }

    // 列表项
    if (handleListItem(line, listStack, html)) {
      flushParagraph();
      continue;
    }

    // 普通行
    paragraphLines.push(line);
  }

  // 收尾
  flushParagraph();
  flushList(listStack, html);
  if (inTable) parseTable(tableRows, html);
  if (inMathBlock) {
    html.push(renderMath(mathBlockLines.join('\n'), true));
  }

  // 脚注处理
  const footnoteKeys = Object.keys(footnotes);
  const inlineFootnoteKeys = Object.keys(inlineFootnotes);
  if (footnoteKeys.length > 0 || inlineFootnoteKeys.length > 0) {
    html.push('<hr><section class="footnotes"><ol>');

    for (const key of footnoteKeys) {
      html.push(`<li id="footnote-${key}">${footnotes[key]}</li>`);
    }
    for (const key of inlineFootnoteKeys) {
      html.push(`<li id="footnote-${key}">${inlineFootnotes[key]}</li>`);
    }
    html.push('</ol></section>');
  }

  return html.join('\n');
}
