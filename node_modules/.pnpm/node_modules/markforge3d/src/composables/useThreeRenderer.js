import * as THREE from 'three'

export function useThreeRenderer(canvas) {
  if (!canvas) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x007bff })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  camera.position.z = 3

  const animate = () => {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()
}
