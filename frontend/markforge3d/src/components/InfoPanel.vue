<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  type: { type: String, default: 'tutorial' }, // tutorial | shortcuts
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="info-panel" :class="{ open: open }">
    <div class="info-header">
      <h3 v-if="type === 'tutorial'">📖 使用教程</h3>
      <h3 v-else-if="type === 'shortcuts'">⌨ 常用快捷键</h3>
      <button class="close-btn" @click="emit('close')" title="关闭">✖</button>
    </div>

    <div class="info-content">
      <div v-if="type === 'tutorial'" class="tutorial">
        <p class="intro">欢迎使用 <b>MarkForge 3D</b>！这是一个支持 <b>Markdown</b> + <b>3D 语法</b> 的现代化编辑器。</p>
        
        <div class="section">
          <h2>标题语法</h2>
          <div class="demo-box">
            <h1># 一级标题</h1>
            <h2>## 二级标题</h2>
            <h3>### 三级标题</h3>
          </div>
        </div>

        <div class="section">
          <h2>文本样式</h2>
          <ul class="style-list">
            <li>**<b>加粗</b>**</li>
            <li>*<i>斜体</i>*</li>
            <li>~~<del>删除线</del>~~</li>
            <li>> 引用文本</li>
          </ul>
        </div>

        <div class="section">
          <h2>插入 3D 模型</h2>
          <p>使用 <code>:::three</code> 代码块来定义场景：</p>
          <pre>
:::three
### cube (#64b5f6, 1.5)
### sphere (red, 1)
:::
          </pre>
          <p class="note">支持图形：<b>cube</b>, <b>sphere</b>, <b>cone</b>, <b>cylinder</b></p>
        </div>       

        <div class="section">
          <h2>其他功能</h2>
          <p>支持 <b>KaTeX 公式</b> ($E=mc^2$)、<b>代码高亮</b>、<b>表格</b>、<b>任务列表</b> 等标准 Markdown 语法。</p>
        </div>
      </div>

      <div v-else-if="type === 'shortcuts'" class="shortcuts">
        <table class="shortcut-table">
          <thead>
            <tr><th>按键</th><th>功能</th></tr>
          </thead>
          <tbody>
            <tr><td><kbd>Ctrl</kbd> + <kbd>S</kbd></td><td>保存文档</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>H</kbd></td><td>查看历史版本</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>E</kbd></td><td>导出 PDF</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>B</kbd></td><td>粗体</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>I</kbd></td><td>斜体</td></tr>
            <tr><td><kbd>Ctrl</kbd> + <kbd>1~6</kbd></td><td>插入标题</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 面板整体容器：覆盖在 Sidebar 之上 */
.info-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-sidebar);
  z-index: 200; /* 比 sidebar 列表层级高 */
  display: flex;
  flex-direction: column;
  transform: translateX(-100%); /* 默认隐藏在左侧 */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid var(--border-color);
}

.info-panel.open {
  transform: translateX(0); /* 滑入显示 */
}

/* 头部样式 */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
  flex-shrink: 0;
}

.info-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.close-btn:hover {
  background: var(--bg-hover);
  color: var(--color-danger);
}

/* 内容区域滚动 */
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
}

/* --- 教程样式优化 --- */
.tutorial .intro {
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent); /* 使用主题强调色 */
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.demo-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 10px;
  border-radius: 6px;
}
.demo-box h1 { font-size: 1.4em; margin: 5px 0; border:none; }
.demo-box h2 { font-size: 1.2em; margin: 5px 0; border:none; color: var(--text-primary); text-transform: none;}
.demo-box h3 { font-size: 1.1em; margin: 5px 0; }

.style-list {
  padding-left: 0;
}
.style-list li {
  padding: 4px 0;
  border-bottom: 1px dashed var(--border-color);
}

/* 代码块样式适配主题 */
pre {
  background: var(--bg-th);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  color: var(--text-primary);
}

code {
  background: var(--bg-hover);
  color: var(--color-accent);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.note {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

/* --- 快捷键表格样式 --- */
.shortcut-table {
  width: 100%;
  border-collapse: collapse;
}

.shortcut-table th {
  text-align: left;
  padding: 8px;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 12px;
}

.shortcut-table td {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
}

/* 键盘按键样式 */
kbd {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.1);
  color: var(--text-primary);
  display: inline-block;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}
</style>