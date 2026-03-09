// src/composables/useImageExport.js
import { capturePreview } from './exportUtils.js'

export function useImageExport() {
  const exportPng = async () => {
    try {
      const canvas = await capturePreview()

      const link = document.createElement('a')
      link.download = `markforge-export-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('导出 PNG 失败:', err)
    }
  }

  return { exportPng }
}