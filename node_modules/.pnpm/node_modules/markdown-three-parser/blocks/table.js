import { escapeHTML } from '../utils/escape.js';

let tableRows = [];
let inTable = false;

export function startTable() {
  inTable = true;
  tableRows = [];
}

export function addTableRow(line) {
  if (!inTable) return;
  tableRows.push(line.trim());
}

export function parseTable(html) {
  if (!inTable || tableRows.length === 0) return;
  const headers = tableRows[0].split('|').map(s => s.trim()).filter(s => s !== '');
  const aligns = [];

  if (tableRows.length > 1) {
    const alignsRaw = tableRows[1].split('|').map(s => s.trim()).filter(s => s !== '');
    for (const a of alignsRaw) {
      if (/^:-+:$/.test(a)) aligns.push('center');
      else if (/^-+:$/.test(a)) aligns.push('right');
      else if (/^:-+$/.test(a)) aligns.push('left');
      else aligns.push('');
    }
  }

  html.push('<table>');
  html.push('<thead><tr>');
  for (let i = 0; i < headers.length; i++) {
    const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : '';
    html.push(`<th${align}>${escapeHTML(headers[i])}</th>`);
  }
  html.push('</tr></thead><tbody>');

  for (let i = 2; i < tableRows.length; i++) {
    const cells = tableRows[i].split('|').map(s => s.trim()).filter(s => s !== '');
    html.push('<tr>');
    for (let j = 0; j < headers.length; j++) {
      const align = aligns[j] ? ` style="text-align:${aligns[j]}"` : '';
      html.push(`<td${align}>${escapeHTML(cells[j] || '')}</td>`);
    }
    html.push('</tr>');
  }

  html.push('</tbody></table>');

  // reset
  tableRows = [];
  inTable = false;
}

export function isInTable() {
  return inTable;
}
