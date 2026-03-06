// src/composables/useShortcuts.js
import { onMounted, onBeforeUnmount } from 'vue'

export function useShortcuts({ addHistory, toggleHistory, exportPdf, insertMarkdown }) {
  const handler = (e) => {
    const isMac = navigator.platform.includes('Mac')
    const isModifier = isMac ? e.metaKey : e.ctrlKey

    if (!isModifier) return

    if (isModifier && e.shiftKey) {
      switch (e.key) {
        case 'S':
        case 's':
          e.preventDefault()
          insertMarkdown('~~删除线~~', 2, 3)
          break
      }
    }

    if (isModifier && !e.shiftKey && !e.altKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          addHistory()
          break
        case 'e':
          e.preventDefault()
          exportPdf()
          break
        case 'h':
          e.preventDefault()
          toggleHistory()
          break
        case 'b':
          e.preventDefault()
          insertMarkdown('**粗体**', 2, 2)
          break
        case 'i':
          e.preventDefault()
          insertMarkdown('*斜体*', 1, 2)
          break
        case 'u':
          e.preventDefault()
          insertMarkdown('<u>下划线</u>', 3, 3)
          break
      }
    }

    if (isModifier && e.altKey) {
      switch (e.key) {
        case 'c':
          e.preventDefault()
          insertMarkdown('\n```\n\n```\n', 4, 0)
          break
      }
    }

    if (isModifier && e.key >= '1' && e.key <= '6') {
      e.preventDefault()
      const level = parseInt(e.key)
      const hashes = '#'.repeat(level)
      insertMarkdown(`${hashes} 标题`, level + 1, 2)
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
}