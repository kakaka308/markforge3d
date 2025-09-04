import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-markup.js';

let inCodeBlock = false;
let codeLang = 'text';
let codeLines = [];

export function startOrEndCodeBlock(line, html) {
  const trimmed = line.trim();
  if (!/^```/.test(trimmed)) return false;

  if (inCodeBlock) {
    // 代码块结束
    const codeContent = codeLines.join('\n');
    const highlighted = Prism.highlight(
      codeContent,
      Prism.languages[codeLang] || Prism.languages.text,
      codeLang
    );
    html.push(`<pre class="language-${codeLang}"><code>${highlighted}</code></pre>`);
    inCodeBlock = false;
    codeLines = [];
  } else {
    // 代码块开始
    inCodeBlock = true;
    codeLang = trimmed.slice(3).trim() || 'text';
    codeLines = [];
  }
  return true;
}

export function handleCodeLine(line) {
  if (!inCodeBlock) return false;
  codeLines.push(line);
  return true;
}

export function isInCodeBlock() {
  return inCodeBlock;
}
