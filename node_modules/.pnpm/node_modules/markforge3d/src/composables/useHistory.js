import { ref, watch } from 'vue'

export function useHistory(markdownInput) {
  const historyList = ref([])
  const showHistory = ref(false)

  const addHistory = () => {
    const last = historyList.value[historyList.value.length - 1]
    if (!last || last.content !== markdownInput.value) {
      historyList.value.push({
        timestamp: new Date().toLocaleString(),
        content: markdownInput.value
      })
      if (historyList.value.length > 50) historyList.value.shift()
    }
  }

  const rollback = (item) => {
    if (item) markdownInput.value = item.content
  }

  const toggleHistory = () => {
    showHistory.value = !showHistory.value
  }

  watch(markdownInput, addHistory, { immediate: true })

  return { historyList, addHistory, rollback, showHistory, toggleHistory }
}
