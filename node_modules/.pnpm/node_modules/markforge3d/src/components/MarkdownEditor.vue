<script setup>
const modelValue = defineModel()
</script>

<template>
  <div class="editor">
    <textarea v-model="modelValue"></textarea>
  </div>
</template>

<style scoped>
.editor {
  flex: 1;
  display: flex;
}
textarea {
  flex: 1;
  padding: 1rem;
  border: none;
  resize: none;
  font-family: monospace;
}
</style>
