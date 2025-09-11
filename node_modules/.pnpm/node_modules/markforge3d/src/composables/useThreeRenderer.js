import * as THREE from 'three'

export function useThreeRenderer(canvas, shapes = []) {
  if (!canvas) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  // 环境光 & 平行光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 工厂函数：根据 type 生成几何体
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
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  // 添加 Markdown 解析得到的 shapes
  shapes.forEach((s, i) => {
    const mesh = createShape(s)
    mesh.position.x = i * 2.5 - (shapes.length - 1) // 自动排开位置
    scene.add(mesh)
    s.__mesh = mesh // 保存引用，方便动画用
  })

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
}
