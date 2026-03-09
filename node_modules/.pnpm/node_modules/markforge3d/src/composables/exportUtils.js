// src/composables/exportUtils.js
// 导出公共工具：
// 问题1修复：克隆 .part-preview 节点到 body 外的隐藏容器，
//           脱离 .scroll-container 的 overflow/height 限制，
//           让 html2canvas 能截到完整内容而不只是可视区域。
// 问题2修复：不再依赖 .force-light class（styles.scss 里根本没有定义它），
//           改为在克隆节点上直接用内联样式强制覆盖所有 CSS 变量为白底黑字，
//           无论当前是亮色还是暗色模式，导出结果始终是白底黑字。
import html2canvas from 'html2canvas'

// 强制亮色的 CSS 变量，直接写在克隆节点的 style 上，优先级高于任何 class
const LIGHT_VARS = `
  --bg-app: #f9f9f9;
  --bg-sidebar: #f0f0f0;
  --bg-surface: #ffffff;
  --bg-hover: #e6e6e6;
  --border-color: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --color-accent: #2c3e50;
  --color-danger: #e74c3c;
  color-scheme: light;
  background-color: #ffffff;
  color: #333333;
`

/**
 * 克隆 .part-preview，放到 body 外的隐藏容器里截图，返回 HTMLCanvasElement
 * 截图完毕后自动清理 DOM
 */
export async function capturePreview() {
  const source = document.querySelector('.part-preview')
  if (!source) throw new Error('找不到 .part-preview 元素')

  // 创建离屏容器，绝对定位到视口外，不影响页面布局
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position: fixed;
    top: -99999px;
    left: -99999px;
    width: ${source.scrollWidth}px;
    height: auto;
    overflow: visible;
    pointer-events: none;
    z-index: -1;
  `

  // 深克隆节点，在克隆上修改样式，不影响页面显示
  const clone = source.cloneNode(true)
  clone.style.cssText = `
    width: ${source.scrollWidth}px;
    height: auto;
    overflow: visible;
    ${LIGHT_VARS}
  `

  // 克隆节点内所有子元素也强制亮色
  clone.querySelectorAll('*').forEach(el => {
    const computed = window.getComputedStyle(el)
    // 只处理有背景色或文字颜色的元素，避免覆盖正常透明元素
    if (computed.color.includes('rgb')) {
      el.style.color = '#333333'
    }
    if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      el.style.backgroundColor = '#ffffff'
    }
  })

  // pre/code 块保留背景但确保文字可见
  clone.querySelectorAll('pre, code').forEach(el => {
    el.style.backgroundColor = '#f5f5f5'
    el.style.color = '#333333'
  })

  // blockquote 保持样式
  clone.querySelectorAll('blockquote').forEach(el => {
    el.style.borderLeftColor = '#2c3e50'
    el.style.color = '#666666'
    el.style.backgroundColor = '#f9f9f9'
  })

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  // 等待样式生效和 canvas 元素渲染
  await new Promise(r => setTimeout(r, 150))

  try {
    const canvas = await html2canvas(clone, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      width: source.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: source.scrollWidth,
      windowHeight: clone.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    })
    return canvas
  } finally {
    document.body.removeChild(wrapper)
  }
}