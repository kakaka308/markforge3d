<script setup>
import { inject } from 'vue'

// 注入依赖 (保持不变)
const insertMarkdown = inject('insertMarkdown')
const toggleMarkdownMode = inject('toggleMarkdownMode')
const togglePreviewMode = inject('togglePreviewMode')
const viewMode = inject('viewMode')
const toggleSidebar = inject('toggleSidebar')
const toggleTheme = inject('toggleTheme')
const isDark = inject('isDark')
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="icon-btn menu-btn" @click="toggleSidebar" title="切换侧边栏">
        <span class="icon">☰</span>
      </button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button class="icon-btn" @click="insertMarkdown('**粗体**', 2, 2)" title="粗体 (Ctrl+B)"><b>B</b></button>
      <button class="icon-btn" @click="insertMarkdown('*斜体*', 1, 2)" title="斜体 (Ctrl+I)"><i>I</i></button>
      <button class="icon-btn" @click="insertMarkdown('# ', 2)" title="标题">H1</button>
      <button class="icon-btn" @click="insertMarkdown('```\n\n```', 4, 0)" title="代码块">&lt;/&gt;</button>
      <button class="icon-btn" @click="insertMarkdown(':::three\n### cube (0x64b5f6, 1)\n:::', 0)" title="插入3D方块">🧊</button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group ml-auto">
      <button class="icon-btn" :class="{ active: viewMode === 'markdown' }" @click="toggleMarkdownMode">编辑</button>
      <button class="icon-btn" :class="{ active: viewMode === 'preview' }" @click="togglePreviewMode">预览</button>
      <button class="icon-btn theme-btn" @click="toggleTheme" title="切换主题">
        {{ isDark ? '🌙' : '🌞' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  height: var(--toolbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 10px;
  flex-shrink: 0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ml-auto { margin-left: auto; }

.divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 8px;
}

.icon-btn {
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  font-weight: 500;
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--color-accent);
}

.icon-btn.active {
  background: var(--bg-hover);
  color: var(--color-accent);
  font-weight: bold;
}

.menu-btn {
  font-size: 18px;
}
</style>