// src/__mocks__/katex.js
// 在测试中替代真实的 katex，避免其依赖浏览器 DOM API。
// renderToString 返回一个可预测的占位字符串，让测试断言聚焦在
// 解析器逻辑（正确识别 $...$ 语法）而非 KaTeX 渲染细节。
export default {
  renderToString(tex, options) {
    const mode = options?.displayMode ? 'block' : 'inline'
    return `<math-placeholder mode="${mode}">${tex}</math-placeholder>`
  }
}