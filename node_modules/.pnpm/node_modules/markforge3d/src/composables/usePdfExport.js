import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * PDF 导出工具
 * @param {Function} getThreeRenderer - 返回 three.js 渲染器实例
 */
export function usePdfExport(getThreeRenderer) {
  const exportPdf = async () => {
    const box = document.querySelector('.part-preview') // .part-preview 是 HTML 预览的父容器
    if (!box) {
      console.log('导出功能被调用，但找不到 .part-preview 元素')
      return
    }

    // 获取 .part-preview 原始尺寸和偏移，作为计算基准
    // 注意：这里获取的是渲染前的尺寸，如果 box.style.height='auto' 会导致尺寸变化
    // 所以需要在修改高度之前获取
    const initialBoxRect = box.getBoundingClientRect(); 
    const initialBoxWidth = initialBoxRect.width;

    // 记录原始样式
    const originalHeight = box.style.height
    const originalOverflow = box.style.overflow

    // 展开所有内容（影响布局，所以获取位置要在展开之后）
    box.style.height = 'auto'
    box.style.overflow = 'visible'

    // 临时强制亮色模式
    const root = document.documentElement
    root.classList.add('force-light')

    try {
      // 等待样式生效
      await new Promise(resolve => setTimeout(resolve, 100))

      // 再次获取 box 的尺寸和位置，因为高度可能已经变为 'auto'
      const currentBoxRect = box.getBoundingClientRect();
      const currentBoxWidth = currentBoxRect.width;


      // 1️⃣ 截取 Three.js 渲染画面
      const threeCanvas = box.querySelector('.three-canvas')
      let imgThree = null
      let threeRelativeX = 0; // Three.js canvas 相对于 .part-preview 的 X 坐标
      let threeRelativeY = 0; // Three.js canvas 相对于 .part-preview 的 Y 坐标
      let threeDisplayWidth = 0; // Three.js canvas 在 HTML 中的显示宽度
      let threeDisplayHeight = 0; // Three.js canvas 在 HTML 中的显示高度

      if (threeCanvas) {
        // 获取 threeCanvas 相对于其父容器 (.part-preview) 的位置
        // 注意：这里获取的是 threeCanvas 元素相对于视口的位置
        const threeRect = threeCanvas.getBoundingClientRect();
        
        // 计算 threeCanvas 相对于 .part-preview 的偏移量
        threeRelativeX = threeRect.left - currentBoxRect.left;
        threeRelativeY = threeRect.top - currentBoxRect.top;
        threeDisplayWidth = threeRect.width;
        threeDisplayHeight = threeRect.height;

        const three = getThreeRenderer?.()
        if (three?.renderer && three?.scene && three?.camera) {
          three.renderer.render(three.scene, three.camera) // 强制刷新
          await new Promise(resolve => setTimeout(resolve, 50)) 
        }
        imgThree = threeCanvas.toDataURL('image/png')
      }


      // 2️⃣ 截取文字部分（忽略 three-canvas）
      // html2canvas 会生成一个 Canvas，它的宽度就是 box 的宽度
      const canvasText = await html2canvas(box, {
        useCORS: true,
        scale: 2, // 使用两倍缩放以获得更高清晰度
        backgroundColor: '#ffffff',
        // 关键：在截取文字时，依然忽略 three-canvas，它的内容会单独处理
        ignoreElements: (el) => el.classList.contains('three-canvas'),
      })
      const imgText = canvasText.toDataURL('image/png')

      // 3️⃣ 生成 PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth() // PDF 页面的宽度 (mm)
      // const pdfHeight = pdf.internal.pageSize.getHeight() // PDF 页面的高度 (mm)

      // 计算统一的缩放因子
      // textProps.width 是 html2canvas 生成的图片的像素宽度
      // pdfWidth 是 PDF 页面的毫米宽度
      // scaleFactor 的单位是 mm/px，用于将 HTML 像素值转换为 PDF 毫米值
      // 由于 html2canvas 使用了 scale: 2，所以 canvasText.width 已经是 box.width 的两倍
      // 这里的 textProps.width 应该就是 canvasText.width
      const textProps = pdf.getImageProperties(imgText);
      const outputImageWidthPx = textProps.width; // html2canvas 生成的图片的像素宽度 (例如，box.width * 2)

      // 从 html2canvas 的输出宽度反推到原始 HTML 宽度
      const originalHtmlWidthPx = outputImageWidthPx / 2; // 如果 html2canvas scale=2

      // 统一的缩放因子：PDF 宽度 (mm) / 原始 HTML 宽度 (px)
      const mmPerPx = pdfWidth / originalHtmlWidthPx;


      // 插入文字部分
      const textHeightInPx = textProps.height / 2; // html2canvas scale=2，所以高度也要除以2才能得到原始HTML高度
      const textHeightInMm = textHeightInPx * mmPerPx;
      pdf.addImage(imgText, 'PNG', 0, 0, pdfWidth, textHeightInMm)


      // 插入 Three.js 渲染图（根据其在HTML中的相对位置）
      if (imgThree && threeCanvas) {
        // threeCanvas 截图本身的像素尺寸
        const threeImgProps = pdf.getImageProperties(imgThree);
        const threeImgWidthPx = threeImgProps.width;
        const threeImgHeightPx = threeImgProps.height;

        // 计算 Three.js 图像在 PDF 中的位置和尺寸
        // 关键：threeRelativeX 和 threeRelativeY 是 threeCanvas 相对于 .part-preview 的像素偏移量
        // threeDisplayWidth 和 threeDisplayHeight 是 threeCanvas 在 HTML 中实际的像素尺寸
        const threePdfX = threeRelativeX * mmPerPx;
        const threePdfY = threeRelativeY * mmPerPx;
        const threePdfWidth = threeDisplayWidth * mmPerPx;
        const threePdfHeight = threeDisplayHeight * mmPerPx;
        
        pdf.addImage(
          imgThree,
          'PNG',
          threePdfX,
          threePdfY,
          threePdfWidth,
          threePdfHeight
        )
      }

      pdf.save('markforge-export.pdf')
    } catch (err) {
      console.error('导出 PDF 失败:', err)
    } finally {
      // 恢复原样
      box.style.height = originalHeight
      box.style.overflow = originalOverflow
      root.classList.remove('force-light')
    }
  }

  return { exportPdf }
}