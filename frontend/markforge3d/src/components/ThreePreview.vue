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
.canvas-box {
  justify-self: center;
  min-width: 900px; /* 或者你希望的任意宽度 */
}

.three-canvas {
  width: 80%; /* 根据你的实际需求调整 */
  height: 400px;
  background: #ffffff; /* ⭐ 确保这里是白色背景 */
  border: 1px solid #777; /* ⭐ 添加你想要的边框样式 */
  box-sizing: border-box; /* ⭐ 确保边框不会增加额外尺寸 */
}

/* 强制亮色模式下的 Three.js canvas 样式（可选，如果全局样式覆盖，可能需要） */
:global(.force-light) .three-canvas {
    background-color: #ffffff !important;
    border-color: #777 !important;
}
</style>