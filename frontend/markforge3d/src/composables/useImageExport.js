// src/composables/useImageExport.js
import html2canvas from 'html2canvas'

/**
 * PNG 导出工具
 */
export function useImageExport() {
  const exportPng = async () => {
    const box = document.querySelector('.part-preview')
    if (!box) {
      console.error('无法找到 .part-preview 元素，导出失败。')
      return
    }

    // 记录原始样式
    const originalHeight = box.style.height
    const originalOverflow = box.style.overflow

    // 展开所有内容并强制亮色模式
    box.style.height = 'auto'
    box.style.overflow = 'visible'
    const root = document.documentElement
    root.classList.add('force-light')

    try {
      await new Promise(resolve => setTimeout(resolve, 100))

      // 使用 html2canvas 截取预览区域
      const canvas = await html2canvas(box, {
        useCORS: true,
        scale: 2, // 使用两倍缩放以获得更高清晰度
        backgroundColor: '#ffffff',
      })

      // 创建一个临时的 a 标签来下载图片
      const link = document.createElement('a')
      link.download = 'markforge-export.png'
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      console.error('导出 PNG 失败:', err)
    } finally {
      // 恢复原始样式
      box.style.height = originalHeight
      box.style.overflow = originalOverflow
      root.classList.remove('force-light')
    }
  }

  return { exportPng }
}