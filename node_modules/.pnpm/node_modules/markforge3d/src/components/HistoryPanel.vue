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
    <button @click="emit('close')" class="history-panel-close">X</button>
  </div>
</template>

<style scoped>
.history-panel {
  position: fixed;
  top: 106px;
  left: 0;
  width: 380px;
  min-height: 380px ;
  font-size: larger;
  z-index: 3000;
  background: var(--bg-color);
  border: 1px solid #ddd;
  padding: 1rem;
}
.history-panel li button{
    font-size: 25px;
}
.history-panel-close {
  position: absolute;
  right: 20px;
  top: 20px;
  background:none;
  border: none;
  color: var(--color);
  font-size: 27px;
}
</style>
