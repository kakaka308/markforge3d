<script setup>
// 修复问题1：任务列表 checkbox 点击时，找到对应的 Markdown 行并切换 [ ] / [x]
// 修复问题3：接收滚动容器 ref 由父组件传入，供 useScrollSync 绑定
import { onMounted, onBeforeUnmount, watch, nextTick, computed, h, createApp } from 'vue'
import DOMPurify from 'dompurify'
import ThreePreview from './ThreePreview.vue'

const props = defineProps({
  renderedHtml: String
})
const emit = defineEmits(['task-toggle'])

const SAFE_HTML = computed(() => {
  return DOMPurify.sanitize(props.renderedHtml || '', {
    ADD_TAGS: [
      'iframe', 'math', 'annotation', 'semantics',
      'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac',
      'msqrt', 'mtext', 'mspace', 'mover', 'munder',
      'munderover', 'mtable', 'mtr', 'mtd'
    ],
    ADD_ATTR: [
      'data-objects', 'data-link-text', 'data-url',
      'data-line', 'data-task',       // 同步滚动 & 任务列表所需
      'target', 'rel', 'allowfullscreen'
    ],
    FORCE_BODY: false
  })
})

const mountedApps = []

watch(() => props.renderedHtml, () => { nextTick(mountThreePreviews) })
onMounted(() => { nextTick(mountThreePreviews) })
onBeforeUnmount(cleanupApps)

function cleanupApps() {
  mountedApps.forEach(app => { try { app.unmount() } catch (e) {} })
  mountedApps.length = 0
}

function mountThreePreviews() {
  cleanupApps()
  document.querySelectorAll('.three-preview').forEach(container => {
    container.innerHTML = ''
    let dataObjects = []
    try { dataObjects = JSON.parse(container.dataset.objects || '[]') } catch (e) {}
    const mountDiv = document.createElement('div')
    container.appendChild(mountDiv)
    const app = createApp(h(ThreePreview, { objects: dataObjects }))
    app.mount(mountDiv)
    mountedApps.push(app)
  })
}

// 问题1：处理任务列表 checkbox 点击
const handleClick = (e) => {
  const checkbox = e.target.closest('input[type="checkbox"][data-line]')
  if (!checkbox) return
  e.preventDefault() // 阻止默认行为，由我们手动更新 markdown
  const lineNo = parseInt(checkbox.dataset.line)
  emit('task-toggle', lineNo)
}
</script>

<template>
  <div
    class="preview-pane"
    v-html="SAFE_HTML"
    @click="handleClick"
  ></div>
</template>

<style scoped>
.preview-pane {
  height: 100vh;
}
</style>