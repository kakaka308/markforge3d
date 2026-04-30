<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import ThreeForceGraph from 'three-forcegraph'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'
import { Folder } from '@element-plus/icons-vue'

const props = defineProps({
  docs:   Array,
  isOpen: Boolean
})
const emit = defineEmits(['close', 'open-doc'])

const container   = ref(null)
const focusedDocId = ref(null)   // null = 全部显示

let currentRenderer    = null
let currentAnimFrameId = null
let resizeHandler      = null
let graphInstance      = null    // 保存 Graph 引用供聚焦切换使用
let cameraInstance     = null
let controlsInstance   = null

const NODE_COLORS = {
  doc: '#ff4757',
  h1:  '#2ed573',
  h2:  '#1e90ff'
}

// ── 节点数据构建 ─────────────────────────────────────────────
const buildGraphData = () => {
  const nodes   = []
  const links   = []
  const nodeMap = new Map()

  // name → [nodeId] 用于跨文档同名连接
  const nameIndex = new Map()
  const registerName = (name, nodeId) => {
    if (!nameIndex.has(name)) nameIndex.set(name, [])
    nameIndex.get(name).push(nodeId)
  }

  props.docs.forEach(doc => {
    const docNodeId = `doc-${doc.id}`
    if (!nodeMap.has(docNodeId)) {
      nodes.push({
        id:    docNodeId,
        name:  doc.title || '未命名文档',
        val:   35,
        group: 'doc',
        docId: doc.id,
        color: NODE_COLORS.doc
      })
      nodeMap.set(docNodeId, true)
    }
    registerName(doc.title || '未命名文档', docNodeId)

    const lines = (doc.content || '').split('\n')
    let latestH1Id = null

    lines.forEach((line, lineIdx) => {
      const h1Match = line.match(/^#\s+(.+)/)
      const h2Match = line.match(/^##\s+(.+)/)

      if (h1Match) {
        const name   = h1Match[1].trim()
        const nodeId = `${docNodeId}-h1-${lineIdx}`
        nodes.push({ id: nodeId, name, val: 15, group: 'h1', docId: doc.id, color: NODE_COLORS.h1 })
        links.push({ source: docNodeId, target: nodeId, crossDoc: false })
        registerName(name, nodeId)
        latestH1Id = nodeId
      } else if (h2Match) {
        const name   = h2Match[1].trim()
        const nodeId = `${docNodeId}-h2-${lineIdx}`
        nodes.push({ id: nodeId, name, val: 8, group: 'h2', docId: doc.id, color: NODE_COLORS.h2 })
        links.push({ source: latestH1Id ?? docNodeId, target: nodeId, crossDoc: false })
        registerName(name, nodeId)
      }
    })
  })

  // 跨文档同名节点：两两加连接
  const linked = new Set()
  nameIndex.forEach((ids) => {
    if (ids.length < 2) return
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join('||')
        if (linked.has(key)) continue
        linked.add(key)
        links.push({ source: ids[i], target: ids[j], crossDoc: true })
      }
    }
  })

  return { nodes, links }
}

// ── 节点外观（根据聚焦状态）───────────────────────────────────
const makeNodeObject = (node, focusId) => {
  const dimmed  = focusId != null && node.docId !== focusId
  const opacity = dimmed ? 0.07 : 0.95

  const group  = new THREE.Group()
  const radius = node.val ? Math.sqrt(node.val) : 3

  const geo = new THREE.SphereGeometry(radius, 32, 32)
  const mat = new THREE.MeshLambertMaterial({ color: node.color, transparent: true, opacity })
  group.add(new THREE.Mesh(geo, mat))

  // 暗沉节点不渲染文字，减少视觉杂乱
  if (!dimmed) {
    const sprite = new SpriteText(node.name)
    sprite.color           = '#ffffff'
    sprite.textHeight      = node.group === 'doc' ? 5 : 3.5
    sprite.backgroundColor = 'rgba(0,0,0,0.6)'
    sprite.borderColor     = node.color
    sprite.borderWidth     = 1
    sprite.borderRadius    = 6
    sprite.padding         = [6, 3]
    sprite.position.y      = radius + 5
    group.add(sprite)
  }

  return group
}

// ── 连接线颜色（根据聚焦状态）──────────────────────────────────
const getLinkColor = (link, focusId, nodes) => {
  // 聚焦状态下跨文档连接线完全隐藏（透明）
  if (link.crossDoc) {
    if (focusId != null) return 'rgba(0,0,0,0)'
    return 'rgba(243,156,18,0.6)'
  }
  if (focusId == null) return 'rgba(255,255,255,0.4)'
  const srcId  = link.source?.id ?? link.source
  const srcDoc = nodes.find(n => n.id === srcId)?.docId
  return srcDoc === focusId ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.04)'
}

