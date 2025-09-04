import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js';
import { protectCode, restoreCode } from '../utils/code.js';
import { renderMath } from '../utils/math.js';

export function handleHeading(line, html) {
  const headingMatch = line.trim().match(/^(#{1,5})\s+(.*)/);
  if (!headingMatch) return false;

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
  return true;
}
