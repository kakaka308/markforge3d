<script setup>
import { ref, provide, computed, onMounted } from 'vue'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

import MarkdownEditor from './components/MarkdownEditor.vue'
import PreviewPane from './components/PreviewPane.vue'
import Toolbar from './components/Toolbar.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import ThreePreview from './components/ThreePreview.vue'
import InfoPanel from './components/InfoPanel.vue'

import { usePdfExport } from './composables/usePdfExport'
// 导入新的 useImageExport
import { useImageExport } from './composables/useImageExport' 
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

// 新增：PNG 导出功能
const { exportPng } = useImageExport()

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
  // 查找预览容器
  const previewContainer = document.querySelector('.part-preview.preview');
  if (!previewContainer) return;

  // 使用事件委托
  previewContainer.addEventListener('click', (event) => {
    const target = event.target;
    // 检查点击的是否是内嵌按钮
    if (target.matches('.embed-toggle-btn')) {
      const parentParagraph = target.closest('p');
      const link = target.previousElementSibling;
      
      if (link && link.tagName === 'A') {
        const url = link.getAttribute('data-url');
        const linkText = link.getAttribute('data-link-text');

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = linkText;
        iframe.width = '100%';
        iframe.height = '400px';
        iframe.style.border = '1px solid #ccc';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭内嵌';
        closeBtn.className = 'embed-close-btn';
        
        closeBtn.onclick = () => {
            const restoredHtml = `<a href="${url}" target="_blank" data-link-text="${linkText}" data-url="${url}">${linkText}</a> <button class="embed-toggle-btn">内嵌</button>`;
            parentParagraph.innerHTML = restoredHtml;
            // 因为innerHTML会重新渲染，所以这里需要重新绑定事件，但用事件委托就不用了
        };

        parentParagraph.replaceChild(iframe, link);
        parentParagraph.replaceChild(closeBtn, target);
      }
    } else if (target.matches('.embed-close-btn')) {
        // 恢复链接
        const parentParagraph = target.closest('p');
        const iframe = target.previousElementSibling;
        if (iframe && iframe.tagName === 'IFRAME') {
            const url = iframe.src;
            const linkText = iframe.title;
            const restoredHtml = `<a href="${url}" target="_blank" data-link-text="${linkText}" data-url="${url}">${linkText}</a> <button class="embed-toggle-btn">内嵌</button>`;
            parentParagraph.innerHTML = restoredHtml;
        }
    }
  });
})

// 使用教程与常见快捷键展示
const infoOpen = ref(false)
const infoType = ref('tutorial') // 默认显示教程

const openInfo = (type) => {
  infoType.value = type
  infoOpen.value = true
}

// 侧边栏控制
const sidebarOpen = ref(false)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
provide('toggleSidebar', toggleSidebar)

// 侧边栏配置 JSON
const menuItems = [
  { icon: '📤', label: '导出 PDF', action: () => exportPdf() },
  { icon: '🖼️', label: '导出 PNG', action: () => exportPng() },
   { icon: '🕰️', label: '历史版本', action: () => toggleHistory() },
  { icon: '💾', label: '使用教程', action: () => openInfo('tutorial') },
  { icon: '📑', label: '常用快捷键', action: () => openInfo('shortcuts') },
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


      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <ul class="sidebar-list">
          <li v-for="item in menuItems" :key="item.label" @click="item.action">
            <span>{{ item.icon }}</span> {{ item.label }}
          </li>
        </ul>
        <!-- InfoPanel -->
        <InfoPanel
          :type="infoType"
          :open="infoOpen"
          @close="infoOpen = false"
        />
      </aside>


      <!-- 左侧 Markdown 编辑区 -->
      <div class="left" v-if="viewMode === 'markdown' || viewMode === 'split'" :class="{ full: viewMode === 'markdown' }">
        <div class="card">
          <div class="part-title">Markdown 编辑区</div>
          <div class="scroll-container part-textarea">
            <MarkdownEditor v-model="markdownInput" />
          </div>
        </div>
      </div>

      <!-- 右侧 HTML 预览区 + 3D 预览 -->
      <div class="right" v-if="viewMode === 'preview' || viewMode === 'split'" :class="{ full: viewMode === 'preview' }">
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
