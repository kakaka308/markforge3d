<script setup>
import { ref, provide, computed, onMounted } from 'vue'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

import MarkdownEditor from './components/MarkdownEditor.vue'
import PreviewPane from './components/PreviewPane.vue'
import Toolbar from './components/Toolbar.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import ThreePreview from './components/ThreePreview.vue'

import { usePdfExport } from './composables/usePdfExport'
import { useHistory } from './composables/useHistory'
import { useShortcuts } from './composables/useShortcuts'
import { parseMarkdown } from 'markdown-three-parser'

// Markdown 输入
const markdownInput = ref(localStorage.getItem('draft') || '# Hello Markdown\n\n:::three\n### cube (0x007bff, 1.5)\n### sphere (red, 1)\n:::')

// HTML 渲染
const renderedHtml = computed(() => parseMarkdown(markdownInput.value) || '')

// 历史记录
const { historyList, addHistory, rollback, showHistory, toggleHistory } = useHistory(markdownInput)

// PDF 导出
const { exportPdf } = usePdfExport()

// 显示模式：split | markdown | preview
const viewMode = ref('split')
const toggleMarkdownMode = () => {
  viewMode.value = viewMode.value === 'markdown' ? 'split' : 'markdown'
}
const togglePreviewMode = () => {
  viewMode.value = viewMode.value === 'preview' ? 'split' : 'preview'
}

// 插入 Markdown
const insertMarkdown = (syntax, cursorOffset, cursorLength = 0) => {
  const textarea = document.querySelector('textarea')
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = markdownInput.value
  const newValue = value.substring(0, start) + syntax + value.substring(end)
  markdownInput.value = newValue

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.selectionStart = start + cursorOffset
    textarea.selectionEnd = start + cursorOffset + cursorLength
  })
}

// 快捷键
useShortcuts({
  addHistory,
  toggleHistory,
  exportPdf,
  insertMarkdown,
})

// provide
provide('insertMarkdown', insertMarkdown)
provide('toggleMarkdownMode', toggleMarkdownMode)
provide('togglePreviewMode', togglePreviewMode)
provide('viewMode', viewMode)

// Swiper 初始化
onMounted(() => {
  new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 10,
  })
})

// 🔥 侧边栏控制
const sidebarOpen = ref(false)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
provide('toggleSidebar', toggleSidebar)

// 🔥 侧边栏配置 JSON
const menuItems = [
  { icon: '📑', label: '文件管理', action: () => console.log('打开文件管理') },
  { icon: '🤖', label: 'AI 辅助', action: () => console.log('调用 AI 功能') },
  { icon: '⚙', label: '设置', action: () => console.log('打开设置面板') },
  { icon: '📤', label: '导出 PDF', action: () => exportPdf() },
  { icon: '💾', label: '保存快照', action: () => addHistory() },
]
</script>

<template>
  <div class="container">
    <!-- 顶部 -->
    <div class="header">
      <div class="headertitle">📝 MarkForge 3D</div>
    </div>

    <!-- 工具栏 -->
    <Toolbar />

    <!-- 历史版本 -->
    <HistoryPanel
      :historyList="historyList"
      :showHistory="showHistory"
      @rollback="rollback"
      @close="toggleHistory"
    />

    <!-- 主体布局 -->
    <div class="main" :class="{
      'mode-markdown': viewMode === 'markdown',
      'mode-preview': viewMode === 'preview'
    }">
      <!-- 左侧 Markdown 编辑区 -->
      <div class="left" :class="{ full: viewMode === 'markdown' }">
        <div class="card">
          <div class="part-title">Markdown 编辑区</div>
          <div class="scroll-container part-textarea">
            <MarkdownEditor v-model="markdownInput" />
          </div>
        </div>
      </div>

      <!-- 右侧 HTML 预览区 + 3D 预览 -->
      <div class="right" :class="{ full: viewMode === 'preview' }">
        <div class="card">
          <div class="part-title">HTML 预览</div>
          <div class="scroll-container part-preview">
            <PreviewPane :renderedHtml="renderedHtml" />
          </div>
        </div>
    
      </div>
    </div>


    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h3>📂 功能菜单</h3>
        <button class="close-btn" @click="toggleSidebar">✖</button>
      </div>
      <ul class="sidebar-list">
        <li v-for="item in menuItems" :key="item.label" @click="item.action">
          <span>{{ item.icon }}</span> {{ item.label }}
        </li>
      </ul>
    </aside>

    

    <div class="footer">MarkForge © 2025</div>
  </div>
</template>

<style lang="scss" src="./assets/styles.scss"></style>
