
//  转义 HTML 特殊字符，防止 XSS 攻击。

function escapeHTML(str = '') {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
    attrs.push(`${key}="${value}"`);
  }
  return attrs.join(' ');
}


//  将 Markdown 文本解析为 HTML。

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

  /**
   * 将收集到的段落行转换为 HTML `<p>` 标签。
   * 处理内联元素，如链接、图片、加粗、斜体等。
   */
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join(' ');
      text = escapeHTML(text); 
      const codeMatches = [];
      text = text.replace(/`([^`\n]+)`/g, (_, code) => {
        codeMatches.push(code);
        return `@@CODE${codeMatches.length - 1}@@`;
      });
      // 处理其他内联元素
      text = text
        .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
          const extra = attrStr ? ' ' + parseAttrs(attrStr) : '';
          return `<img alt="${alt}" src="${src}"${extra} />`;
        })
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, text, url) => `<a href="${url}" target="_blank">${text}</a>`)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`);

      text = text.replace(/@@CODE(\d+)@@/g, (_, idx) => `<code>${codeMatches[idx]}</code>`);
      html.push(`<p>${text}</p>`);
      paragraphLines = []; 
    }
  };

  /**
   * 关闭所有未闭合的列表标签。
   */
  const flushList = () => {
    while (listStack.length > 0) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }
  };

  // 列表项，支持嵌套和任务列表。

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

    // 检查是否为任务列表 `[ ]` 或 `[x]`
    const taskMatch = content.match(/^\[( |x|X)\]\s+(.*)/);
    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === 'x';
      const text = taskMatch[2];
      html.push(
        `<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${escapeHTML(text)}</li>`
      );
    } else {
      html.push(`<li>${escapeHTML(content)}</li>`);
    }
    return true;
  };

  // --- 主循环：遍历每一行 Markdown 文本 ---
  for (const line of lines) {
    const trimmedLine = line.trim();

    // 如果在代码块中，直接添加内容并转义，直到遇到 ```
    if (inCodeBlock) {
      if (trimmedLine === '```') {
        inCodeBlock = false;
        html.push('</code></pre>');
      } else {
        html.push(escapeHTML(line));
      }
      continue;
    }

    // 遇到新的块级元素时，先处理之前的段落
    flushParagraph();

    // 代码块开始 ````
    const codeBlockStart = line.match(/^```(\w*)/);
    if (codeBlockStart) {
      inCodeBlock = true;
      codeLang = codeBlockStart[1] || 'plaintext';
      html.push(`<pre><code class="language-${codeLang}">`);
      continue;
    }

    // 脚注定义 `[^key]: content`
    const footnoteDef = line.match(/^\[\^(.+?)\]:\s+(.+)/);
    if (footnoteDef) {
      const [, key, content] = footnoteDef;
      footnotes[key] = escapeHTML(content);
      continue;
    }

    // 水平线 `---`
    if (/^---$/.test(trimmedLine)) {
      html.push('<hr/>');
      continue;
    }

    // 标题 `# ` 到 `###### `
    if (/^#+ /.test(line)) {
      const headingMatch = line.match(/^(#+)\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        html.push(`<h${level}>${escapeHTML(content)}</h${level}>`);
        continue;
      }
    }

    // 引用 `> `
    if (/^> /.test(line)) {
      html.push(`<blockquote>${escapeHTML(line.slice(2))}</blockquote>`);
      continue;
    }

    // Three.js扩展语法 `:::three { ... }:::`
    const threeMatch = line.match(/^:::three\s+(.+?):::/);
    if (threeMatch) {
      html.push(`<div class="three-render" data-shape="${threeMatch[1]}"></div>`);
      continue;
    }

    // 列表项
    if (handleListItem(line)) {
      continue;
    }

    // 空行：结束列表和表格
    if (trimmedLine === '') {
      flushList();
      if (inTable) {
        parseTable();
        inTable = false;
        tableRows = [];
      }
      continue;
    }

    // 表格行 `|...|`
    if (/^\|.*\|$/.test(line)) {
      if (!inTable) {
        inTable = true;
      }
      tableRows.push(line);
      continue;
    }

    // 如果在表格中，但当前行不是表格格式，则结束表格
    if (inTable && !/^\|.*\|$/.test(line)) {
      parseTable();
      inTable = false;
      tableRows = [];
    }

    // 普通行：收集到段落中，等待 flushParagraph 处理
    paragraphLines.push(line);
  }

  // --- 循环结束后的收尾工作 ---
  flushParagraph();
  flushList();
  if (inTable) {
    parseTable();
  }

  /**
   * 解析并生成表格 HTML，支持对齐方式。
   */
  function parseTable() {
    if (tableRows.length < 2) return;

    const header = tableRows[0]; // 表头
    const alignRow = tableRows[1]; // 对齐行，如 `|:---|---:|`
    const bodyRows = tableRows.slice(2); // 表格主体

    const headerCells = header.split('|').slice(1, -1).map(s => s.trim());
    const alignCells = alignRow.split('|').slice(1, -1).map(s => s.trim());

    // 根据对齐行判断对齐方式
    const alignments = alignCells.map(cell => {
      if (/^:\s*-+:\s*$/.test(cell)) return 'center';
      if (/^:\s*-+\s*$/.test(cell)) return 'left';
      if (/^\s*-+:\s*$/.test(cell)) return 'right';
      return null;
    });

    // 生成表头 HTML
    html.push('<table><thead><tr>' + headerCells.map((c, i) => {
      const align = alignments[i] ? ` align="${alignments[i]}"` : '';
      return `<th${align}>${escapeHTML(c)}</th>`;
    }).join('') + '</tr></thead><tbody>');

    // 生成表格主体 HTML
    for (const row of bodyRows) {
      const cells = row.split('|').slice(1, -1).map(s => s.trim());
      html.push('<tr>' + cells.map((c, i) => {
        const align = alignments[i] ? ` align="${alignments[i]}"` : '';
        return `<td${align}>${escapeHTML(c)}</td>`;
      }).join('') + '</tr>');
    }
    html.push('</tbody></table>');
  }

  // 添加脚注部分
  if (Object.keys(footnotes).length > 0) {
    html.push('<hr/><section class="footnotes"><ol>');
    for (const [key, content] of Object.entries(footnotes)) {
      html.push(`<li id="footnote-${key}">${content} <a href="#ref-${key}">↩</a></li>`);
    }
    html.push('</ol></section>');
  }

  return html.join('\n');
}

// 示例
const md = `
# Hello Markdown

这是一个**加粗**的文本。

[百度](https://www.baidu.com)

\`\`\`
console.log("Hello World")
\`\`\`


| 名称   | 数量 | 价格 |
| :----- | ---: | :--: |
| 苹果   |  3   | 2.5  |
| 香蕉   |  5   | 1.2  |


:::three
{
  "shape": "cube",
  "size": [1, 1, 1],
  "color": "#ff0000"
}
:::

这是一个脚注[^1]
[^1]: 这是脚注内容。

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