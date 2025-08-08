// utils.js
export function escapeHTML(str = '') {
  return str
    .replace(/&/g, "&amp;")   
    .replace(/</g, "&lt;")    
    .replace(/>/g, "&gt;");
}

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

export function restoreHTML(str = '', htmlMap = {}) {
  return str.replace(/@@HTML(\d+)@@/g, (_, i) => htmlMap[`@@HTML${i}@@`] || '');
}

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

export function restoreCode(str = '', codeMap = {}) {
  return str.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${escapeHTML(codeMap[`@@CODE${i}@@`] || '')}</code>`);
}

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
