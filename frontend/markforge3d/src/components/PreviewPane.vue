<script setup>
// 修复3：引入 DOMPurify 对渲染后的 HTML 做净化，防止 XSS 攻击。
//        需要安装依赖：pnpm add dompurify
// 修复4：维护 Vue 实例列表，重新挂载前先 unmount() 旧实例，
//        防止每次 Markdown 变化都累积不销毁的 Vue 实例导致内存泄漏。
import { onMounted, onBeforeUnmount, watch, nextTick, computed, h, createApp } from 'vue'
import DOMPurify from 'dompurify'
import ThreePreview from './ThreePreview.vue'

const props = defineProps({
  renderedHtml: String
})

// 修复3：配置 DOMPurify，允许合法的 HTML 标签和属性，同时阻止 XSS
const SAFE_HTML = computed(() => {
  return DOMPurify.sanitize(props.renderedHtml || '', {
    ADD_TAGS: ['iframe', 'math', 'annotation', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msqrt', 'mtext', 'mspace', 'mover', 'munder', 'munderover', 'mtable', 'mtr', 'mtd'],
    ADD_ATTR: ['data-objects', 'data-link-text', 'data-url', 'target', 'rel', 'allowfullscreen'],
    FORCE_BODY: false
  })
})

// 修复4：记录所有已挂载的 Vue 实例，卸载时统一清理
const mountedApps = []

watch(() => props.renderedHtml, () => {
  nextTick(mountThreePreviews)
})

onMounted(() => {
  nextTick(mountThreePreviews)
})

// 修复4：组件卸载时销毁所有子 Vue 实例
onBeforeUnmount(() => {
  cleanupApps()
})

function cleanupApps() {
  mountedApps.forEach(app => {
    try { app.unmount() } catch (e) { /* ignore */ }
  })
  mountedApps.length = 0
}

function mountThreePreviews() {
  // 修复4：先销毁所有旧实例，再重新挂载
  cleanupApps()

  const containers = document.querySelectorAll('.three-preview')
  containers.forEach(container => {
    // 清空容器内容
    container.innerHTML = ''

    let dataObjects = []
    try {
      dataObjects = JSON.parse(container.dataset.objects || '[]')
    } catch (e) {
      console.error('three-preview data-objects 解析失败:', e)
    }

    const mountDiv = document.createElement('div')
    container.appendChild(mountDiv)

    const app = createApp(h(ThreePreview, { objects: dataObjects }))
    app.mount(mountDiv)
    mountedApps.push(app)
  })
}
</script>

<template>
  <!-- 修复3：使用净化后的 SAFE_HTML 而非原始 renderedHtml -->
  <div class="preview-pane" v-html="SAFE_HTML"></div>
</template>

<style scoped>
.preview-pane {
  height: 100vh;
}
</style>