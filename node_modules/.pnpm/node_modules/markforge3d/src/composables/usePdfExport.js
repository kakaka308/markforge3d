// src/composables/usePdfExport.js
import jsPDF from 'jspdf'
import { capturePreview } from './exportUtils.js'

// A4 尺寸（mm）
const A4_WIDTH_MM  = 210
const A4_HEIGHT_MM = 297

export function usePdfExport() {
  const exportPdf = async () => {
    try {
      const canvas = await capturePreview()
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')

      // canvas 是 scale:2 的，实际像素要除以 2
      const canvasWidthPx  = canvas.width  / 2
      const canvasHeightPx = canvas.height / 2

      // 按 A4 宽度缩放，计算对应高度
      const mmPerPx       = A4_WIDTH_MM / canvasWidthPx
      const totalHeightMm = canvasHeightPx * mmPerPx

      if (totalHeightMm <= A4_HEIGHT_MM) {
        // 内容不超过一页，直接放
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, totalHeightMm)
      } else {
        // 内容超过一页，按 A4 高度切片分页
        // 用 canvas 切片避免 jsPDF 在页面边界裁剪文字
        const pageHeightPx = Math.floor(A4_HEIGHT_MM / mmPerPx) * 2  // scale:2

        let offsetPx = 0  // 当前在 scale:2 canvas 上的 y 偏移
        let isFirstPage = true

        while (offsetPx < canvas.height) {
          const sliceHeightPx = Math.min(pageHeightPx, canvas.height - offsetPx)

          // 切出这一页的 canvas 片段
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width  = canvas.width
          pageCanvas.height = sliceHeightPx
          const ctx = pageCanvas.getContext('2d')
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pageCanvas.width, sliceHeightPx)
          ctx.drawImage(canvas, 0, offsetPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)

          const sliceData     = pageCanvas.toDataURL('image/png')
          const sliceHeightMm = (sliceHeightPx / 2) * mmPerPx

          if (!isFirstPage) pdf.addPage()
          pdf.addImage(sliceData, 'PNG', 0, 0, A4_WIDTH_MM, sliceHeightMm)

          offsetPx += sliceHeightPx
          isFirstPage = false
        }
      }

      pdf.save(`markforge-export-${Date.now()}.pdf`)
    } catch (err) {
      console.error('导出 PDF 失败:', err)
    }
  }

  return { exportPdf }
}