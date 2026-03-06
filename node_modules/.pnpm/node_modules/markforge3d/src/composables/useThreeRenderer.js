// src/composables/useThreeRenderer.js
// 修复17：将 scene.children = ... 直接赋值改为调用 scene.remove() 逐个移除，
//         触发 Three.js 内部的正确事件，同时对废弃的 mesh 调用 geometry.dispose()
//         和 material.dispose() 释放 GPU 资源，避免显存泄漏。
import * as THREE from 'three'

export function useThreeRenderer(canvas, shapes = []) {
  if (!canvas) return null

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true // 保证 toDataURL 有内容
  })
  renderer.setClearColor(0xffffff, 1)
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  // 光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 工厂函数：创建几何体
  function createShape({ type, color = 'skyblue', size = 1 }) {
    let geometry
    switch (type.toLowerCase()) {
      case 'cube':
        geometry = new THREE.BoxGeometry(size, size, size)
        break
      case 'sphere':
        geometry = new THREE.SphereGeometry(size, 32, 32)
        break
      case 'cone':
        geometry = new THREE.ConeGeometry(size, size * 2, 32)
        break
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(size, size, size * 2, 32)
        break
      case 'torus':
        geometry = new THREE.TorusGeometry(size, size * 0.4, 16, 100)
        break
      default:
        geometry = new THREE.BoxGeometry(size, size, size)
    }
    const material = new THREE.MeshStandardMaterial({ color })
    return new THREE.Mesh(geometry, material)
  }

  function addShapes(objs) {
    objs.forEach((s, i) => {
      const mesh = createShape(s)
      mesh.position.x = i * 2.5 - (objs.length - 1)
      scene.add(mesh)
      s.__mesh = mesh
    })
  }

  addShapes(shapes)
  camera.position.z = 6

  let animFrameId = null
  const animate = () => {
    animFrameId = requestAnimationFrame(animate)
    shapes.forEach(s => {
      if (s.__mesh) {
        s.__mesh.rotation.x += 0.01
        s.__mesh.rotation.y += 0.01
      }
    })
    renderer.render(scene, camera)
  }
  animate()

  // 修复17：正确移除 mesh，逐个调用 scene.remove() 并释放 GPU 资源
  const clearMeshes = () => {
    const toRemove = scene.children.filter(
      c => c.isMesh // 只移除 Mesh，保留灯光
    )
    toRemove.forEach(mesh => {
      scene.remove(mesh)
      mesh.geometry?.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose())
      } else {
        mesh.material?.dispose()
      }
    })
  }

  const updateScene = (newShapes) => {
    clearMeshes()
    // 清空旧 shapes 数组的引用，再添加新的
    shapes.length = 0
    shapes.push(...newShapes)
    addShapes(shapes)
  }

  // 销毁方法：供外部在组件卸载时调用
  const dispose = () => {
    if (animFrameId) cancelAnimationFrame(animFrameId)
    clearMeshes()
    renderer.dispose()
  }

  return { renderer, scene, camera, updateScene, dispose }
}