import { renderMath } from '../utils/math.js';

let inMathBlock = false;
let mathBlockLines = [];

export function startOrEndMathBlock(line, html) {
  if (line.trim() !== '$$') return false;

  if (inMathBlock) {
    // 数学公式块结束
    html.push(renderMath(mathBlockLines.join('\n'), true));
    inMathBlock = false;
    mathBlockLines = [];
  } else {
    // 数学公式块开始
    inMathBlock = true;
    mathBlockLines = [];
  }
  return true;
}

export function handleMathLine(line) {
  if (!inMathBlock) return false;
  mathBlockLines.push(line);
  return true;
}

export function isInMathBlock() {
  return inMathBlock;
}
