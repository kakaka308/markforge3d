<script setup>
import { inject } from 'vue'

const insertMarkdown = inject('insertMarkdown')
const toggleMarkdownMode = inject('toggleMarkdownMode')
const togglePreviewMode = inject('togglePreviewMode')
const viewMode = inject('viewMode')
const toggleSidebar = inject('toggleSidebar')  // 🔥 注入侧边栏切换
</script>

<template>
  <div class="toolbar">
    <!-- 🔥 菜单按钮放最左边 -->
    <button class="menu-btn" @click="toggleSidebar">☰</button>

    <!-- Markdown 工具按钮 -->
    <div class="tooltip">
      <button @click="insertMarkdown('**粗体**', 2, 2)"><b>B</b></button>
      <span class="tooltiptext">粗体 (Ctrl+B)</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('*斜体*', 1, 2)"><i>I</i></button>
      <span class="tooltiptext">斜体</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('# 标题1', 2)">H1</button>
      <span class="tooltiptext">标题</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('```js\n// 代码\n```', 6, 6)">{'{ }'}</button>
      <span class="tooltiptext">代码块</span>
    </div>

    <!-- 视图切换 -->
    <div class="tooltip">
      <button @click="toggleMarkdownMode">
        {{ viewMode === 'markdown' ? '双栏' : 'Markdown' }}
      </button>
      <span class="tooltiptext">切换编辑模式</span>
    </div>

    <div class="tooltip">
      <button @click="togglePreviewMode">
        {{ viewMode === 'preview' ? '双栏' : '预览' }}
      </button>
      <span class="tooltiptext">切换预览模式</span>
    </div>

    <!-- 🌗 主题切换开关 -->
    <input type="checkbox" id="switch" class="input--switch" />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--bg-toolbar);
  border-bottom: 1px solid #ddd;

  .menu-btn {
    font-size: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0 8px;
  }

  .tooltip {
    position: relative;
    display: inline-block;
    button {
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover { background: #f0f0f0; }
    }
    .tooltiptext {
      visibility: hidden;
      opacity: 0;
      padding: 4px 8px;
      border-radius: 4px;
      position: absolute;
      z-index: 1;
      bottom: -35px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 17px;
      transition: opacity 0.2s ease;
    }
    &:hover .tooltiptext {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>
