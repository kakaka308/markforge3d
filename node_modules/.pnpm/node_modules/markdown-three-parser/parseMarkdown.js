import { flushParagraph } from './blocks/paragraph.js';
import { handleListItem, flushList } from './blocks/list.js';
import { startTable, addTableRow, parseTable, isInTable } from './blocks/table.js';
import { handleBlockquote, flushBlockquote } from './blocks/blockquote.js';
import { handleHeading } from './blocks/heading.js';
import { startOrEndCodeBlock, handleCodeLine, isInCodeBlock } from './blocks/codeBlock.js';
import { startOrEndMathBlock, handleMathLine, isInMathBlock } from './blocks/mathBlock.js';
import { startOrEndThreeBlock, handleThreeObject, isInThreeBlock } from './blocks/threeBlock.js';
import { renderFootnotes } from './footnotes.js';

export default function parseMarkdown(markdownText) {
  const lines = markdownText.split('\n');
  const html = [];
  const listStack = [];
  const paragraphLines = [];

  const footnotes = {};
  const inlineFootnotes = {};

    for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // ====== 分割线处理 ======
    if (/^(\*\s*\*\s*\*|---|___)\s*$/.test(line)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      html.push('<hr />');
      continue;
    }

    // ====== 代码块处理 ======
    if (startOrEndCodeBlock(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      continue;
    }
    if (isInCodeBlock()) {
      handleCodeLine(line);
      continue;
    }

    // ====== 数学公式块处理 ======
    if (startOrEndMathBlock(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      continue;
    }
    if (isInMathBlock()) {
      handleMathLine(line);
      continue;
    }

    // ====== Three.js 块处理 ======
    if (startOrEndThreeBlock(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      continue;
    }
    if (isInThreeBlock()) {
      handleThreeObject(line);
      continue;
    }

    // ====== 表格处理 ======
    if (line.trim().startsWith('|')) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      if (!isInTable()) startTable();
      addTableRow(line);
      continue;
    } else if (isInTable()) {
      parseTable(html);
    }

    // ====== 标题处理 ======
    if (handleHeading(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      continue;
    }

    // ====== 引用处理 ======
    if (handleBlockquote(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      continue;
    }

    // ====== 列表处理 ======
    if (handleListItem(line, html, listStack)) {
      flushParagraph(paragraphLines, html, inlineFootnotes);
      continue;
    }

    // ====== 段落处理（支持多空行）======
    if (line.trim() === '') {
      // 空行：结束当前段落
      flushParagraph(paragraphLines, html, inlineFootnotes);
      // 关键修改: 如果列表栈不为空，则在空行处闭合列表
      if (listStack.length > 0) {
        flushList(html, listStack);
      }
      // 向后统计连续空行数
      let extraEmptyLines = 0;
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') {
        extraEmptyLines++;
        j++;
      }

      // 插入 (extraEmptyLines) 个 <p><br></p> 来表示“额外空行”
      // 如果你想“3个空行显示2个空行”，就用 extraEmptyLines
      // 因为你已经遇到 1 个空行了，总共 (1 + extraEmptyLines) 个空行
      // 所以显示 (extraEmptyLines) 个额外间距
      for (let k = 0; k < extraEmptyLines; k++) {
        html.push('<p><br /></p>');
      }

      // 跳过已处理的空行
      i = j - 1; // 因为 for 循环会 +1

    } else {
      paragraphLines.push(line);
    }
  }

  // ====== 循环结束后的收尾 ======
  flushParagraph(paragraphLines, html, inlineFootnotes);
  flushList(html, listStack);
  flushBlockquote(html);

  if (isInTable()) parseTable(html);
  if (isInCodeBlock()) startOrEndCodeBlock('```', html);
  if (isInMathBlock()) startOrEndMathBlock('$$', html);
  if (isInThreeBlock()) startOrEndThreeBlock(':::', html);

  // 脚注渲染
  renderFootnotes(html, footnotes, inlineFootnotes);

  return html.join('\n');
}
