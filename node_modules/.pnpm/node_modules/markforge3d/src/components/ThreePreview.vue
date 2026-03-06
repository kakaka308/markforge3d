<script setup>
// 修复4：组件卸载时调用 renderer.dispose() 释放 WebGL Context，
//        防止浏览器 Context 数量超限（通常 8-16 个）导致渲染失败。
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useThreeRenderer } from '../composables/useThreeRenderer'

const props = defineProps({
  objects: Array
})

const canvasRef = ref(null)
let rendererInstance = null

onMounted(() => {
  rendererInstance = useThreeRenderer(canvasRef.value, props.objects ?? [])
})

watch(
  () => props.objects,
  (newObjects) => {
    if (rendererInstance) {
      rendererInstance.updateScene(newObjects ?? [])
    }
  },
  { deep: true }
)

// 修复4：卸载时销毁 Three.js renderer，释放 GPU 资源和 WebGL Context
onBeforeUnmount(() => {
  rendererInstance?.dispose()
  rendererInstance = null
})
</script>

<template>
  <div class="canvas-box">
    <canvas ref="canvasRef" class="three-canvas"></canvas>
  </div>
</template>

<style scoped>
.canvas-box {
  justify-self: center;
  min-width: 900px;
}

.three-canvas {
  width: 80%;
  height: 400px;
  background: #ffffff;
  border: 1px solid #777;
  box-sizing: border-box;
}

:global(.force-light) .three-canvas {
  background-color: #ffffff !important;
  border-color: #777 !important;
}
</style>