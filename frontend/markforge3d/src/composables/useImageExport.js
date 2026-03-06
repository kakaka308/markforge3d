// src/composables/useImageExport.js
import html2canvas from 'html2canvas'

export function useImageExport() {
  const exportPng = async () => {
    const box = document.querySelector('.part-preview')
    if (!box) {
      console.error('无法找到 .part-preview 元素，导出失败。')
      return
    }

    const originalHeight = box.style.height
    const originalOverflow = box.style.overflow

    box.style.height = 'auto'
    box.style.overflow = 'visible'
    const root = document.documentElement
    root.classList.add('force-light')

    try {
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(box, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff'
      })

      const link = document.createElement('a')
      link.download = 'markforge-export.png'
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('导出 PNG 失败:', err)
    } finally {
      box.style.height = originalHeight
      box.style.overflow = originalOverflow
      root.classList.remove('force-light')
    }
  }

  return { exportPng }
}