<script setup>
import { ref, provide, computed, onMounted, watch } from 'vue'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

import MarkdownEditor from './components/MarkdownEditor.vue'
import PreviewPane from './components/PreviewPane.vue'
import Toolbar from './components/Toolbar.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import InfoPanel from './components/InfoPanel.vue'
import DocList from './components/DocList.vue'
import AIAssistant from './components/AIAssistant.vue'
import KnowledgeGraph from './components/KnowledgeGraph.vue'

import { usePdfExport } from './composables/usePdfExport'
import { useImageExport } from './composables/useImageExport' 
import { useHistory } from './composables/useHistory'
import { useShortcuts } from './composables/useShortcuts'
import { useTheme } from './composables/useTheme'
import { useDocuments } from './composables/useDocuments'
import { parseMarkdown } from 'markdown-three-parser'

const markdownInput = ref(localStorage.getItem('draft') || '')
const docTitle = ref(localStorage.getItem('draft_title') || '未命名文档')

// 草稿缓存
watch(docTitle, (val) => localStorage.setItem('draft_title', val))
watch(markdownInput, (val) => localStorage.setItem('draft', val))

const renderedHtml = computed(() => parseMarkdown(markdownInput.value) || '')

const { historyList, addHistory, rollback } = useHistory(markdownInput)
const { exportPdf } = usePdfExport()
const { exportPng } = useImageExport()
const { isDark, toggleTheme } = useTheme()

// 🔥 使用新的 useDocuments
const { 
  documents, 
  currentDocId, 
  saveCurrentDoc, 
  deleteDoc, 
  createNewDoc, 
  updateDocTitle 
} = useDocuments(markdownInput, docTitle)

const viewMode = ref('split')
const sidebarOpen = ref(false)
const sidebarView = ref('main')
const infoOpen = ref(false)
const infoType = ref('tutorial')
const showGraph = ref(false)

const toggleMarkdownMode = () => viewMode.value = viewMode.value === 'markdown' ? 'split' : 'markdown'
const togglePreviewMode = () => viewMode.value = viewMode.value === 'preview' ? 'split' : 'preview'
const toggleSidebar = () => sidebarOpen.value = !sidebarOpen.value
const openInfo = (type) => { infoType.value = type; infoOpen.value = true }

const showHistoryView = () => {
  sidebarView.value = 'history'
  sidebarOpen.value = true
}

const handleCreateNew = () => {
  if (confirm('确定要新建文档吗？未保存的内容将会丢失。')) {
    createNewDoc()
  }
}

const loadDoc = (doc) => {
  if(confirm('加载新文档将覆盖当前编辑内容，是否继续？')) {
    markdownInput.value = doc.content
    docTitle.value = doc.title
    currentDocId.value = doc.id
  }
}

const handleRename = ({ id, title }) => {
  updateDocTitle(id, title)
}

const handleAICreateDoc = (content) => {
  markdownInput.value = content
}

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

useShortcuts({ addHistory, toggleHistory: showHistoryView, exportPdf, insertMarkdown })

provide('insertMarkdown', insertMarkdown)
provide('toggleMarkdownMode', toggleMarkdownMode)
provide('togglePreviewMode', togglePreviewMode)
provide('viewMode', viewMode)
provide('toggleSidebar', toggleSidebar)
provide('toggleTheme', toggleTheme)
provide('isDark', isDark)

onMounted(() => {
  new Swiper('.swiper-container', { slidesPerView: 'auto', freeMode: true, spaceBetween: 10 })
})

const menuItems = [
  { icon: '📄', label: '新建文档', action: handleCreateNew },
  { icon: '💾', label: '保存文档', action: () => { saveCurrentDoc(); alert('文档已保存') } },
  { icon: '🕸️', label: '知识图谱', action: () => showGraph.value = true },
  { icon: '📤', label: '导出 PDF', action: () => exportPdf() },
  { icon: '🖼️', label: '导出 PNG', action: () => exportPng() },
  { icon: '🕰️', label: '历史版本', action: showHistoryView },
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
          <DocList 
            :docs="documents" 
            :currentId="currentDocId"
            @load="loadDoc" 
            @delete="deleteDoc"
            @rename="handleRename" 
          />
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
          <div class="editor-header">
            <input 
              v-model="docTitle" 
              class="main-title-input" 
              type="text" 
              placeholder="请输入文档标题" 
            />
          </div>
          
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

<style scoped>
/* 🔥 大标题样式 */
.editor-header {
  padding: 20px 30px 10px 30px;
  background: var(--bg-surface);
  flex-shrink: 0;
}

.main-title-input {
  width: 100%;
  font-size: 32px; /* 🔥 字体最大 */
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  font-family: 'Inter', sans-serif;
}

.main-title-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.main-title-input:focus {
  /* 获得焦点时，底部显示一条线 */
  border-bottom: 2px solid var(--color-accent);
}
</style>