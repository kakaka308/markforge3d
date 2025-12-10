<script setup>
import { onMounted, ref, watch } from 'vue'
import ThreeForceGraph from 'three-forcegraph'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'

const props = defineProps({
  docs: Array,
  isOpen: Boolean
})
const emit = defineEmits(['close', 'node-click'])

const container = ref(null)
const graphInstance = ref(null)

// 提取数据构建图谱
const buildGraphData = () => {
  const nodes = []
  const links = []
  const nodeMap = new Map()

  props.docs.forEach(doc => {
    const lines = doc.content.split('\n')
    let currentH1 = null
    
    // 添加文档节点（以 ID 或标题）
    const docNodeId = `doc-${doc.id}`
    // 如果没有 H1，就用文档标题作为根节点
    if (!nodeMap.has(docNodeId)) {
        nodes.push({ id: docNodeId, name: doc.title, val: 20, color: '#ff6b6b', type: 'doc' })
        nodeMap.set(docNodeId, true)
    }
    currentH1 = docNodeId

    lines.forEach(line => {
      const h1Match = line.match(/^#\s+(.*)/)
      const h2Match = line.match(/^##\s+(.*)/)

      if (h1Match) {
        const name = h1Match[1]
        // H1 实际上通常等于文档标题，这里做个去重或者层级处理
        // 简单起见，我们把 H1 视为文档下的子节点
        if (!nodeMap.has(name)) {
          nodes.push({ id: name, name, val: 10, color: '#4ecdc4', type: 'h1' })
          nodeMap.set(name, true)
        }
        links.push({ source: currentH1, target: name }) // 文档 -> H1
      } else if (h2Match) {
        const name = h2Match[1]
        if (!nodeMap.has(name)) {
          nodes.push({ id: name, name, val: 5, color: '#ffe66d', type: 'h2' })
          nodeMap.set(name, true)
        }
        // 链接到最近的 H1 或 文档根
        links.push({ source: currentH1, target: name })
      }
    })
  })

  return { nodes, links }
}

const initGraph = () => {
  if (!container.value) return

  // 清理
  while (container.value.firstChild) {
    container.value.removeChild(container.value.firstChild)
  }

  const gData = buildGraphData()
  
  const Graph = new ThreeForceGraph()
    .graphData(gData)
    .nodeAutoColorBy('group')
    .nodeThreeObject(node => {
      const sprite = new SpriteText(node.name)
      sprite.color = node.color
      sprite.textHeight = 8 // 字体大小
      return sprite
    })
    .linkWidth(2)
    .linkColor(() => '#cccccc')

  // Three.js 场景设置
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0d1b2a) // 深色背景适合图谱
  scene.add(Graph)

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 300

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  container.value.appendChild(renderer.domElement)

  // 简单的 OrbitControls 模拟 (实际上 ThreeForceGraph 自带交互，这里需要配合 OrbitControls 使用更好，但为简化直接用 Graph 提供的交互)
  // ThreeForceGraph 只是一个 Object3D，需要外部的渲染循环和控制器
  // 为了简便，我们使用简化的渲染循环，如果需要拖拽，通常需要 OrbitControls
  
  // 引入 OrbitControls (需要从 three/examples/jsm... 引入，但在 Vite 中可以直接 import)
  import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement)
      
      const animate = () => {
        if (!props.isOpen) return
        Graph.tickFrame()
        controls.update()
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }
      animate()
  })
}

watch(() => props.isOpen, (val) => {
  if (val) {
    setTimeout(initGraph, 100) // 等待 DOM
  }
})
</script>

<template>
  <div v-if="isOpen" class="graph-modal">
    <button class="close-btn" @click="emit('close')">✖ 关闭图谱</button>
    <div ref="container" class="graph-container"></div>
    <div class="legend">
      <span style="color:#ff6b6b">● 文档</span>
      <span style="color:#4ecdc4">● 一级标题</span>
      <span style="color:#ffe66d">● 二级标题</span>
    </div>
  </div>
</template>

<style scoped>
.graph-modal {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 5000;
  background: black;
}
.graph-container { width: 100%; height: 100%; }
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 5001;
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: black;
  font-weight: bold;
}
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  display: flex;
  gap: 15px;
  z-index: 5001;
  background: rgba(0,0,0,0.5);
  padding: 10px;
  border-radius: 8px;
}
</style>