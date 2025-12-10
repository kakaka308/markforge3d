<script setup>
import { ref, provide, computed, onMounted } from 'vue'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

// 组件引入
import MarkdownEditor from './components/MarkdownEditor.vue'
import PreviewPane from './components/PreviewPane.vue'
import Toolbar from './components/Toolbar.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import InfoPanel from './components/InfoPanel.vue'
import DocList from './components/DocList.vue' // 新增
import AIAssistant from './components/AIAssistant.vue' // 新增
import KnowledgeGraph from './components/KnowledgeGraph.vue' // 新增

// Composables
import { usePdfExport } from './composables/usePdfExport'
import { useImageExport } from './composables/useImageExport' 
import { useHistory } from './composables/useHistory'
import { useShortcuts } from './composables/useShortcuts'
import { useTheme } from './composables/useTheme' // 新增
import { useDocuments } from './composables/useDocuments' // 新增
import { parseMarkdown } from 'markdown-three-parser'

// Markdown 输入
const markdownInput = ref(localStorage.getItem('draft') || '# Hello Markdown\n\n:::three\n### cube (0x007bff, 1.5)\n### sphere (red, 1)\n:::')

// HTML 渲染
const renderedHtml = computed(() => parseMarkdown(markdownInput.value) || '')

// 功能模块初始化
const { historyList, addHistory, rollback, showHistory, toggleHistory } = useHistory(markdownInput)
const { exportPdf } = usePdfExport()
const { exportPng } = useImageExport()
const { isDark, toggleTheme } = useTheme() // 主题
const { documents, saveCurrentDoc, deleteDoc } = useDocuments(markdownInput) // 文档管理

// 视图控制
const viewMode = ref('split')
const sidebarOpen = ref(false)
const infoOpen = ref(false)
const infoType = ref('tutorial')
const showGraph = ref(false) // 图谱显示状态

// Methods
const toggleMarkdownMode = () => viewMode.value = viewMode.value === 'markdown' ? 'split' : 'markdown'
const togglePreviewMode = () => viewMode.value = viewMode.value === 'preview' ? 'split' : 'preview'
const toggleSidebar = () => sidebarOpen.value = !sidebarOpen.value
const openInfo = (type) => { infoType.value = type; infoOpen.value = true }

// 加载文档
const loadDoc = (doc) => {
  if(confirm('加载新文档将覆盖当前内容，是否继续？')) {
    markdownInput.value = doc.content
    sidebarOpen.value = false // 移动端体验优化
  }
}

// AI 生成文档的回调
const handleAICreateDoc = (content) => {
  markdownInput.value = content
}

// 插入 Markdown (用于 Toolbar)
const insertMarkdown = (syntax, cursorOffset, cursorLength = 0) => {
  const textarea = document.querySelector('textarea')
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = markdownInput.value
  const newValue = value.substring(0, start) + syntax + value.substring(end)
  markdownInput.value = newValue
  
  // 保存草稿
  localStorage.setItem('draft', newValue)

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.selectionStart = start + cursorOffset
    textarea.selectionEnd = start + cursorOffset + cursorLength
  })
}

// 快捷键
useShortcuts({ addHistory, toggleHistory, exportPdf, insertMarkdown })

// Provide
provide('insertMarkdown', insertMarkdown)
provide('toggleMarkdownMode', toggleMarkdownMode)
provide('togglePreviewMode', togglePreviewMode)
provide('viewMode', viewMode)
provide('toggleSidebar', toggleSidebar)
provide('toggleTheme', toggleTheme) // 提供给 Toolbar
provide('isDark', isDark) // 提供给 Toolbar 显示状态

// 初始化
onMounted(() => {
  new Swiper('.swiper-container', { slidesPerView: 'auto', freeMode: true, spaceBetween: 10 })
})

// 侧边栏菜单配置
const menuItems = [
  { icon: '💾', label: '保存文档', action: () => { saveCurrentDoc(); alert('文档已保存') } },
  { icon: '🕸️', label: '知识图谱', action: () => showGraph.value = true },
  { icon: '📤', label: '导出 PDF', action: () => exportPdf() },
  { icon: '🖼️', label: '导出 PNG', action: () => exportPng() },
  { icon: '🕰️', label: '历史版本', action: () => toggleHistory() },
  { icon: '📖', label: '使用教程', action: () => openInfo('tutorial') },
]
</script>

<template>
  <div class="container">
    <div class="header">
      <div class="headertitle">📝 MarkForge 3D</div>
    </div>

    <Toolbar :isDark="isDark" @toggleTheme="toggleTheme" />

    <div class="main" :class="{ 'mode-markdown': viewMode === 'markdown', 'mode-preview': viewMode === 'preview' }">
      
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <ul class="sidebar-list">
          <li v-for="item in menuItems" :key="item.label" @click="item.action">
            <span>{{ item.icon }}</span> {{ item.label }}
          </li>
        </ul>
        <DocList :docs="documents" @load="loadDoc" @delete="deleteDoc" />
      </aside>

      <div class="left" v-if="viewMode !== 'preview'">
        <div class="card">
          <div class="part-title">Markdown 编辑区</div>
          <div class="scroll-container part-textarea">
            <MarkdownEditor v-model="markdownInput" />
          </div>
        </div>
      </div>

      <div class="right" v-if="viewMode !== 'markdown'">
        <div class="card">
          <div class="part-title">HTML 预览</div>
          <div class="scroll-container part-preview preview">
            <PreviewPane :renderedHtml="renderedHtml" />
          </div>
        </div>
      </div>
    </div>

    <HistoryPanel :historyList="historyList" :showHistory="showHistory" @rollback="rollback" @close="toggleHistory" />
    <KnowledgeGraph :docs="documents" :isOpen="showGraph" @close="showGraph = false" />
    <AIAssistant @create-doc="handleAICreateDoc" />

    <div class="footer">MarkForge © 2025</div>
  </div>
</template>

<style lang="scss" src="./assets/styles.scss"></style>