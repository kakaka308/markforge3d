// src/composables/useHistory.js
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

export function useHistory(markdownInput, docTitle) {
  const historyList = ref([])
  const showHistory = ref(false)

  const addHistory = () => {
    const last = historyList.value[historyList.value.length - 1]
    const snapshot = {
      timestamp: new Date().toLocaleString(),
      content:   markdownInput.value,
      title:     docTitle?.value ?? ''
    }
    // 内容和标题都没变则不重复记录
    if (!last || last.content !== snapshot.content || last.title !== snapshot.title) {
      historyList.value.push(snapshot)
      if (historyList.value.length > 50) historyList.value.shift()
    }
  }

  const rollback = (item) => {
    if (!item) return
    markdownInput.value = item.content
    if (docTitle && item.title !== undefined) {
      docTitle.value = item.title
    }
  }

  const toggleHistory = () => { showHistory.value = !showHistory.value }

  // 内容或标题变化后 500ms 记录一次
  watchDebounced(markdownInput, addHistory, { debounce: 500, immediate: true })
  if (docTitle) {
    watchDebounced(docTitle, addHistory, { debounce: 500 })
  }

  return { historyList, addHistory, rollback, showHistory, toggleHistory }
}