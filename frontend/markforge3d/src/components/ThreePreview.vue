<script setup>
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
/* 修复：原来 min-width:900px 且无居中设置，导致 canvas 靠右偏移 */
.canvas-box {
  width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  margin: 1em 0;
}

.three-canvas {
  width: 80%;
  max-width: 800px;
  height: 400px;
  background: #ffffff;
  border: 1px solid #777;
  box-sizing: border-box;
  display: block;
}
</style>