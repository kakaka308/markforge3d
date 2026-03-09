<script setup>
// 修复：标题节点 id 从纯文字改为 `${docNodeId}-h1-${lineIdx}-${name}` 复合格式，
// 避免不同文档有同名标题时节点被合并，图谱关系错乱。
import { onBeforeUnmount, ref, watch } from 'vue'
import ThreeForceGraph from 'three-forcegraph'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'

const props = defineProps({
  docs:   Array,
  isOpen: Boolean
})
const emit = defineEmits(['close', 'node-click'])

const container = ref(null)

let currentRenderer    = null
let currentAnimFrameId = null
let resizeHandler      = null

const NODE_COLORS = {
  doc: '#ff4757',
  h1:  '#2ed573',
  h2:  '#1e90ff'
}

const buildGraphData = () => {
  const nodes   = []
  const links   = []
  const nodeMap = new Map()

  props.docs.forEach(doc => {
    const lines     = doc.content.split('\n')
    const docNodeId = `doc-${doc.id}`
    let latestH1Id  = null

    if (!nodeMap.has(docNodeId)) {
      nodes.push({ id: docNodeId, name: doc.title, val: 35, group: 'doc', color: NODE_COLORS.doc })
      nodeMap.set(docNodeId, true)
    }

    lines.forEach((line, lineIdx) => {
      const h1Match = line.match(/^#\s+(.*)/)
      const h2Match = line.match(/^##\s+(.*)/)

      if (h1Match) {
        const name   = h1Match[1].trim()
        // 修复：复合 id = docNodeId + 行号 + 标题文字，全局唯一
        const nodeId = `${docNodeId}-h1-${lineIdx}-${name}`
        if (!nodeMap.has(nodeId)) {
          nodes.push({ id: nodeId, name, val: 15, group: 'h1', color: NODE_COLORS.h1 })
          nodeMap.set(nodeId, true)
        }
        links.push({ source: docNodeId, target: nodeId })
        latestH1Id = nodeId

      } else if (h2Match) {
        const name   = h2Match[1].trim()
        const nodeId = `${docNodeId}-h2-${lineIdx}-${name}`
        if (!nodeMap.has(nodeId)) {
          nodes.push({ id: nodeId, name, val: 8, group: 'h2', color: NODE_COLORS.h2 })
          nodeMap.set(nodeId, true)
        }
        links.push({ source: latestH1Id ?? docNodeId, target: nodeId })
      }
    })
  })

  return { nodes, links }
}

const cleanupGraph = () => {
  if (currentAnimFrameId) { cancelAnimationFrame(currentAnimFrameId); currentAnimFrameId = null }
  if (resizeHandler)      { window.removeEventListener('resize', resizeHandler); resizeHandler = null }
  if (currentRenderer)    { currentRenderer.dispose(); currentRenderer = null }
}

const initGraph = () => {
  if (!container.value) return
  cleanupGraph()
  while (container.value.firstChild) container.value.removeChild(container.value.firstChild)

  const Graph = new ThreeForceGraph()
    .graphData(buildGraphData())
    .nodeThreeObject(node => {
      const group  = new THREE.Group()
      const radius = node.val ? Math.sqrt(node.val) : 3
      const geo    = new THREE.SphereGeometry(radius, 32, 32)
      const mat    = new THREE.MeshLambertMaterial({ color: node.color, transparent: true, opacity: 0.95 })
      group.add(new THREE.Mesh(geo, mat))

      const sprite = new SpriteText(node.name)
      sprite.color = '#ffffff'; sprite.textHeight = 3.5
      sprite.backgroundColor = 'rgba(0,0,0,0.6)'
      sprite.borderColor = node.color; sprite.borderWidth = 1
      sprite.borderRadius = 6; sprite.padding = [6, 3]
      sprite.position.y = radius + 5
      group.add(sprite)
      return group
    })
    .linkColor(() => '#ffffff').linkOpacity(0.4).linkWidth(0.8)
    .linkDirectionalParticles(1).linkDirectionalParticleWidth(0.78)
    .linkDirectionalParticleColor(() => '#1166b4').linkDirectionalParticleSpeed(0.03)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)
  scene.add(Graph)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dl = new THREE.DirectionalLight(0xffffff, 1); dl.position.set(50,50,50); scene.add(dl)
  const bl = new THREE.DirectionalLight(0xffffff, 0.5); bl.position.set(-50,-50,-50); scene.add(bl)

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 250

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)
  currentRenderer = renderer

  import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.dampingFactor = 0.05
    const animate = () => {
      if (!props.isOpen) return
      currentAnimFrameId = requestAnimationFrame(animate)
      Graph.tickFrame(); controls.update(); renderer.render(scene, camera)
    }
    currentAnimFrameId = requestAnimationFrame(animate)
  })

  resizeHandler = () => {
    if (!container.value) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', resizeHandler)
}

watch(() => props.isOpen, val => {
  if (val) { setTimeout(initGraph, 100) }
  else { if (currentAnimFrameId) { cancelAnimationFrame(currentAnimFrameId); currentAnimFrameId = null } }
})

onBeforeUnmount(cleanupGraph)
</script>

<template>
  <div v-if="isOpen" class="graph-modal">
    <button class="close-btn" @click="emit('close')">✖ 关闭图谱</button>
    <div ref="container" class="graph-container"></div>
    <div class="legend-panel">
      <div class="legend-title">节点类型</div>
      <div class="legend-item"><span class="dot" :style="{ background: NODE_COLORS.doc }"></span><span>文档</span></div>
      <div class="legend-item"><span class="dot" :style="{ background: NODE_COLORS.h1  }"></span><span>一级标题</span></div>
      <div class="legend-item"><span class="dot" :style="{ background: NODE_COLORS.h2  }"></span><span>二级标题</span></div>
      <div class="legend-divider"></div>
      <div class="legend-help">🖱️ 拖拽旋转 / 📦 滚轮缩放</div>
    </div>
  </div>
</template>

<style scoped>
.graph-modal { position:fixed; inset:0; z-index:5000; background:#0a0a0a; }
.graph-container { width:100%; height:100%; }
.close-btn {
  position:absolute; top:30px; right:30px; z-index:5001;
  padding:10px 20px; background:rgba(255,255,255,0.1);
  border:1px solid rgba(255,255,255,0.2); border-radius:8px;
  cursor:pointer; color:white; font-weight:600;
  backdrop-filter:blur(10px); transition:all 0.2s;
}
.close-btn:hover { background:rgba(255,255,255,0.25); transform:scale(1.05); }
.legend-panel {
  position:absolute; bottom:30px; left:30px; z-index:5001;
  background:rgba(20,20,20,0.85); backdrop-filter:blur(12px);
  padding:20px; border-radius:12px;
  border:1px solid rgba(255,255,255,0.1); color:#fff;
  min-width:200px; box-shadow:0 8px 32px rgba(0,0,0,0.3);
}
.legend-title { font-size:14px; font-weight:700; color:rgba(255,255,255,0.5); text-transform:uppercase; margin-bottom:12px; letter-spacing:1px; }
.legend-item  { display:flex; align-items:center; margin-bottom:10px; font-size:15px; font-weight:500; }
.dot { width:12px; height:12px; border-radius:50%; margin-right:12px; box-shadow:0 0 8px rgba(255,255,255,0.4); }
.legend-divider { height:1px; background:rgba(255,255,255,0.1); margin:15px 0; }
.legend-help { font-size:13px; color:rgba(255,255,255,0.6); text-align:center; }
</style>