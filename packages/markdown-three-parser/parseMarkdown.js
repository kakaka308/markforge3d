function escapeHTML(str = '') {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseMarkdown(md = '') {
  const lines = md.split('\n');
  const html = [];
  let inCodeBlock = false;
  let codeLang = '';
  // 使用一个栈来跟踪列表的层级和类型，每个元素是一个对象 { tag: 'ul'/'ol', indent: number }
  const listStack = [];
  let paragraphLines = [];
  let inTable = false;
  let tableRows = [];
  const footnotes = {};

  // 将收集到的段落行转换为 HTML
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join(' ');
      text = escapeHTML(text);
      const codeMatches = [];
      // 临时替换内联代码，避免内部的特殊字符被后续的正则替换
      text = text.replace(/`([^`\n]+)`/g, (_, code) => {
        codeMatches.push(code);
        return `@@CODE${codeMatches.length - 1}@@`;
      });

      // 处理其他内联元素
      text = text
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (_, alt, src) => `<img alt="${alt}" src="${src}" />`)
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, text, url) => `<a href="${url}" target="_blank">${text}</a>`)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`);

      // 还原内联代码
      text = text.replace(/@@CODE(\d+)@@/g, (_, idx) => `<code>${codeMatches[idx]}</code>`);

      html.push(`<p>${text}</p>`);
      paragraphLines = [];
    }
  };

  // 关闭所有未闭合的列表标签
  const flushList = () => {
    while (listStack.length > 0) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }
  };

  // 处理列表项
  const handleListItem = (line) => {
    // 匹配列表项的缩进、标记和内容
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
    if (!match) return false;

    const indent = match[1].length;
    const marker = match[2];
    const content = match[3];

    // 每 2 个空格算一个列表层级
    const level = Math.floor(indent / 2);
    const isOrdered = /^\d+\./.test(marker);
    const currentTag = isOrdered ? 'ol' : 'ul';

    // 如果当前层级小于栈顶层级，关闭多余的列表
    while (listStack.length > level + 1) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }

    // 如果当前层级大于栈顶层级，或者栈为空，需要开启新的列表
    if (listStack.length === 0 || level >= listStack.length) {
      // 检查当前列表类型是否与栈顶类型相同
      if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
        // 如果类型不同，先关闭上一层列表
        const { tag } = listStack.pop();
        html.push(`</${tag}>`);
      }
      // 开启新的列表
      listStack.push({ tag: currentTag, indent: indent });
      html.push(`<${currentTag}>`);
    }

    // 如果当前层级与栈顶层级相同，但类型不同，需要关闭并开启新的列表
    if (listStack.length > 0 && listStack[listStack.length - 1].tag !== currentTag) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
      listStack.push({ tag: currentTag, indent: indent });
      html.push(`<${currentTag}>`);
    }

    // 添加列表项
    html.push(`<li>${escapeHTML(content)}</li>`);
    return true;
  };

  // --- 主循环：遍历每一行 Markdown 文本 ---
  for (const line of lines) {
    const trimmedLine = line.trim();

    // 如果在代码块中，直接添加内容并转义
    if (inCodeBlock) {
      if (trimmedLine === '```') {
        inCodeBlock = false;
        html.push('</code></pre>');
      } else {
        html.push(escapeHTML(line));
      }
      continue;
    }

    // --- 块级元素解析 ---
    flushParagraph(); // 遇到新的块级元素，先处理之前的段落

    // 代码块开始
    const codeBlockStart = line.match(/^```(\w*)/);
    if (codeBlockStart) {
      inCodeBlock = true;
      codeLang = codeBlockStart[1] || 'plaintext';
      html.push(`<pre><code class="language-${codeLang}">`);
      continue;
    }

    // 脚注定义
    const footnoteDef = line.match(/^\[\^(.+?)\]:\s+(.+)/);
    if (footnoteDef) {
      const [, key, content] = footnoteDef;
      footnotes[key] = escapeHTML(content);
      continue;
    }

    // 水平线
    if (/^---$/.test(trimmedLine)) {
      html.push('<hr/>');
      continue;
    }

    // 标题
    if (/^#+ /.test(line)) {
      const headingMatch = line.match(/^(#+)\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        html.push(`<h${level}>${escapeHTML(content)}</h${level}>`);
        continue;
      }
    }

    // 引用
    if (/^> /.test(line)) {
      html.push(`<blockquote>${escapeHTML(line.slice(2))}</blockquote>`);
      continue;
    }

    // Three.js扩展
    const threeMatch = line.match(/^:::three\s+(.+?):::/);
    if (threeMatch) {
      html.push(`<div class="three-render" data-shape="${threeMatch[1]}"></div>`);
      continue;
    }

    // 列表
    if (handleListItem(line)) {
      continue;
    }

    // 空行：结束列表、表格和段落
    if (trimmedLine === '') {
      flushList();
      if (inTable) {
        // 如果遇到空行，且在表格中，解析并关闭表格
        parseTable();
        inTable = false;
        tableRows = [];
      }
      continue;
    }

    // 表格
    if (/^\|.*\|$/.test(line)) {
      if (!inTable) {
        inTable = true;
      }
      tableRows.push(line);
      continue;
    }

    // 如果是表格的中间行，但格式不正确，则结束表格
    if (inTable && !/^\|.*\|$/.test(line)) {
      parseTable();
      inTable = false;
      tableRows = [];
    }

    // 普通行：收集到段落中
    paragraphLines.push(line);
  }

  // --- 循环结束后的收尾工作 ---
  flushParagraph();
  flushList();
  if (inTable) {
    parseTable();
  }

  // 解析表格的辅助函数
  function parseTable() {
    if (tableRows.length < 2) return;
    const header = tableRows[0];
    const bodyRows = tableRows.slice(2);
    // 处理表头
    const headerCells = header.split('|').slice(1, -1).map(s => s.trim());
    html.push('<table><thead><tr>' + headerCells.map(c => `<th>${escapeHTML(c)}</th>`).join('') + '</tr></thead><tbody>');
    // 处理表格主体
    for (const row of bodyRows) {
      const cells = row.split('|').slice(1, -1).map(s => s.trim());
      html.push('<tr>' + cells.map(c => `<td>${escapeHTML(c)}</td>`).join('') + '</tr>');
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

- 列表1
- 列表2

1. 有序一
2. 有序二

| 名称 | 数量 |
| ---- | ---- |
| 苹果 | 3 |
| 香蕉 | 5 |

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
1. 有序一
    1. 子项一
    2. 子项二
`;

const htmlOutput = parseMarkdown(md);

console.log(htmlOutput);