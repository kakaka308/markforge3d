import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js';
import { protectCode, restoreCode } from '../utils/code.js';
import { renderMath } from '../utils/math.js';
import { parseAttrs } from '../utils/attrs.js';

export function flushParagraph(paragraphLines, html, inlineFootnotes) {
  if (paragraphLines.length === 0) return;

  let text = paragraphLines.join('\n');

  let { text: protectedHtmlText, map: htmlMap } = protectHTML(text);
  let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText);

  let escapedText = escapeHTML(protectedCodeText);

  // inline math
  let processedText = escapedText.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
    (_, expr) => renderMath(expr.trim(), false));

  // links, emphasis, images...
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

  processedText = processedText.replace(/\n/g, '<br />');
  processedText = restoreCode(processedText, codeMap);
  processedText = restoreHTML(processedText, htmlMap);

  html.push(`<p>${processedText}</p>`);
  paragraphLines.length = 0; // clear
}
