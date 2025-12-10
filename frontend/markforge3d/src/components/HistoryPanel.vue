<script setup>
defineProps({
  historyList: Array
})
const emit = defineEmits(['rollback', 'back'])

// 辅助函数：截取内容预览
const getPreview = (content) => {
  if (!content) return '空内容'
  // 去除 markdown 符号，只保留前 30 个字符
  return content.replace(/[#*`>]/g, '').trim().slice(0, 30) + '...'
}

// 辅助函数：格式化时间
const formatTime = (timestamp) => {
  return timestamp.split(' ')[1] || timestamp // 假设 timestamp 格式为 "日期 时间"，只显示时间会更简洁
}
</script>

<template>
  <div class="history-panel">
    <div class="panel-header">
      <button class="back-btn" @click="emit('back')" title="返回主菜单">
        ←
      </button>
      <h3>🕰️ 历史版本</h3>
    </div>

    <div v-if="historyList.length === 0" class="empty-state">
      <span>暂无历史记录</span>
    </div>

    <ul v-else class="list-content">
      <li 
        v-for="(item, idx) in [...historyList].reverse()" 
        :key="idx" 
        class="history-item"
        @click="emit('rollback', item)"
      >
        <div class="item-main">
          <span class="item-time">{{ item.timestamp }}</span>
          <span class="item-preview">{{ getPreview(item.content) }}</span>
        </div>
        <button class="restore-btn" title="回滚到此版本">
          ↺
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-sidebar);
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
  gap: 10px;
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.back-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.back-btn:hover {
  background: var(--bg-hover);
  color: var(--color-accent);
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 40px 0;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: var(--bg-hover);
  border-color: var(--text-secondary);
  transform: translateX(2px);
}

.item-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.item-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.item-preview {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.restore-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-app);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.restore-btn:hover {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}
</style>