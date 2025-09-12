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

  // 🔥 强制绑定外部传入的 canvas
  const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true, // ✅ 保证 toDataURL 有内容
})
renderer.setClearColor(0xffffff, 1) // ✅ 避免透明背景

  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  // 光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 工厂函数
  function createShape({ type, color = 'skyblue', size = 1 }) {
    let geometry
    switch (type.toLowerCase()) {
      case 'cube': geometry = new THREE.BoxGeometry(size, size, size); break
      case 'sphere': geometry = new THREE.SphereGeometry(size, 32, 32); break
      case 'cone': geometry = new THREE.ConeGeometry(size, size * 2, 32); break
      case 'cylinder': geometry = new THREE.CylinderGeometry(size, size, size * 2, 32); break
      case 'torus': geometry = new THREE.TorusGeometry(size, size * 0.4, 16, 100); break
      default: geometry = new THREE.BoxGeometry(size, size, size)
    }
    const material = new THREE.MeshStandardMaterial({ color })
    return new THREE.Mesh(geometry, material)
  }

  // 添加 shapes
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

  // 动画
  const animate = () => {
    requestAnimationFrame(animate)
    shapes.forEach((s) => {
      if (s.__mesh) {
        s.__mesh.rotation.x += 0.01
        s.__mesh.rotation.y += 0.01
      }
    })
    renderer.render(scene, camera)
  }
  animate()

  // 🔥 提供更新方法
  const updateScene = (newShapes) => {
    // 清除旧 mesh
    scene.children = scene.children.filter(c => c.isLight || c.isCamera)
    addShapes(newShapes)
  }

  // ✅ 返回 renderer，外部就能导出 canvas 图像
  return {
    renderer,
    scene,
    camera,
    updateScene
  }
}
