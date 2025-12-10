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
import DocList from './components/DocList.vue'
import AIAssistant from './components/AIAssistant.vue'
import KnowledgeGraph from './components/KnowledgeGraph.vue'

// Composables
import { usePdfExport } from './composables/usePdfExport'
import { useImageExport } from './composables/useImageExport' 
import { useHistory } from './composables/useHistory'
import { useShortcuts } from './composables/useShortcuts'
import { useTheme } from './composables/useTheme'
import { useDocuments } from './composables/useDocuments'
import { parseMarkdown } from 'markdown-three-parser'

// Markdown 输入
const markdownInput = ref(localStorage.getItem('draft') || '# Hello Markdown\n\n:::three\n### cube (0x007bff, 1.5)\n### sphere (red, 1)\n:::')

// HTML 渲染
const renderedHtml = computed(() => parseMarkdown(markdownInput.value) || '')

// 功能模块初始化
const { historyList, addHistory, rollback } = useHistory(markdownInput)
const { exportPdf } = usePdfExport()
const { exportPng } = useImageExport()
const { isDark, toggleTheme } = useTheme()
const { documents, saveCurrentDoc, deleteDoc } = useDocuments(markdownInput)

// 视图控制
const viewMode = ref('split')
const sidebarOpen = ref(false)
const sidebarView = ref('main') // 新增：控制侧边栏显示内容 ('main' | 'history')
const infoOpen = ref(false)
const infoType = ref('tutorial')
const showGraph = ref(false)

// Methods
const toggleMarkdownMode = () => viewMode.value = viewMode.value === 'markdown' ? 'split' : 'markdown'
const togglePreviewMode = () => viewMode.value = viewMode.value === 'preview' ? 'split' : 'preview'
const toggleSidebar = () => sidebarOpen.value = !sidebarOpen.value
const openInfo = (type) => { infoType.value = type; infoOpen.value = true }

// 切换到历史记录视图
const showHistoryView = () => {
  sidebarView.value = 'history'
  sidebarOpen.value = true // 确保侧边栏打开
}

// 加载文档
const loadDoc = (doc) => {
  if(confirm('加载新文档将覆盖当前内容，是否继续？')) {
    markdownInput.value = doc.content
    // 移动端体验优化: 加载后如果是在移动端可以关闭侧边栏，这里暂不强制
  }
}

// AI 生成文档的回调
const handleAICreateDoc = (content) => {
  markdownInput.value = content
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
  
  localStorage.setItem('draft', newValue)

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.selectionStart = start + cursorOffset
    textarea.selectionEnd = start + cursorOffset + cursorLength
  })
}

// 快捷键
useShortcuts({ 
  addHistory, 
  toggleHistory: showHistoryView, // 快捷键 Ctrl+H 现在直接打开侧边栏历史视图
  exportPdf, 
  insertMarkdown 
})

// Provide
provide('insertMarkdown', insertMarkdown)
provide('toggleMarkdownMode', toggleMarkdownMode)
provide('togglePreviewMode', togglePreviewMode)
provide('viewMode', viewMode)
provide('toggleSidebar', toggleSidebar)
provide('toggleTheme', toggleTheme)
provide('isDark', isDark)

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
  { icon: '🕰️', label: '历史版本', action: showHistoryView }, // 修改动作
  { icon: '📖', label: '使用教程', action: () => openInfo('tutorial') },
]
</script>

<template>
  <div class="container">
    <div class="header">
      <div class="headertitle">📝 MarkForge 3D</div>
    </div>

    <Toolbar :isDark="isDark" @toggleTheme="toggleTheme" />

    <KnowledgeGraph :docs="documents" :isOpen="showGraph" @close="showGraph = false" />
    <AIAssistant @create-doc="handleAICreateDoc" />

    <div class="main" :class="{ 'mode-markdown': viewMode === 'markdown', 'mode-preview': viewMode === 'preview' }">
      
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        
        <div v-if="sidebarView === 'main'" class="sidebar-main-view">
          <ul class="sidebar-list">
            <li v-for="item in menuItems" :key="item.label" @click="item.action">
              <span>{{ item.icon }}</span> {{ item.label }}
            </li>
          </ul>
          <DocList :docs="documents" @load="loadDoc" @delete="deleteDoc" />
        </div>

        <HistoryPanel 
          v-else-if="sidebarView === 'history'"
          :historyList="historyList"
          @rollback="rollback"
          @back="sidebarView = 'main'" 
        />
        
        <InfoPanel :type="infoType" :open="infoOpen" @close="infoOpen = false" />
      </aside>

      <div class="left" v-if="viewMode !== 'preview'" :class="{ full: viewMode === 'markdown' }">
        <div class="card">
          <div class="part-title">Markdown 编辑区</div>
          <div class="scroll-container part-textarea">
            <MarkdownEditor v-model="markdownInput" />
          </div>
        </div>
      </div>

      <div class="right" v-if="viewMode !== 'markdown'" :class="{ full: viewMode === 'preview' }">
        <div class="card">
          <div class="part-title">HTML 预览</div>
          <div class="scroll-container part-preview preview">
            <PreviewPane :renderedHtml="renderedHtml" />
          </div>
        </div>
      </div>
    </div>

    <div class="footer">MarkForge © 2025</div>
  </div>
</template>

<style lang="scss" src="./assets/styles.scss"></style>