// ── 清理 ─────────────────────────────────────────────────────
const cleanupGraph = () => {
  if (currentAnimFrameId) { cancelAnimationFrame(currentAnimFrameId); currentAnimFrameId = null }
  if (resizeHandler)      { window.removeEventListener('resize', resizeHandler); resizeHandler = null }
  if (currentRenderer)    { currentRenderer.dispose(); currentRenderer = null }
  graphInstance = null; cameraInstance = null; controlsInstance = null
}

// ── 初始化 ────────────────────────────────────────────────────
const initGraph = () => {
  if (!container.value) return
  cleanupGraph()
  while (container.value.firstChild) container.value.removeChild(container.value.firstChild)

  const gData   = buildGraphData()
  const focusId = focusedDocId.value

  const Graph = new ThreeForceGraph()
    .graphData(gData)
    .nodeThreeObject(node => makeNodeObject(node, focusId))
    .linkColor(link => getLinkColor(link, focusId, gData.nodes))
    .linkOpacity(1)
    .linkWidth(link => (link.crossDoc && focusId != null) ? 0 : link.crossDoc ? 1.4 : 0.8)
    .linkDirectionalParticles(link => link.crossDoc ? 0 : 1)
    .linkDirectionalParticleWidth(0.78)
    .linkDirectionalParticleColor(() => '#1166b4')
    .linkDirectionalParticleSpeed(0.03)

  graphInstance = Graph

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)
  scene.add(Graph)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dl = new THREE.DirectionalLight(0xffffff, 1);  dl.position.set(50, 50, 50);   scene.add(dl)
  const bl = new THREE.DirectionalLight(0xffffff, 0.5); bl.position.set(-50,-50,-50); scene.add(bl)

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 250
  cameraInstance = camera

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)
  currentRenderer = renderer

  import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsInstance = controls

    const animate = () => {
      if (!props.isOpen) return
      currentAnimFrameId = requestAnimationFrame(animate)
      Graph.tickFrame()
      controls.update()
      renderer.render(scene, camera)
    }
    currentAnimFrameId = requestAnimationFrame(animate)
    animate()
  })

  resizeHandler = () => {
    if (!container.value) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', resizeHandler)
}

// ── 聚焦：重新初始化图谱（最稳定的方式）──────────────────────
// three-forcegraph 的 nodeThreeObject 和 linkColor 不支持热更新，
// 重新 initGraph 是最可靠的做法，且数据量小时性能完全可接受。
const focusDoc = (docId) => {
  if (focusedDocId.value === docId) {
    focusedDocId.value = null
  } else {
    focusedDocId.value = docId
  }
  // 保存当前相机位置，切换后恢复视角
  const prevCamPos = cameraInstance
    ? cameraInstance.position.clone()
    : null

  initGraph()

  // 聚焦后飞向目标节点（等 force simulation 稳定后）
  if (focusedDocId.value && cameraInstance && controlsInstance) {
    setTimeout(() => {
      const gData = graphInstance?.graphData?.()
      if (!gData) return
      const target = gData.nodes.find(n => n.id === `doc-${focusedDocId.value}`)
      if (target && target.x != null) {
        const d = 150
        cameraInstance.position.set(target.x + d, target.y + d * 0.5, target.z + d)
        controlsInstance.target.set(target.x, target.y, target.z)
        controlsInstance.update()
      }
    }, 1500)
  }
}

watch(() => props.isOpen, val => {
  if (val) {
    focusedDocId.value = null
    setTimeout(initGraph, 100)
  } else {
    if (currentAnimFrameId) { cancelAnimationFrame(currentAnimFrameId); currentAnimFrameId = null }
  }
})

onBeforeUnmount(cleanupGraph)
</script>

