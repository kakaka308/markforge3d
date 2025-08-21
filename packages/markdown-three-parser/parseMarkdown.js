import katex from 'katex';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

// 转义HTML特殊字符
function escapeHTML(str = '') {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

// 保护HTML标签（临时替换为占位符）
function protectHTML(str = '') {
  const htmlMap = {};
  let idx = 0;
  str = str.replace(/<[^>]+>/g, match => {
    const key = `@@HTML${idx}@@`;
    htmlMap[key] = match;
    idx++;
    return key;
  });
  return { text: str, map: htmlMap };
}

// 恢复被保护的HTML标签
function restoreHTML(str = '', htmlMap = {}) {
  return str.replace(/@@HTML(\d+)@@/g, (_, i) => htmlMap[`@@HTML${i}@@`] || '');
}

// 保护代码块（临时替换内联代码）
function protectCode(str = '') {
  const codeMap = {};
  let idx = 0;
  str = str.replace(/`([^`\n]+)`/g, (match, codeContent) => {
    const key = `@@CODE${idx}@@`;
    codeMap[key] = codeContent;
    idx++;
    return key;
  });
  return { text: str, map: codeMap };
}

// 恢复代码块并添加高亮类
function restoreCode(str = '', codeMap = {}) {
  return str.replace(/@@CODE(\d+)@@/g, (_, i) =>
    `<code class="language-plaintext">${escapeHTML(codeMap[`@@CODE${i}@@`] || '')}</code>`
  );
}

// 解析属性字符串（用于图片等元素）
function parseAttrs(attrStr = '') {
  const attrs = [];
  const regex = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    const key = match[1];
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    attrs.push(`${key}="${escapeHTML(value)}"`);
  }
  return attrs.join(' ');
}

// 渲染数学公式
function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode,
      output: 'html'
    });
  } catch (e) {
    return `<code class="katex-error">${escapeHTML(tex)}</code>`;
  }
}

// 主Markdown解析函数
function parseMarkdown(md = '') {
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
  let emptyLineCount = 0;
  let inBlockquote = false;
  let blockquoteLevel = 0;
  let codeLines = [];


  // --- New: Three.js block parsing variables ---
  let inThreeJsBlock = false;
  let threeJsObjects = []; // Stores parsed objects for the current Three.js block
  // --- End New ---

  // 刷新当前段落
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join('\n');

      // 保护HTML标签和代码块
      let { text: protectedHtmlText, map: htmlMap } = protectHTML(text);
      let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

      let escapedText = escapeHTML(protectedCodeText);

      // 处理内联数学公式
      let processedText = escapedText.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
        (_, expr) => renderMath(expr.trim(), false));

      // 处理各种Markdown语法
      processedText = processedText
        .replace(/\[\^(.+?)\]\((.+?)\)/g, (_, key, content) => {
          const footnoteKey = key.trim() || `inline-footnote-${Object.keys(inlineFootnotes).length + 1}`;
          inlineFootnotes[footnoteKey] = escapeHTML(content);
          return `<sup id="ref-${footnoteKey}"><a href="#footnote-${footnoteKey}">${footnoteKey}</a></sup>`;
        })
        .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
          const extra = attrStr ? ' ' + parseAttrs(attrStr) : '';
          return `<img alt="${escapeHTML(alt)}" src="${escapeHTML(src)}"${extra} />`;
        })
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, linkText, url) =>
          `<a href="${escapeHTML(url)}" target="_blank">${escapeHTML(linkText)}</a>`)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#ref-${key}">${key}</a></sup>`);

      // 处理换行和恢复代码/HTML
      processedText = processedText.replace(/\n/g, '<br />');
      processedText = restoreCode(processedText, codeMap);
      processedText = restoreHTML(processedText, htmlMap);

      html.push(`<p>${processedText}</p>`);
      paragraphLines = [];
    }
  };

  // 刷新列表状态
  const flushList = () => {
    while (listStack.length > 0) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }
  };

  // 处理列表项
  const handleListItem = (line) => {
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
    if (!match) return false;
    
    const indent = match[1].length;
    const marker = match[2];
    const content = match[3];
    const level = Math.floor(indent / 4);
    const isOrdered = /^\d+\./.test(marker);
    const currentTag = isOrdered ? 'ol' : 'ul';

    // 调整列表层级
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
    } else if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
      listStack.push({ tag: currentTag, indent: indent });
      html.push(`<${currentTag}>`);
    }

    // 处理任务列表
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
  };

  // 解析表格
  const parseTable = () => {
    if (tableRows.length === 0) return;
    const headers = tableRows[0].split('|').map(s => s.trim()).filter(s => s !== '');
    const aligns = [];
    
    if (tableRows.length > 1) {
      const alignsRaw = tableRows[1].split('|').map(s => s.trim()).filter(s => s !== '');
      for (const a of alignsRaw) {
        if (/^:-+:$/.test(a)) aligns.push('center');
        else if (/^-+:$/.test(a)) aligns.push('right');
        else if (/^:-+$/.test(a)) aligns.push('left');
        else aligns.push('');
      }
    }
    
    html.push('<table>');
    html.push('<thead><tr>');
    for (let i = 0; i < headers.length; i++) {
      const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : '';
      html.push(`<th${align}>${escapeHTML(headers[i])}</th>`);
    }
    html.push('</tr></thead><tbody>');
    
    for (let i = 2; i < tableRows.length; i++) {
      const cells = tableRows[i].split('|').map(s => s.trim()).filter(s => s !== '');
      html.push('<tr>');
      for (let j = 0; j < headers.length; j++) {
        const align = aligns[j] ? ` style="text-align:${aligns[j]}"` : '';
        html.push(`<td${align}>${escapeHTML(cells[j] || '')}</td>`);
      }
      html.push('</tr>');
    }
    
    html.push('</tbody></table>');
    tableRows = [];
  };

  // 刷新引用块状态
  const flushBlockquote = () => {
    if (blockquoteLevel > 0) {
      for (let i = 0; i < blockquoteLevel; i++) {
        html.push('</blockquote>');
      }
      blockquoteLevel = 0;
      inBlockquote = false;
    }
  };

  // 主解析循环
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // --- New: Handle Three.js block start/end ---
    if (trimmed === ':::three') {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (inTable) { parseTable(); inTable = false; }
      inThreeJsBlock = true;
      threeJsObjects = []; // Reset objects for the new block
      emptyLineCount = 0;
      continue;
    }
    if (trimmed === ':::' && inThreeJsBlock) {
      flushParagraph(); // Flush any paragraph content inside the three.js block if it exists
      // Render the Three.js container with all collected objects
      html.push(`<div class="three-js-container" data-objects='${JSON.stringify(threeJsObjects)}'></div>`);
      inThreeJsBlock = false;
      threeJsObjects = []; // Clear for next block
      emptyLineCount = 0;
      continue;
    }

    if (inThreeJsBlock) {
      // Parse object definition within the Three.js block
      const objectMatch = trimmed.match(/^(#{1,5})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i);
      if (objectMatch) {
        const type = objectMatch[2].toLowerCase();
        let color = objectMatch[3].trim();
        // Allow hex codes, e.g., #RRGGBB
        if (!color.startsWith('0x') && color.startsWith('#')) {
          color = '0x' + color.substring(1);
        } else if (!color.startsWith('0x') && !isNaN(parseInt(color))) {
            // If it's a number but not hex, assume it's a decimal, convert to hex
            color = '0x' + parseInt(color).toString(16);
        }

        const size = parseFloat(objectMatch[4]) || 1; // Default size to 1 if not specified

        threeJsObjects.push({ type, color, size });
      }
      // Any other text within the three.js block is ignored for now, or could be treated as a caption.
      emptyLineCount = 0;
      continue;
    }
    // --- End New ---


    // 处理代码块
    if (/^```/.test(trimmed)) {
    if (inCodeBlock) {
      // 代码块结束，进行高亮处理
      const codeContent = codeLines.join('\n');
      const highlighted = Prism.highlight(
        codeContent,
        Prism.languages[codeLang] || Prism.languages.text,
        codeLang
      );
      html.push(`<pre class="language-${codeLang}"><code>${highlighted}</code></pre>`);
      inCodeBlock = false;
      codeLines = []; // 清空，为下一个代码块准备
    } else {
      // 代码块开始
      flushParagraph();
      flushList();
      flushBlockquote();
      if (inTable) { parseTable(); inTable = false; }
      inCodeBlock = true;
      codeLang = trimmed.slice(3).trim() || 'text';
      codeLines = []; // 新的代码块开始，初始化
    }
    emptyLineCount = 0;
    continue;
  }

  if (inCodeBlock) {
    codeLines.push(line); // 收集代码块的每一行
    continue;
  }


    // 处理数学公式块
    if (trimmed === '$$') {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (inMathBlock) {
        html.push(renderMath(mathBlockLines.join('\n'), true));
        inMathBlock = false;
        mathBlockLines = [];
      } else {
        inMathBlock = true;
        mathBlockLines = [];
        paragraphLines = [];
      }
      emptyLineCount = 0;
      continue;
    }
    
    if (inMathBlock) {
      mathBlockLines.push(line);
      emptyLineCount = 0;
      continue;
    }

    // 处理空行
    if (trimmed === '') {
      emptyLineCount++;
      flushParagraph();
      if (emptyLineCount > 1) {
        flushList();
        flushBlockquote();
      }
      if (inTable) { parseTable(); inTable = false; }
      continue;
    } else {
      if (emptyLineCount > 0) {
        for (let j = 1; j < emptyLineCount; j++) html.push('<br />');
        emptyLineCount = 0;
      }
    }

    // 处理分割线
    if (/^[-*_]{3,}\s*$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (inTable) { parseTable(); inTable = false; }
      html.push('<hr />');
      continue;
    }

    // 处理引用块
    const blockquoteMatch = line.match(/^(\s*>+\s*)(.*)/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      if (inTable) { parseTable(); inTable = false; }

      const quoteMarkers = blockquoteMatch[1].replace(/\s/g, '');
      const currentLevel = quoteMarkers.length;
      const content = blockquoteMatch[2].trim();

      // 调整引用层级
      if (currentLevel !== blockquoteLevel) {
        if (currentLevel > blockquoteLevel) {
          for (let i = blockquoteLevel; i < currentLevel; i++) {
            html.push('<blockquote>');
          }
        } else {
          for (let i = blockquoteLevel; i > currentLevel; i--) {
            html.push('</blockquote>');
          }
        }
        blockquoteLevel = currentLevel;
      }

      // Recursively parse content inside blockquote
      // If content is not empty, process it as a new markdown string
      if (content) {
        // Create a temporary markdown string for the blockquote content
        const tempMd = content;
        // Parse it and add to html. This approach effectively handles nested markdown within blockquotes.
        // For simplicity and avoiding infinite recursion with lists/etc., we'll just treat it as a paragraph here for now
        // if it's not a heading/list item, etc.
        let { text: protectedHtmlText, map: htmlMap } = protectHTML(tempMd);
        let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);
        let processedContent = escapeHTML(protectedCodeText);
        processedContent = processedContent.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
          (_, expr) => renderMath(expr, false));
        processedContent = restoreCode(processedContent, codeMap);
        processedContent = restoreHTML(processedContent, htmlMap);
        html.push(`<p>${processedContent}</p>`); // Wrap in paragraph if it's simple text
      }
      inBlockquote = true;
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // 处理表格
    if (trimmed.includes('|') && trimmed.split('|').length > 1) { // Ensure it's not just a single pipe
      flushParagraph();
      flushList();
      flushBlockquote();
      if (!inTable) { inTable = true; tableRows = []; }
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      parseTable();
      inTable = false;
    }

    // 处理标题
    const headingMatch = trimmed.match(/^(#{1,5})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (inTable) { parseTable(); inTable = false; }
      const level = headingMatch[1].length;
      let content = headingMatch[2];
      let { text: protectedHtmlText, map: htmlMap } = protectHTML(content);
      let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);
      let processedContent = escapeHTML(protectedCodeText);
      processedContent = processedContent.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
        (_, expr) => renderMath(expr, false));
      processedContent = restoreCode(processedContent, codeMap);
      processedContent = restoreHTML(processedContent, htmlMap);
      html.push(`<h${level}>${processedContent}</h${level}>`);
      continue;
    }

    // 处理列表
    if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
      flushParagraph();
      handleListItem(line);
      continue;
    }

    // 普通文本行
    paragraphLines.push(line);
  }

  // 最终刷新所有状态
  flushParagraph();
  flushList();
  flushBlockquote();
  if (inTable) parseTable();
  if (inMathBlock) html.push(renderMath(mathBlockLines.join('\n'), true));
  if (emptyLineCount > 0) {
    for (let j = 1; j < emptyLineCount; j++) html.push('<br />');
  }

  // 处理脚注
  if (Object.keys(footnotes).length > 0 || Object.keys(inlineFootnotes).length > 0) {
    html.push('<hr /><section class="footnotes"><ol>');
    for (const key in footnotes) {
      html.push(`<li id="footnote-${key}">${footnotes[key]} <a href="#ref-${key}">↩</a></li>`);
    }
    for (const key in inlineFootnotes) {
      html.push(`<li id="footnote-${key}">${inlineFootnotes[key]} <a href="#ref-${key}">↩</a></li>`);
    }
    html.push('</ol></section>');
  }

  return html.join('\n');
}

export default parseMarkdown;