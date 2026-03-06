// src/composables/usePdfExport.js
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function usePdfExport(getThreeRenderer) {
  const exportPdf = async () => {
    const box = document.querySelector('.part-preview')
    if (!box) {
      console.log('导出功能被调用，但找不到 .part-preview 元素')
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

      const currentBoxRect = box.getBoundingClientRect()

      const threeCanvas = box.querySelector('.three-canvas')
      let imgThree = null
      let threeRelativeX = 0
      let threeRelativeY = 0
      let threeDisplayWidth = 0
      let threeDisplayHeight = 0

      if (threeCanvas) {
        const threeRect = threeCanvas.getBoundingClientRect()
        threeRelativeX = threeRect.left - currentBoxRect.left
        threeRelativeY = threeRect.top - currentBoxRect.top
        threeDisplayWidth = threeRect.width
        threeDisplayHeight = threeRect.height

        const three = getThreeRenderer?.()
        if (three?.renderer && three?.scene && three?.camera) {
          three.renderer.render(three.scene, three.camera)
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        imgThree = threeCanvas.toDataURL('image/png')
      }

      const canvasText = await html2canvas(box, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        ignoreElements: el => el.classList.contains('three-canvas')
      })
      const imgText = canvasText.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()

      const textProps = pdf.getImageProperties(imgText)
      const outputImageWidthPx = textProps.width
      const originalHtmlWidthPx = outputImageWidthPx / 2
      const mmPerPx = pdfWidth / originalHtmlWidthPx

      const textHeightInPx = textProps.height / 2
      const textHeightInMm = textHeightInPx * mmPerPx
      pdf.addImage(imgText, 'PNG', 0, 0, pdfWidth, textHeightInMm)

      if (imgThree && threeCanvas) {
        const threePdfX = threeRelativeX * mmPerPx
        const threePdfY = threeRelativeY * mmPerPx
        const threePdfWidth = threeDisplayWidth * mmPerPx
        const threePdfHeight = threeDisplayHeight * mmPerPx

        pdf.addImage(imgThree, 'PNG', threePdfX, threePdfY, threePdfWidth, threePdfHeight)
      }

      pdf.save('markforge-export.pdf')
    } catch (err) {
      console.error('导出 PDF 失败:', err)
    } finally {
      box.style.height = originalHeight
      box.style.overflow = originalOverflow
      root.classList.remove('force-light')
    }
  }

  return { exportPdf }
}