<template>
  <div v-if="isOpen" class="graph-modal">

    <button class="close-btn" @click="emit('close')">✖ 关闭图谱</button>

    <div ref="container" class="graph-container"></div>

    <!-- 文档列表侧栏 -->
    <div class="doc-panel">
      <div class="doc-panel-title"><el-icon><Folder /></el-icon> 文档列表</div>
      <div class="doc-panel-tip">点击文档名聚焦节点</div>

      <div class="doc-list">
        <div
          v-for="doc in docs"
          :key="doc.id"
          class="doc-item"
          :class="{ active: focusedDocId === doc.id }"
          @click="focusDoc(doc.id)"
        >
          <div class="doc-item-left">
            <span class="doc-dot"></span>
            <span class="doc-name">{{ doc.title || '未命名文档' }}</span>
          </div>
          <button class="open-btn" @click.stop="emit('open-doc', doc)" title="打开文档">
            打开
          </button>
        </div>

        <div v-if="!docs || docs.length === 0" class="doc-empty">
          暂无已保存文档
        </div>
      </div>

      <button v-if="focusedDocId" class="reset-btn" @click="focusDoc(focusedDocId)">
        ↩ 显示全部节点
      </button>
    </div>

    <!-- 图例 -->
    <div class="legend-panel">
      <div class="legend-title">节点类型</div>
      <div class="legend-item"><span class="dot" :style="{ background: NODE_COLORS.doc }"></span><span>文档</span></div>
      <div class="legend-item"><span class="dot" :style="{ background: NODE_COLORS.h1 }"></span><span>一级标题</span></div>
      <div class="legend-item"><span class="dot" :style="{ background: NODE_COLORS.h2 }"></span><span>二级标题</span></div>
      <div class="legend-divider"></div>
      <div class="legend-item"><span class="line-cross"></span><span>跨文档同名连接</span></div>
      <div class="legend-divider"></div>
      <div class="legend-help">🖱️ 拖拽旋转 · 滚轮缩放</div>
    </div>

  </div>
</template>

<style scoped>
.graph-modal { position: fixed; inset: 0; z-index: 5000; background: #0a0a0a; }
.graph-container { width: 100%; height: 100%; }

.close-btn {
  position: absolute; top: 20px; right: 24px; z-index: 5002;
  padding: 8px 18px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px; cursor: pointer; color: #fff;
  font-weight: 600; backdrop-filter: blur(10px); transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.22); transform: scale(1.04); }

/* ── 文档侧栏 ── */
.doc-panel {
  position: absolute; top: 0; left: 0; bottom: 0; width: 230px;
  z-index: 5001;
  background: rgba(10,10,10,0.90); backdrop-filter: blur(14px);
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex; flex-direction: column;
  padding: 20px 0 16px;
  overflow: hidden;
}
.doc-panel-title {
  font-size: 12px; font-weight: 700; letter-spacing: 1px;
  color: rgba(255,255,255,0.4); text-transform: uppercase;
  padding: 0 16px 4px;
}
.doc-panel-tip {
  font-size: 11px; color: rgba(255,255,255,0.25);
  padding: 0 16px 10px;
}
.doc-list { flex: 1; overflow-y: auto; min-height: 0; padding-bottom: 8px; }

.doc-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px 8px 16px; cursor: pointer;
  border-left: 3px solid transparent; transition: all 0.15s;
}
.doc-item:hover { background: rgba(255,255,255,0.05); }
.doc-item.active { background: rgba(255,71,87,0.1); border-left-color: #ff4757; }

.doc-item-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.doc-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #ff4757; flex-shrink: 0;
}
.doc-name {
  font-size: 13px; color: rgba(255,255,255,0.75);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.doc-item.active .doc-name { color: #fff; font-weight: 600; }

.open-btn {
  flex-shrink: 0; padding: 3px 8px; font-size: 11px;
  background: rgba(100,181,246,0.12); border: 1px solid rgba(100,181,246,0.28);
  border-radius: 5px; color: #64b5f6; cursor: pointer; transition: all 0.15s;
}
.open-btn:hover { background: rgba(100,181,246,0.28); }

.doc-empty { font-size: 12px; color: rgba(255,255,255,0.25); padding: 20px 16px; text-align: center; }

.reset-btn {
  margin: 10px 14px 0; padding: 7px 0; font-size: 12px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px; color: rgba(255,255,255,0.55); cursor: pointer; transition: all 0.15s;
}
.reset-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* ── 图例 ── */
.legend-panel {
  position: absolute; bottom: 24px; left: 246px; z-index: 5001;
  background: rgba(16,16,16,0.88); backdrop-filter: blur(12px);
  padding: 14px 18px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.09); color: #fff;
  min-width: 175px; box-shadow: 0 8px 32px rgba(0,0,0,0.35);
}
.legend-title {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4);
  text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;
}
.legend-item { display: flex; align-items: center; margin-bottom: 8px; font-size: 12px; }
.dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
.line-cross {
  display: inline-block; width: 26px; height: 0; margin-right: 10px; flex-shrink: 0;
  border-top: 2px dashed rgba(243,156,18,0.85);
}
.legend-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 8px 0; }
.legend-help { font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; }

.doc-list::-webkit-scrollbar { width: 4px; }
.doc-list::-webkit-scrollbar-track { background: transparent; }
.doc-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
.doc-list::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28); }
</style>