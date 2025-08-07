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
  let inList = false;
  let listType = ''; // 'ul' or 'ol'
  let paragraphLines = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let tableRows = [];
  const footnotes = {};

  //将收集到的段落行转换为 HTML
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join(' ');
      text = escapeHTML(text);
      const codeMatches = [];
      text = text.replace(/`([^`\n]+)`/g, (_, code) => {
        codeMatches.push(code);
        return `@@CODE${codeMatches.length - 1}@@`;
      });

      text = text
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (_, alt, src) => `<img alt="${alt}" src="${src}" />`)
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, text, url) => `<a href="${url}" target="_blank">${text}</a>`)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>');

      text = text.replace(/@@CODE(\d+)@@/g, (_, idx) => `<code>${codeMatches[idx]}</code>`);

      html.push(`<p>${text}</p>`);
      paragraphLines = [];
    }
  };


  // 遍历每一行 Markdown 文本
  for (let line of lines) {
    // 移除行尾的空白字符
    line = line.replace(/\s+$/, '');

    //  --- 代码块 --- 
    const codeBlockStart = line.match(/^```(\w*)/);
    if (codeBlockStart) {
      flushParagraph();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = codeBlockStart[1] || '';
        html.push(`<pre><code class="language-${codeLang}">`);
      } else {
        inCodeBlock = false;
        html.push('</code></pre>');
      }
      continue;
    }

    if (inCodeBlock) {
      html.push(escapeHTML(line));
      continue;
    }
     // --- 脚注定义 ---
    const footnoteDef = line.match(/^\[\^(.+?)\]:\s+(.+)/);
    if (footnoteDef) {
      const [, key, content] = footnoteDef;
      footnotes[key] = escapeHTML(content);
      continue;
    }

    //  --- 水平线 --- 
    if (/^---$/.test(line)) {
      flushParagraph();
      html.push('<hr/>');
      continue;
    }

    //  --- 标题 --- 
    if (/^###### /.test(line)) { flushParagraph(); html.push(`<h6>${line.slice(7)}</h6>`); continue; }
    if (/^##### /.test(line)) { flushParagraph(); html.push(`<h5>${line.slice(6)}</h5>`); continue; }
    if (/^#### /.test(line)) { flushParagraph(); html.push(`<h4>${line.slice(5)}</h4>`); continue; }
    if (/^### /.test(line)) { flushParagraph(); html.push(`<h3>${line.slice(4)}</h3>`); continue; }
    if (/^## /.test(line)) { flushParagraph(); html.push(`<h2>${line.slice(3)}</h2>`); continue; }
    if (/^# /.test(line)) { flushParagraph(); html.push(`<h1>${line.slice(2)}</h1>`); continue; }

    //  --- 引用 --- 
    if (/^> /.test(line)) {
      flushParagraph();
      html.push(`<blockquote>${escapeHTML(line.slice(2))}</blockquote>`);
      continue;
    }

    //  --- Three.js扩展 --- 
    const threeMatch = line.match(/^:::three\s+(.+?):::/);
    if (threeMatch) {
      flushParagraph();
      html.push(`<div class="three-render" data-shape="${threeMatch[1]}"></div>`);
      continue;
    }

    //  --- 有序列表 --- 
    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      const content = line.replace(/^\d+\.\s/, '');
      if (!inList) {
        html.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      html.push(`<li>${escapeHTML(content)}</li>`);
      continue;
    }

    //  --- 无序列表 --- 
    if (/^\s*[-*] /.test(line)) {
      flushParagraph();
      const content = line.replace(/^\s*[-*] /, '');
      if (!inList) {
        html.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li>${escapeHTML(content)}</li>`);
      continue;
    }

    //  --- 空行：关闭列表和段落 --- 
    if (/^\s*$/.test(line)) {
      flushParagraph();
      if (inList) {
        html.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = '';
      }
      continue;
    }

    //  --- 表格 --- 
    if (/^\|(.+)\|$/.test(line)) {
      if (!inTable) {
        flushParagraph();
        inTable = true;
        tableHeaderParsed = false;
        tableRows = [];
      }
      tableRows.push(line);
      continue;
    }

    // --- 非表格行，结束表格 --- 
    if (inTable && !/^\|(.+)\|$/.test(line)) {
      // 解析表格
      const header = tableRows[0];
      const separator = tableRows[1];
      const bodyRows = tableRows.slice(2);
      // 处理表头
      const headerCells = header.split('|').slice(1, -1).map(s => s.trim());
      html.push('<table>');
      html.push('<thead><tr>' + headerCells.map(c => `<th>${escapeHTML(c)}</th>`).join('') + '</tr></thead>');
      html.push('<tbody>');
      // 处理表格主体
      for (const row of bodyRows) {
        const cells = row.split('|').slice(1, -1).map(s => s.trim());
        html.push('<tr>' + cells.map(c => `<td>${escapeHTML(c)}</td>`).join('') + '</tr>');
      }
      html.push('</tbody></table>');

      inTable = false;
      tableHeaderParsed = false;
      tableRows = [];
      // 回到本行继续处理
    }

    //  --- 普通行：段落 --- 
    paragraphLines.push(line);
  }

  // 循环结束后关闭段落或列表或表格
  flushParagraph();
  if (inTable) {
    // 最后一段是表格，立即解析
    const header = tableRows[0];
    const separator = tableRows[1];
    const bodyRows = tableRows.slice(2);
    const headerCells = header.split('|').slice(1, -1).map(s => s.trim());
    html.push('<table>');
    html.push('<thead><tr>' + headerCells.map(c => `<th>${escapeHTML(c)}</th>`).join('') + '</tr></thead>');
    html.push('<tbody>');
    for (const row of bodyRows) {
      const cells = row.split('|').slice(1, -1).map(s => s.trim());
      html.push('<tr>' + cells.map(c => `<td>${escapeHTML(c)}</td>`).join('') + '</tr>');
    }
    html.push('</tbody></table>');

    inTable = false;
    tableRows = [];
  }
  if (inList) {
    html.push(listType === 'ul' ? '</ul>' : '</ol>');
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
`;

const htmlOutput = parseMarkdown(md);

console.log(htmlOutput);
