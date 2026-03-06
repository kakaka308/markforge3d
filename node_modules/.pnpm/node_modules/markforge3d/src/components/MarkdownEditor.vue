<script setup>
const modelValue = defineModel()
</script>

<template>
  <div class="editor">
    <textarea v-model="modelValue" placeholder="在此输入 Markdown..."></textarea>
  </div>
</template>

<style scoped>
.editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
textarea {
  flex: 1;
  padding: 1rem;
  border: none;
  resize: none;
  font-family: monospace;
  height: 100%;
}
</style>