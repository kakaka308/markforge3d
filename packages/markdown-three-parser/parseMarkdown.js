// 转义 HTML 特殊字符，防止 XSS 攻击
function escapeHTML(str = '') {
  return str
    .replace(/&/g, "&amp;")   // 替换 & 符号为 &amp;
    .replace(/</g, "&lt;")    // 替换 < 符号为 &lt;
    .replace(/>/g, "&gt;");   // 替换 > 符号为 &gt;
}

// 保护内联 HTML 标签，防止被转义
function protectHTML(str = '') {
  const htmlMap = {};
  let idx = 0;
  // 用占位符替换所有 HTML 标签，保存原始标签到 htmlMap 中
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

// 解析属性字符串，转换为规范的 key="value" 格式
function parseAttrs(attrStr = '') {
  const attrs = [];
  // 匹配形如 key="value"、key='value' 或 key=value 的属性
  const regex = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    const key = match[1];
    let value = match[2];
    // 去除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    attrs.push(`${key}="${value}"`);
  }
  return attrs.join(' ');
}

// Markdown 解析主函数
function parseMarkdown(md = '') {
  const lines = md.split('\n');  // 按行拆分输入
  const html = [];               // 用于存储最终 HTML 输出
  let inCodeBlock = false;       // 标记是否处于代码块中
  let codeLang = '';             // 代码块语言标识
  const listStack = [];          // 用于处理嵌套列表的栈
  let paragraphLines = [];       // 用于累积段落内多行文本
  let inTable = false;           // 标记是否处于表格解析状态
  let tableRows = [];            // 存储表格所有行
  const footnotes = {};          // 存储脚注内容，key为脚注编号

  // 处理并输出段落内容
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      let text = paragraphLines.join(' ');

      // 保护内联 HTML，防止被转义
      const { text: protectedText, map: htmlMap } = protectHTML(text);
      text = escapeHTML(protectedText);

      // 先提取并替换行内代码，避免被后续替换影响
      const codeMatches = [];
      text = text.replace(/`([^`\n]+)`/g, (_, code) => {
        codeMatches.push(code);
        return `@@CODE${codeMatches.length - 1}@@`;
      });

      // 处理图片，支持可选属性
      text = text
        .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
          const extra = attrStr ? ' ' + parseAttrs(attrStr) : '';
          return `<img alt="${alt}" src="${src}"${extra} />`;
        })
        // 处理链接，带 target="_blank"
        .replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, text, url) => `<a href="${url}" target="_blank">${text}</a>`)
        // 斜体和加粗
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // 删除线
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        // 脚注引用
        .replace(/\[\^(.+?)\]/g, (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`);

      // 恢复之前替换的代码
      text = text.replace(/@@CODE(\d+)@@/g, (_, idx) => `<code>${codeMatches[idx]}</code>`);

      // 恢复之前保护的 HTML 标签
      text = restoreHTML(text, htmlMap);

      html.push(`<p>${text}</p>`); // 输出段落标签
      paragraphLines = [];         // 清空缓存
    }
  };

  // 关闭所有列表标签
  const flushList = () => {
    while (listStack.length > 0) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }
  };

  // 处理列表项，支持有序/无序和任务列表
  const handleListItem = (line) => {
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
    if (!match) return false;
    const indent = match[1].length;
    const marker = match[2];
    const content = match[3];
    const level = Math.floor(indent / 2);  // 每两个空格一个层级
    const isOrdered = /^\d+\./.test(marker);
    const currentTag = isOrdered ? 'ol' : 'ul';

    // 根据缩进调整列表嵌套层级，关闭多余列表标签
    while (listStack.length > level + 1) {
      const { tag } = listStack.pop();
      html.push(`</${tag}>`);
    }

    // 新增或切换列表类型
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

    // 保护 HTML，避免内容被转义
    const { text: protectedText, map: htmlMap } = protectHTML(content);

    // 处理任务列表项 [ ] 或 [x]
    const taskMatch = protectedText.match(/^\[( |x|X)\]\s+(.*)/);
    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === 'x';
      const text = restoreHTML(escapeHTML(taskMatch[2]), htmlMap);
      html.push(`<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${text}</li>`);
    } else {
      html.push(`<li>${restoreHTML(escapeHTML(protectedText), htmlMap)}</li>`);
    }
    return true;
  };

  // 逐行解析 Markdown
  for (const line of lines) {
    const trimmedLine = line.trim();

    // 代码块内部处理
    if (inCodeBlock) {
      if (trimmedLine === '```') {
        inCodeBlock = false;
        html.push('</code></pre>');
      } else {
        html.push(escapeHTML(line));
      }
      continue;
    }

    // 段落结束，输出之前缓存的段落内容
    flushParagraph();

    // 代码块开始标记 ``` 或 ```lang
    const codeBlockStart = line.match(/^```(\w*)/);
    if (codeBlockStart) {
      inCodeBlock = true;
      codeLang = codeBlockStart[1] || 'plaintext';
      html.push(`<pre><code class="language-${codeLang}">`);
      continue;
    }

    // 脚注定义 [^key]: 内容
    const footnoteDef = line.match(/^\[\^(.+?)\]:\s+(.+)/);
    if (footnoteDef) {
      const [, key, content] = footnoteDef;
      footnotes[key] = escapeHTML(content);
      continue;
    }

    // 分割线 ---
    if (/^---$/.test(trimmedLine)) {
      html.push('<hr/>');
      continue;
    }

    // 标题 #, ##, ### ...
    if (/^#+ /.test(line)) {
      const headingMatch = line.match(/^(#+)\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const { text: protectedText, map: htmlMap } = protectHTML(content);
        html.push(`<h${level}>${restoreHTML(escapeHTML(protectedText), htmlMap)}</h${level}>`);
        continue;
      }
    }

    // 引用块 >
    if (/^> /.test(line)) {
      const { text: protectedText, map: htmlMap } = protectHTML(line.slice(2));
      html.push(`<blockquote>${restoreHTML(escapeHTML(protectedText), htmlMap)}</blockquote>`);
      continue;
    }

    // 自定义三维渲染标签 :::three shape:::
    const threeMatch = line.match(/^:::three\s+(.+?):::/);
    if (threeMatch) {
      html.push(`<div class="three-render" data-shape="${threeMatch[1]}"></div>`);
      continue;
    }

    // 处理列表项
    if (handleListItem(line)) {
      continue;
    }

    // 空行，结束列表和表格
    if (trimmedLine === '') {
      flushList();
      if (inTable) {
        parseTable();
        inTable = false;
        tableRows = [];
      }
      continue;
    }

    // 表格行检测，行以 | 开头并包含 | 分割
    if (/^\|.*\|$/.test(line)) {
      if (!inTable) {
        inTable = true;
      }
      tableRows.push(line);
      continue;
    }

    // 表格结束，处理已缓存的表格行
    if (inTable && !/^\|.*\|$/.test(line)) {
      parseTable();
      inTable = false;
      tableRows = [];
    }

    // 非特殊行，缓存为段落内容
    paragraphLines.push(line);
  }

  // 循环结束后，输出剩余内容
  flushParagraph();
  flushList();
  if (inTable) {
    parseTable();
  }

  // 解析表格函数
  function parseTable() {
    if (tableRows.length < 2) return; // 至少要有表头和对齐行

    const header = tableRows[0];
    const alignRow = tableRows[1];
    const bodyRows = tableRows.slice(2);

    // 分割表头单元格，去除两边空白
    const headerCells = header.split('|').slice(1, -1).map(s => s.trim());
    const alignCells = alignRow.split('|').slice(1, -1).map(s => s.trim());

    // 判断每列对齐方式
    const alignments = alignCells.map(cell => {
      if (/^:\s*-+:\s*$/.test(cell)) return 'center';
      if (/^:\s*-+\s*$/.test(cell)) return 'left';
      if (/^\s*-+:\s*$/.test(cell)) return 'right';
      return null;
    });

    // 输出表头
    html.push('<table><thead><tr>' + headerCells.map((c, i) => {
      const align = alignments[i] ? ` align="${alignments[i]}"` : '';
      const { text: protectedText, map: htmlMap } = protectHTML(c);
      return `<th${align}>${restoreHTML(escapeHTML(protectedText), htmlMap)}</th>`;
    }).join('') + '</tr></thead><tbody>');

    // 输出表格内容行
    for (const row of bodyRows) {
      const cells = row.split('|').slice(1, -1).map(s => s.trim());
      html.push('<tr>' + cells.map((c, i) => {
        const align = alignments[i] ? ` align="${alignments[i]}"` : '';
        const { text: protectedText, map: htmlMap } = protectHTML(c);
        return `<td${align}>${restoreHTML(escapeHTML(protectedText), htmlMap)}</td>`;
      }).join('') + '</tr>');
    }
    html.push('</tbody></table>');
  }

  // 输出脚注部分
  if (Object.keys(footnotes).length > 0) {
    html.push('<hr/><section class="footnotes"><ol>');
    for (const [key, content] of Object.entries(footnotes)) {
      html.push(`<li id="footnote-${key}">${content} <a href="#ref-${key}">↩</a></li>`);
    }
    html.push('</ol></section>');
  }

  // 返回最终的 HTML 字符串
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