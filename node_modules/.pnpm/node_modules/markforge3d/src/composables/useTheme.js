// src/composables/useTheme.js
import { ref, onMounted, watch } from 'vue'

export function useTheme() {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  const applyTheme = () => {
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark-mode')
      root.classList.remove('light-mode')
    } else {
      root.classList.add('light-mode')
      root.classList.remove('dark-mode')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    applyTheme()
  })

  onMounted(() => {
    applyTheme()
  })

  return { isDark, toggleTheme }
}