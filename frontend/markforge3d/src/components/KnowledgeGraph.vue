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

const NODE_COLORS = {
  doc: '#ff4757', // 🔴 文档
  h1: '#2ed573',  // 🟢 一级标题
  h2: '#1e90ff'   // 🔵 二级标题
}

// 提取数据构建图谱
const buildGraphData = () => {
  const nodes = []
  const links = []
  const nodeMap = new Map()

  props.docs.forEach(doc => {
    const lines = doc.content.split('\n')
    let latestH1NodeId = null
    
    const docNodeId = `doc-${doc.id}`
    
    // 添加文档节点
    if (!nodeMap.has(docNodeId)) {
        nodes.push({ 
          id: docNodeId, 
          name: doc.title, 
          val: 35, 
          group: 'doc',
          color: NODE_COLORS.doc 
        })
        nodeMap.set(docNodeId, true)
    }

    lines.forEach(line => {
      const h1Match = line.match(/^#\s+(.*)/)
      const h2Match = line.match(/^##\s+(.*)/)

      if (h1Match) {
        const name = h1Match[1]
        if (!nodeMap.has(name)) {
          nodes.push({ 
            id: name, 
            name, 
            val: 15, 
            group: 'h1',
            color: NODE_COLORS.h1 
          })
          nodeMap.set(name, true)
        }
        // H1 依然连接到文档根节点
        links.push({ source: docNodeId, target: name })
        
        latestH1NodeId = name

      } else if (h2Match) {
        const name = h2Match[1]
        if (!nodeMap.has(name)) {
          nodes.push({ 
            id: name, 
            name, 
            val: 8, 
            group: 'h2',
            color: NODE_COLORS.h2 
          })
          nodeMap.set(name, true)
        }
        // 修改连接逻辑：如果有 H1，连接到 H1；否则连接到文档根节点
        const targetSource = latestH1NodeId ? latestH1NodeId : docNodeId
        links.push({ source: targetSource, target: name })
      }
    })
  })

  return { nodes, links }
}

const initGraph = () => {
  if (!container.value) return

  while (container.value.firstChild) {
    container.value.removeChild(container.value.firstChild)
  }

  const gData = buildGraphData()
  
  const Graph = new ThreeForceGraph()
    .graphData(gData)
    .nodeThreeObject(node => {
      const group = new THREE.Group();
      const radius = node.val ? Math.sqrt(node.val) : 3;

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshLambertMaterial({ 
        color: node.color, 
        transparent: true, 
        opacity: 0.95 
      });
      const sphere = new THREE.Mesh(geometry, material);
      group.add(sphere);

      const sprite = new SpriteText(node.name);
      sprite.color = '#ffffff';
      sprite.textHeight = 3.5; 
      sprite.backgroundColor = 'rgba(0, 0, 0, 0.6)'; 
      sprite.borderColor = node.color; 
      sprite.borderWidth = 1;
      sprite.borderRadius = 6;
      sprite.padding = [6, 3]; 
      sprite.position.y = radius + 5; 
      
      group.add(sprite);
      return group;
    })
    .linkColor(() => '#ffffff')
.linkOpacity(0.4)
.linkWidth(0.8) // 更粗的线
.linkDirectionalParticles(1) // 可选：添加粒子流动效果
.linkDirectionalParticleWidth(0.78)
.linkDirectionalParticleColor(() => '#1166b4')
.linkDirectionalParticleSpeed(0.03)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a) 
  scene.add(Graph)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);
  
  const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
  backLight.position.set(-50, -50, -50);
  scene.add(backLight);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 250

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  container.value.appendChild(renderer.domElement)

  import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true 
      controls.dampingFactor = 0.05
      
      const animate = () => {
        if (!props.isOpen) return
        Graph.tickFrame()
        controls.update()
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }
      animate()
  })
  
  const onWindowResize = () => {
    if (!container.value) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onWindowResize)
}

watch(() => props.isOpen, (val) => {
  if (val) {
    setTimeout(initGraph, 100)
  }
})
</script>

<template>
  <div v-if="isOpen" class="graph-modal">
    <button class="close-btn" @click="emit('close')">✖ 关闭图谱</button>
    <div ref="container" class="graph-container"></div>
    
    <div class="legend-panel">
      <div class="legend-title">节点类型</div>
      <div class="legend-item">
        <span class="dot" :style="{ background: NODE_COLORS.doc }"></span>
        <span>文档 (Document)</span>
      </div>
      <div class="legend-item">
        <span class="dot" :style="{ background: NODE_COLORS.h1 }"></span>
        <span>一级标题 (H1)</span>
      </div>
      <div class="legend-item">
        <span class="dot" :style="{ background: NODE_COLORS.h2 }"></span>
        <span>二级标题 (H2)</span>
      </div>
      <div class="legend-divider"></div>
      <div class="legend-help">🖱️ 拖拽旋转 / 📦 滚轮缩放</div>
    </div>
  </div>
</template>

<style scoped>
.graph-modal {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 5000;
  background: #0a0a0a;
}
.graph-container { width: 100%; height: 100%; }

.close-btn {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 5001;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

/* 🌟 图例面板样式 */
.legend-panel {
  position: absolute;
  bottom: 30px;
  left: 30px;
  z-index: 5001;
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(12px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.legend-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 500;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.legend-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 15px 0;
}

.legend-help {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}
</style>