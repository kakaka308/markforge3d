<script setup>
import { onMounted, ref, watch } from 'vue'
import { useThreeRenderer } from '../composables/useThreeRenderer'

const props = defineProps({
  objects: Array // 接收 3D 对象数据
})

const canvasRef = ref(null)
let rendererInstance = null

onMounted(() => {
  // 传入 props.objects
  rendererInstance = useThreeRenderer(canvasRef.value, props.objects)
})

// 如果 objects 数据发生变化，重新渲染
watch(() => props.objects, (newObjects) => {
  if (rendererInstance) {
    rendererInstance.updateScene(newObjects) // 假设 useThreeRenderer 有一个 updateScene 方法
  }
}, { deep: true })
</script>

<template>
  <div class="canvas-box">
    <canvas ref="canvasRef" class="three-canvas"></canvas>
  </div>
</template>

<style scoped>
/* 保持原样或调整样式 */
.canvas-box {
  justify-self: center;
  min-width: 900px; /* 或者你希望的任意宽度 */
}

.three-canvas {
  width: 80%;
  height: 400px;
  background: #111;
  border: 1px solid rgb(71, 66, 66);
}
</style>