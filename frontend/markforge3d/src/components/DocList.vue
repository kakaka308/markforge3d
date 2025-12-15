<script setup>
defineProps({
  docs: Array
})
const emit = defineEmits(['load', 'delete'])
</script>

<template>
  <div class="doc-list">
    <div class="list-header">
      <h3>📂 我的文档</h3>
    </div>
    
    <div v-if="docs.length === 0" class="empty-state">
      <span>暂无保存的文档</span>
    </div>

    <ul v-else class="list-content">
      <li v-for="doc in docs" :key="doc.id" class="doc-item" @click="emit('load', doc)">
        <div class="doc-main">
          <span class="doc-title">{{ doc.title || '未命名文档' }}</span>
          <span class="doc-date">{{ doc.createdAt.split(' ')[0] }}</span>
        </div>
        <button class="delete-btn" @click.stop="emit('delete', doc.id)" title="删除文档">
          ×
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.doc-list {
  padding: 15px;
  border-top: 1px solid var(--border-color);
}

.list-header h3 {
  font-size: 17px;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 17px;
  padding: 20px 0;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.doc-item:hover {
  background: var(--bg-hover);
  border-color: var(--text-secondary);
  transform: translateY(-1px);
}

.doc-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.doc-title {
  font-weight: 500;
  font-size: 16px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-date {
  font-size: 16px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.delete-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: var(--bg-app);
  color: var(--color-danger);
}
</style>