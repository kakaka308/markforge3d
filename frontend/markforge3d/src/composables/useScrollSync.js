// src/composables/useScrollSync.js
// 修复：接收第三个参数 markdownInput，内容变化后 nextTick 重新把预览
// 滚动到和编辑器当前行对齐，解决内容更新后预览位置错位的问题。
import { onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

export function useScrollSync(editorScrollRef, previewScrollRef, markdownInput) {
  let textareaEl = null
  let previewEl  = null

  let syncingFromEditor  = false
  let syncingFromPreview = false

  const getTopInContainer = (el, container) => {
    return el.getBoundingClientRect().top
      - container.getBoundingClientRect().top
      + container.scrollTop
  }

  const syncEditorToPreview = () => {
    if (!textareaEl || !previewEl) return
    const scrollableH = textareaEl.scrollHeight - textareaEl.clientHeight
    if (scrollableH <= 0) return

    const lineEls = previewEl.querySelectorAll('[data-line]')
    if (lineEls.length === 0) {
      const ratio = textareaEl.scrollTop / scrollableH
      previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight)
    } else {
      const lineHeight = parseFloat(getComputedStyle(textareaEl).lineHeight) || 24
      const currentLine = Math.floor(textareaEl.scrollTop / lineHeight)

      let best = lineEls[0]
      let bestDiff = Infinity
      lineEls.forEach(el => {
        const diff = Math.abs(parseInt(el.dataset.line) - currentLine)
        if (diff < bestDiff) { bestDiff = diff; best = el }
      })

      previewEl.scrollTop = Math.max(0, getTopInContainer(best, previewEl) - 16)
    }
  }

  const onEditorScroll = () => {
    if (syncingFromPreview) return
    syncingFromEditor = true
    syncEditorToPreview()
    setTimeout(() => { syncingFromEditor = false }, 80)
  }

  const onPreviewScroll = () => {
    if (syncingFromEditor || !textareaEl || !previewEl) return
    syncingFromPreview = true

    const lineEls = previewEl.querySelectorAll('[data-line]')
    if (lineEls.length === 0) {
      const ratio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1)
      textareaEl.scrollTop = ratio * (textareaEl.scrollHeight - textareaEl.clientHeight)
    } else {
      let nearestLine = 0
      for (const el of lineEls) {
        const top = getTopInContainer(el, previewEl) - previewEl.scrollTop
        if (top >= -8) { nearestLine = parseInt(el.dataset.line); break }
      }
      const lineHeight = parseFloat(getComputedStyle(textareaEl).lineHeight) || 24
      textareaEl.scrollTop = Math.max(0, nearestLine * lineHeight - 16)
    }

    setTimeout(() => { syncingFromPreview = false }, 80)
  }

  const bind = () => {
    nextTick(() => {
      textareaEl = editorScrollRef.value?.querySelector('textarea') ?? null
      previewEl  = previewScrollRef.value ?? null

      if (!textareaEl || !previewEl) {
        console.warn('[useScrollSync] 未找到滚动元素')
        return
      }

      textareaEl.addEventListener('scroll', onEditorScroll, { passive: true })
      previewEl.addEventListener('scroll', onPreviewScroll, { passive: true })
    })
  }

  const unbind = () => {
    textareaEl?.removeEventListener('scroll', onEditorScroll)
    previewEl?.removeEventListener('scroll', onPreviewScroll)
  }

  onMounted(bind)
  onBeforeUnmount(unbind)

  // 修复：内容变化后，等预览 DOM 更新完再把预览滚到编辑器当前行
  // 用 watch 而不是 watchEffect，避免初始化时多余触发
  if (markdownInput) {
    watch(markdownInput, () => {
      nextTick(() => {
        syncingFromPreview = false  // 确保不被防抖 flag 拦截
        syncEditorToPreview()
      })
    })
  }

  return { bind, unbind }
}