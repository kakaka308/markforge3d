// src/composables/useHistory.js
// 修复8：将 watch 改为 debounce 版本（500ms），用户停止输入后才记录历史，
//        避免每次按键都执行 diff 检查，减少不必要的开销。
//        注意：需要安装 @vueuse/core（pnpm add @vueuse/core）
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

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
      // 最多保留 50 条
      if (historyList.value.length > 50) historyList.value.shift()
    }
  }

  const rollback = (item) => {
    if (item) markdownInput.value = item.content
  }

  const toggleHistory = () => {
    showHistory.value = !showHistory.value
  }

  // 修复8：debounce 500ms，用户停止输入后才记录，立即执行一次获取初始值
  watchDebounced(markdownInput, addHistory, { debounce: 500, immediate: true })

  return { historyList, addHistory, rollback, showHistory, toggleHistory }
}