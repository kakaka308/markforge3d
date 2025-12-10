<script setup>
import { inject } from 'vue'

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
      <button class="icon-btn menu-btn" @click="toggleSidebar" title="菜单">
        ☰
      </button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button class="icon-btn font-bold" @click="insertMarkdown('**粗体**', 2, 2)" title="粗体 (Ctrl+B)">B</button>
      <button class="icon-btn font-italic" @click="insertMarkdown('*斜体*', 1, 2)" title="斜体 (Ctrl+I)">I</button>
      <button class="icon-btn strike" @click="insertMarkdown('~~删除线~~', 2, 3)" title="删除线">S</button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button class="icon-btn" @click="insertMarkdown('# ', 2)" title="一级标题">H1</button>
      <button class="icon-btn" @click="insertMarkdown('## ', 3)" title="二级标题">H2</button>
      <button class="icon-btn" @click="insertMarkdown('### ', 4)" title="三级标题">H3</button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button class="icon-btn" @click="insertMarkdown('- 列表项', 2)" title="无序列表">•</button>
      <button class="icon-btn" @click="insertMarkdown('1. 列表项', 3)" title="有序列表">1.</button>
      <button class="icon-btn" @click="insertMarkdown('- [ ] 待办项', 6)" title="任务列表">☑</button>
      <button class="icon-btn" @click="insertMarkdown('> 引用内容', 2)" title="引用">❝</button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button class="icon-btn" @click="insertMarkdown('[链接描述](http://)', 1, 4)" title="链接">🔗</button>
      <button class="icon-btn" @click="insertMarkdown('![图片描述](http://)', 2, 4)" title="图片">🖼️</button>
      <button class="icon-btn" @click="insertMarkdown('\n```\n代码块\n```\n', 4, 3)" title="代码块">&lt;/&gt;</button>
      <button class="icon-btn" @click="insertMarkdown('\n| 表头1 | 表头2 |\n| --- | --- |\n| 内容1 | 内容2 |\n', 0)" title="表格">📊</button>
      <button class="icon-btn" @click="insertMarkdown('\n---\n', 0)" title="分割线">―</button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button class="icon-btn" @click="insertMarkdown(':::three\n### cube (0x64b5f6, 1)\n:::', 0)" title="插入立方体">🧊</button>
      <button class="icon-btn" @click="insertMarkdown(':::three\n### sphere (red, 1)\n:::', 0)" title="插入球体">⚪</button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group ml-auto">
      <button class="icon-btn text-btn" :class="{ active: viewMode === 'markdown' }" @click="toggleMarkdownMode" title="仅编辑">编辑</button>
      <button class="icon-btn text-btn" :class="{ active: viewMode === 'preview' }" @click="togglePreviewMode" title="仅预览">预览</button>
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
  gap: 8px; /* 稍微减小间距以容纳更多按钮 */
  flex-shrink: 0;
  overflow-x: auto; /* 允许横向滚动，防止屏幕窄时溢出 */
}

/* 隐藏滚动条但保留功能 */
.toolbar::-webkit-scrollbar {
  height: 0;
  width: 0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ml-auto { margin-left: auto; }

.divider {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 6px;
  flex-shrink: 0;
}

.icon-btn {
  height: 30px;
  min-width: 30px;
  padding: 0 6px;
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
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

/* 特殊样式微调 */
.font-bold { font-weight: 800; font-family: serif; }
.font-italic { font-style: italic; font-family: serif; font-weight: 700; }
.strike { text-decoration: line-through; }

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--color-accent);
}

.icon-btn.active {
  background: var(--bg-hover);
  color: var(--color-accent);
  font-weight: bold;
}

.text-btn {
  width: auto;
  padding: 0 10px;
  font-size: 13px;
}

.menu-btn {
  font-size: 18px;
}
</style>