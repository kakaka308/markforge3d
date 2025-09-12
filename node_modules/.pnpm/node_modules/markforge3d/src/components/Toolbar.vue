<script setup>
import { inject } from 'vue'

// 注入 composables
const insertMarkdown = inject('insertMarkdown')
const toggleMarkdownMode = inject('toggleMarkdownMode')
const togglePreviewMode = inject('togglePreviewMode')
const viewMode = inject('viewMode')
const toggleSidebar = inject('toggleSidebar') // 🔥 注入侧边栏切换
</script>

<template>
  <div class="toolbar">
    <!-- 🔥 菜单按钮 -->
    <button class="menu-btn" @click="toggleSidebar">☰</button>

    <!-- Markdown 基础语法 -->
    <div class="tooltip">
      <button @click="insertMarkdown('**粗体**', 2, 2)"><b>B</b></button>
      <span class="tooltiptext">粗体 (Ctrl+B)</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('*斜体*', 1, 2)"><i>I</i></button>
      <span class="tooltiptext">斜体 (Ctrl+I)</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('# 标题1', 2)">H1</button>
      <span class="tooltiptext">标题</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('```js\n// 代码\n```', 6, 6)">{'{ }'}</button>
      <span class="tooltiptext">代码块</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('[描述](http://)', 1, 2)">🔗</button>
      <span class="tooltiptext">链接</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('![描述](http://)', 2, 2)">🖼️</button>
      <span class="tooltiptext">图片</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('> 引用内容', 2)">❝</button>
      <span class="tooltiptext">引用</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('- 列表项', 2)">•</button>
      <span class="tooltiptext">无序列表</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('1. 列表项', 3)">1.</button>
      <span class="tooltiptext">有序列表</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('\n---\n', 0)">―</button>
      <span class="tooltiptext">分割线</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('| 列1 | 列2 |\n| --- | --- |\n| 数据1 | 数据2 |', 0)">📊</button>
      <span class="tooltiptext">表格</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('- [ ] 待办项', 6)">☑️</button>
      <span class="tooltiptext">任务清单</span>
    </div>

    <!-- 3D 扩展 -->
    <div class="tooltip">
      <button @click="insertMarkdown('### cube (blue, 1.5)', 0)">🟦</button>
      <span class="tooltiptext">插入立方体</span>
    </div>

    <div class="tooltip">
      <button @click="insertMarkdown('### sphere (red, 1)', 0)">⚪</button>
      <span class="tooltiptext">插入球体</span>
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

    <!-- 🌗 主题切换 -->
    <div class="tooltip">
      <input type="checkbox" id="switch" class="input--switch" />
      <span class="tooltiptext">切换主题</span>
    </div>
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

    input.input--switch {
      cursor: pointer;
      transform: scale(1.2);
    }

    .tooltiptext {
      height: 30px;
      visibility: hidden;
      opacity: 0;
      padding: 4px 8px;
      border-radius: 4px;
      position: absolute;
      z-index: 1;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      transition: opacity 0.2s ease;
    }

    &:hover .tooltiptext {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>
