// src/composables/exportUtils.js
//
// 问题1修复（Three.js 导出空白）：
//   cloneNode(true) 只复制 DOM 结构，不复制 <canvas> 像素。
//   截图前先把所有 canvas 转成 toDataURL，在克隆节点里用 <img> 替换对应的 canvas。
//
// 问题2修复（Three.js 靠右边）：
//   .canvas-box 有 min-width:900px 但无居中设置，克隆后溢出偏移。
//   在克隆节点里对 .canvas-box 强制设置 width:100%; display:flex; justify-content:center。
//
// 问题3修复（文字贴边）：
//   .scroll-container 有 padding:20px，但克隆的是内部的 .part-preview，没有这层 padding。
//   在克隆节点上直接补 padding:30px。
//
// 暗色模式修复：
//   不依赖 .force-light class（styles.scss 里没有定义），
//   改为在克隆节点上用内联样式覆盖 CSS 变量，始终输出白底黑字。

import html2canvas from 'html2canvas'

const LIGHT_STYLE = `
  --bg-app:#f9f9f9; --bg-sidebar:#f0f0f0; --bg-surface:#ffffff;
  --bg-hover:#e6e6e6; --border-color:#e0e0e0;
  --text-primary:#333333; --text-secondary:#666666;
  --color-accent:#2c3e50; --color-danger:#e74c3c;
  color-scheme:light; background-color:#ffffff; color:#333333;
`

/**
 * 把页面上所有可见 canvas 的像素内容保存起来
 * 返回 Map<canvas元素, dataURL字符串>
 */
function snapshotCanvases(root) {
  const map = new Map()
  root.querySelectorAll('canvas').forEach(canvas => {
    try {
      map.set(canvas, canvas.toDataURL('image/png'))
    } catch (e) {
      // canvas 可能因跨域被污染，忽略
    }
  })
  return map
}

/**
 * 在克隆节点里把 <canvas> 替换成对应的 <img>，保留原始尺寸和位置
 */
function replaceCanvasesWithImages(clone, canvasMap, sourceRoot) {
  const sourceCanvases = Array.from(sourceRoot.querySelectorAll('canvas'))
  const cloneCanvases  = Array.from(clone.querySelectorAll('canvas'))

  sourceCanvases.forEach((srcCanvas, i) => {
    const dataUrl = canvasMap.get(srcCanvas)
    const cloneCanvas = cloneCanvases[i]
    if (!dataUrl || !cloneCanvas) return

    const img = document.createElement('img')
    img.src = dataUrl
    img.width  = srcCanvas.clientWidth  || srcCanvas.width
    img.height = srcCanvas.clientHeight || srcCanvas.height
    img.style.cssText = `
      width:${srcCanvas.clientWidth || srcCanvas.width}px;
      height:${srcCanvas.clientHeight || srcCanvas.height}px;
      display:block;
    `
    cloneCanvas.parentNode.replaceChild(img, cloneCanvas)
  })
}

/**
 * 修复克隆节点内 .canvas-box 的布局（Three.js 容器居中）
 */
function fixCanvasBoxLayout(clone) {
  clone.querySelectorAll('.canvas-box').forEach(box => {
    box.style.cssText += `
      width:100% !important;
      min-width:0 !important;
      display:flex !important;
      justify-content:center !important;
      box-sizing:border-box !important;
    `
  })
  // canvas 或替换后的 img 也限制最大宽度
  clone.querySelectorAll('.canvas-box img, .canvas-box canvas').forEach(el => {
    el.style.maxWidth = '90%'
  })
}

/**
 * 强制克隆节点内所有元素使用亮色主题
 */
function forceLight(clone) {
  clone.querySelectorAll('*').forEach(el => {
    const cs = window.getComputedStyle(el)
    const bg = cs.backgroundColor
    const fg = cs.color

    // 跳过透明背景，避免把所有元素都刷成白色
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      el.style.backgroundColor = '#ffffff'
    }
    if (fg) {
      el.style.color = '#333333'
    }
  })

  // pre/code 保留浅灰背景
  clone.querySelectorAll('pre').forEach(el => {
    el.style.backgroundColor = '#f5f5f5'
    el.style.color = '#333333'
  })
  clone.querySelectorAll('code').forEach(el => {
    el.style.backgroundColor = '#f0f0f0'
    el.style.color = '#c0392b'
  })

  // blockquote
  clone.querySelectorAll('blockquote').forEach(el => {
    el.style.backgroundColor = '#f9f9f9'
    el.style.borderLeftColor  = '#2c3e50'
    el.style.color = '#666666'
  })

  // 表格
  clone.querySelectorAll('th').forEach(el => {
    el.style.backgroundColor = '#f0f0f0'
    el.style.color = '#333333'
  })
  clone.querySelectorAll('td').forEach(el => {
    el.style.backgroundColor = '#ffffff'
    el.style.color = '#333333'
  })
}

/**
 * 主函数：截取完整预览区域，返回 HTMLCanvasElement
 */
export async function capturePreview() {
  const source = document.querySelector('.part-preview')
  if (!source) throw new Error('找不到 .part-preview 元素')

  // 1. 截取所有 canvas 像素（必须在克隆之前，此时 canvas 有内容）
  const canvasMap = snapshotCanvases(source)

  // 2. 创建离屏容器，脱离所有布局约束
  const totalWidth = source.scrollWidth
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position:fixed; top:-99999px; left:-99999px;
    width:${totalWidth}px; height:auto;
    overflow:visible; pointer-events:none; z-index:-1;
  `

  // 3. 深克隆
  const clone = source.cloneNode(true)
  clone.style.cssText = `
    width:${totalWidth}px;
    height:auto;
    overflow:visible;
    padding:30px;
    box-sizing:border-box;
    ${LIGHT_STYLE}
  `

  // 4. 把 <canvas> 替换成截图的 <img>
  replaceCanvasesWithImages(clone, canvasMap, source)

  // 5. 修复 Three.js 容器布局
  fixCanvasBoxLayout(clone)

  // 6. 强制亮色主题
  forceLight(clone)

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  // 等待样式和图片加载
  await new Promise(r => setTimeout(r, 200))

  try {
    const canvas = await html2canvas(clone, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      width: totalWidth,
      height: clone.scrollHeight,
      windowWidth: totalWidth,
      windowHeight: clone.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    })
    return canvas
  } finally {
    document.body.removeChild(wrapper)
  }
}