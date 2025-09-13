<script setup>
import { onMounted, watch, nextTick, h, createApp } from 'vue'
import ThreePreview from './ThreePreview.vue'

const props = defineProps({
  renderedHtml: String
})

// 使用 watch 监听 renderedHtml 的变化，确保每次更新都重新挂载 3D 组件
watch(() => props.renderedHtml, (newHtml) => {
  nextTick(mountThreePreviews)
})

onMounted(() => {
  nextTick(mountThreePreviews)
})

function mountThreePreviews() {
  // 清理旧的挂载实例，避免重复渲染
  const oldPreviews = document.querySelectorAll('.three-preview')
  oldPreviews.forEach(container => {
    // 移除所有子节点
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  })

  // 找到所有三维占位容器
  const containers = document.querySelectorAll('.three-preview')
  containers.forEach(container => {
    const dataObjects = JSON.parse(container.dataset.objects)
    
    // 创建一个 div 挂载 ThreePreview
    const appDiv = document.createElement('div')
    container.appendChild(appDiv)

    // 创建 Vue 虚拟节点，并传入数据
    const vnode = h(ThreePreview, {
      objects: dataObjects // 将数据作为 prop 传递
    })
    createApp(vnode).mount(appDiv)
  })
}



</script>

<template>
  <div class="preview-pane" v-html="renderedHtml"></div>
</template>

<style scoped>
.preview-pane {
  /* 确保这个容器可以滚动 */
  /* 如果不需要全屏高度，可以移除 */
  height: 100vh;
}
/* 添加一个样式让 3D 卡片看起来像卡片 */
.three-preview {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>