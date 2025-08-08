import katex from 'katex'; 

// 转义 HTML 特殊字符，防止 XSS 攻击
function escapeHTML(str = '') {
  return str
    .replace(/&/g, "&amp;")   
    .replace(/</g, "&lt;")    
    .replace(/>/g, "&gt;");
}

// 保护内联 HTML 标签，防止被转义
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

// 恢复之前保护的 HTML 标签
function restoreHTML(str = '', htmlMap = {}) {
  return str.replace(/@@HTML(\d+)@@/g, (_, i) => htmlMap[`@@HTML${i}@@`] || '');
}

// 保护内联代码，防止其内容在 HTML 转义时被破坏
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

// 恢复之前保护的内联代码，并进行 HTML 转义
function restoreCode(str = '', codeMap = {}) {
  return str.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${escapeHTML(codeMap[`@@CODE${i}@@`] || '')}</code>`);
}

// 解析属性字符串，转换为规范的 key="value" 格式
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

// 使用 KaTeX 渲染数学表达式，errorFallback: 出错时返回内容
function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode });
  } catch (e) {
    // 出错时显示原始文本，避免崩溃
    return `<code class="katex-error">${escapeHTML(tex)}</code>`;
  }
}

// Markdown 解析主函数，集成 KaTeX 公式解析
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

  // 用于检测并渲染块级公式
  let inMathBlock = false;
  let mathBlockLines = [];

  // 处理并输出段落内容。
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join(' ');

      // 处理内联数学公式 $...$
      // 先保护 HTML 和代码
      let { text: protectedHtmlText, map: htmlMap } = protectHTML(text);
      let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

      let processedText = escapeHTML(protectedCodeText);

      // 处理内联脚注 `[^key](content)`
      processedText = processedText.replace(/\[\^(.+?)\]\((.+?)\)/g, (_, key, content) => {
        const footnoteKey = key.trim() || `inline-footnote-${Object.keys(inlineFootnotes).length + 1}`;
        inlineFootnotes[footnoteKey] = escapeHTML(content);
        return `<sup id="ref-${footnoteKey}"><a href="#footnote-${footnoteKey}">${footnoteKey}</a></sup>`;
      });

      // 处理图片
      processedText = processedText
        .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
          const extra = attrStr ? ' ' + parseAttrs(attrStr) : '';
          return `<img alt="${escapeHTML(alt)}" src="${escapeHTML(src)}"${extra} />`;
        })
        // 处理链接
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, linkText, url) => `<a href="${escapeHTML(url)}" target="_blank">${escapeHTML(linkText)}</a>`)
        // 加粗斜体
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        // 加粗
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // 斜体
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // 删除线
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        // 脚注引用
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`);

      // 处理内联数学公式：匹配 $...$，避免匹配 $$...$$
      processedText = processedText.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, expr) => {
        return renderMath(expr, false);
      });

      processedText = restoreCode(processedText, codeMap);
      processedText = restoreHTML(processedText, htmlMap);

      html.push(`<p>${processedText}</p>`);
      paragraphLines = [];
    }
  };

  // 关闭所有未闭合的列表标签。
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
  };

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
  function parseTable() {
    if (tableRows.length < 2) {
      tableRows = [];
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
    tableRows = [];
  }

  // 主循环解析每行
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // 处理代码块开始/结束
    if (/^```/.test(trimmed)) {
      if (inCodeBlock) {
        // 结束代码块
        html.push(`</code></pre>`);
        inCodeBlock = false;
        codeLang = '';
      } else {
        // 新代码块
        flushParagraph();
        flushList();
        if (inTable) {
          parseTable();
          inTable = false;
        }
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        html.push(`<pre><code class="language-${escapeHTML(codeLang)}">`);
      }
      continue;
    }

    if (inCodeBlock) {
      // 代码块内容直接转义输出
      html.push(escapeHTML(line));
      continue;
    }

    // 处理块级数学公式
    if (trimmed === '$$') {
      flushParagraph();
      flushList();
      if (inMathBlock) {
        // 结束块级公式
        const mathContent = mathBlockLines.join('\n');
        html.push(renderMath(mathContent, true));
        inMathBlock = false;
        mathBlockLines = [];
      } else {
        // 开始块级公式
        inMathBlock = true;
        mathBlockLines = [];
      }
      continue;
    }

    if (inMathBlock) {
      mathBlockLines.push(line);
      continue;
    }

    // 空行表示段落结束
    if (trimmed === '') {
      flushParagraph();
      flushList();
      if (inTable) {
        parseTable();
        inTable = false;
      }
      continue;
    }

    // 处理表格行（最简单的判断，包含至少一个 |）
    if (trimmed.includes('|')) {
      flushParagraph();
      flushList();
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      // 不在表格的行，说明表格结束
      parseTable();
      inTable = false;
    }

    // 处理标题，支持 #，##，...，##### 五级
    const headingMatch = trimmed.match(/^(#{1,5})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      if (inTable) {
        parseTable();
        inTable = false;
      }
      const level = headingMatch[1].length;
      let content = headingMatch[2];

      // 保护 HTML 和代码
      let { text: protectedHtmlText, map: htmlMap } = protectHTML(content);
      let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

      let processedContent = escapeHTML(protectedCodeText);

      // 处理内联脚注、图片、链接等（省略，参考flushParagraph）

      // 处理内联数学公式
      processedContent = processedContent.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, expr) => renderMath(expr, false));

      processedContent = restoreCode(processedContent, codeMap);
      processedContent = restoreHTML(processedContent, htmlMap);

      html.push(`<h${level}>${processedContent}</h${level}>`);
      continue;
    }

    // 处理列表项
    if (handleListItem(line)) {
      flushParagraph();
      continue;
    }

    // 普通行，累积到段落
    paragraphLines.push(line);
  }

  // 结尾处理
  flushParagraph();
  flushList();
  if (inTable) parseTable();
  if (inMathBlock) {
    // 没有关闭的数学块
    html.push(renderMath(mathBlockLines.join('\n'), true));
  }

  // 处理脚注内容
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

export default parseMarkdown;


// 示例
const md = `
# Hello Markdown

这是一个**加粗**的文本。

[百度](https://www.baidu.com)

\`\`\`javascript
console.log("Hello World");
\`\`\`

这是一个内联脚注[^内联示例](这是内联脚注的内容，可以包含 **加粗** 和 \`代码\`。).

| 项目 | 状态 | 详情 |
| :--- | :---: | ---: |
| 任务一 | **完成** | \`task-id\` |
| 任务二 | *进行中* | [链接](https://example.com) |

:::three
{
  "shape": "cube",
  "size": [1, 1, 1],
  "color": "#ff0000"
}
:::

这是一个脚注[^1]
[^1]: 这是常规脚注内容。

- 一级
  - 二级
    - 三级
- 同级

- [ ] 买牛奶
- [x] 学习 JavaScript
  - [ ] 学 Vue
  - [x] 完成 Markdown 解析器
1. [ ] 吃早餐
2. [x] 散步

![示例图片](image.png){width=200 height=100 alt="自定义alt" class="rounded shadow"}

`;

const htmlOutput = parseMarkdown(md);

console.log(htmlOutput);