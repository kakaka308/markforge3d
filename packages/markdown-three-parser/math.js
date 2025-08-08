import katex from 'katex';
import { escapeHTML } from './utils.js';

export function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode });
  } catch (e) {
    return `<code class="katex-error">${escapeHTML(tex)}</code>`;
  }
}
