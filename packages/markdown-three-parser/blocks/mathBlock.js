// blocks/mathBlock.js
// 修复：改为工厂函数，消除模块级单例状态。
import { renderMath } from '../utils/math.js'

export function createMathBlockParser() {
  let inMathBlock = false
  let mathBlockLines = []

  return {
    startOrEnd(line, html) {
      if (line.trim() !== '$$') return false

      if (inMathBlock) {
        html.push(renderMath(mathBlockLines.join('\n'), true))
        inMathBlock = false
        mathBlockLines = []
      } else {
        inMathBlock = true
        mathBlockLines = []
      }
      return true
    },

    handleLine(line) {
      if (!inMathBlock) return false
      mathBlockLines.push(line)
      return true
    },

    isInBlock() {
      return inMathBlock
    },

    flush(html) {
      if (inMathBlock) {
        html.push(renderMath(mathBlockLines.join('\n'), true))
        inMathBlock = false
        mathBlockLines = []
      }
    }
  }
}