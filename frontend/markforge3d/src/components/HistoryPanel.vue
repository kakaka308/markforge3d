<script setup>
defineProps({
  historyList: Array,
  showHistory: Boolean
})
const emit = defineEmits(['rollback', 'close'])
</script>

<template>
  <div v-if="showHistory" class="history-panel">
    <h3>历史版本</h3>
    <ul>
      <li v-for="(item, idx) in historyList" :key="idx">
        <button @click="emit('rollback', item)">
          {{ item.timestamp }}
        </button>
      </li>
    </ul>
    <button @click="emit('close')">关闭</button>
  </div>
</template>

<style scoped>
.history-panel {
  position: absolute;
  right: 1rem;
  top: 3rem;
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
}
</style>
