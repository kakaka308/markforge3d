// utils.js
// 转义 HTML 特殊字符，防止 XSS 攻击
export function escapeHTML(str = '') {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 保护内联 HTML 标签，防止被转义
export function protectHTML(str = '') {
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
export function restoreHTML(str = '', htmlMap = {}) {
  return str.replace(/@@HTML(\d+)@@/g, (_, i) => htmlMap[`@@HTML${i}@@`] || '');
}

// 保护内联代码，防止其内容在 HTML 转义时被破坏
export function protectCode(str = '') {
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
export function restoreCode(str = '', codeMap = {}) {
  return str.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${escapeHTML(codeMap[`@@CODE${i}@@`] || '')}</code>`);
}

// 解析属性字符串，转换为规范的 key="value" 格式
export function parseAttrs(attrStr = '') {
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