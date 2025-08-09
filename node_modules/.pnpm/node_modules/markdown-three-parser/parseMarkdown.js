import katex from 'katex';

function escapeHTML(str = '') {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

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

function restoreHTML(str = '', htmlMap = {}) {
  return str.replace(/@@HTML(\d+)@@/g, (_, i) => htmlMap[`@@HTML${i}@@`] || '');
}

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

function restoreCode(str = '', codeMap = {}) {
  return str.replace(/@@CODE(\d+)@@/g, (_, i) =>
    `<code>${escapeHTML(codeMap[`@@CODE${i}@@`] || '')}</code>`
  );
}

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

function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode });
  } catch (e) {
    return `<code class="katex-error">${escapeHTML(tex)}</code>`;
  }
}

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

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join('\n');

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
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, linkText, url) =>
          `<a href="${escapeHTML(url)}" target="_blank">${escapeHTML(linkText)}</a>`)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`);

      processedText = processedText.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
        (_, expr) => renderMath(expr, false));

      processedText = processedText.replace(/\n/g, '<br />');

      processedText = restoreCode(processedText, codeMap);
      processedText = restoreHTML(processedText, htmlMap);

      html.push(`<p>${processedText}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    while (listStack.length > 0) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }
  };

  const handleListItem = (line) => {
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
    if (!match) return false;
    const indent = match[1].length;
    const marker = match[2];
    const content = match[3];
    const level = Math.floor(indent / 4);
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
    } else if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
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
      html.push(`<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${text}</li>`);
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

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // 代码块
    if (/^```/.test(trimmed)) {
      if (inCodeBlock) {
        html.push(`</code></pre>`);
        inCodeBlock = false;
        codeLang = '';
      } else {
        flushParagraph();
        flushList();
        if (inTable) { parseTable(); inTable = false; }
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        html.push(`<pre><code class="language-${escapeHTML(codeLang)}">`);
      }
      emptyLineCount = 0;
      continue;
    }
    if (inCodeBlock) {
      html.push(escapeHTML(line));
      emptyLineCount = 0;
      continue;
    }

    // 数学块
    if (trimmed === '$$') {
      flushParagraph();
      flushList();
      if (inMathBlock) {
        html.push(renderMath(mathBlockLines.join('\n'), true));
        inMathBlock = false;
        mathBlockLines = [];
      } else {
        inMathBlock = true;
        mathBlockLines = [];
        paragraphLines = []; // ✅ 避免公式内容变段落
      }
      emptyLineCount = 0;
      continue;
    }
    if (inMathBlock) {
      mathBlockLines.push(line);
      emptyLineCount = 0;
      continue;
    }

    // 空行
    if (trimmed === '') {
      emptyLineCount++;
      flushParagraph();
      flushList();
      if (inTable) { parseTable(); inTable = false; }
      continue;
    } else {
      if (emptyLineCount > 0) {
        for (let j = 1; j < emptyLineCount; j++) html.push('<br />');
        emptyLineCount = 0;
      }
    }

    // 表格
    if (trimmed.includes('|')) {
      flushParagraph();
      flushList();
      if (!inTable) { inTable = true; tableRows = []; }
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      parseTable();
      inTable = false;
    }

    // 标题
    const headingMatch = trimmed.match(/^(#{1,5})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList();
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

    // 列表
    if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
      flushParagraph(); // ✅ 列表前关闭段落
      handleListItem(line);
      continue;
    }

    // 普通段落
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  if (inTable) parseTable();
  if (inMathBlock) html.push(renderMath(mathBlockLines.join('\n'), true));
  if (emptyLineCount > 0) {
    for (let j = 1; j < emptyLineCount; j++) html.push('<br />');
  }

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
