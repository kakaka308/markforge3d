<script setup>
import * as THREE from 'three'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue' // 导入 watch

const props = defineProps({
  // props.type 不再是必需的，因为我们将通过 objects 传递多个对象
  // type: {
  //   type: String,
  //   default: 'cube',
  // },
  objects: {
    type: Array,
    default: () => [{ type: 'cube', color: 0x007bff, size: 1 }], // 默认渲染一个蓝色立方体
  },
})

const containerRef = ref(null)

let scene, camera, renderer, animationFrameId
let currentObjects = [] // 用于存储当前场景中的 Three.js 对象实例

const initThree = () => {
  const container = containerRef.value
  if (!container) return

  // 清理现有场景以避免重复初始化
  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        obj.material.dispose()
      }
    })
    renderer.dispose()
    cancelAnimationFrame(animationFrameId)
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  // Initial object creation based on props.objects
  createObjects()

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(0, 1, 1)
  scene.add(directionalLight)

  // Handle window resize
  window.addEventListener('resize', onWindowResize)
}

const onWindowResize = () => {
  const container = containerRef.value
  if (container && camera && renderer) {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
}

const createObjects = () => {
  // 清理旧对象
  currentObjects.forEach(obj => {
    scene.remove(obj)
    obj.geometry.dispose()
    obj.material.dispose()
  })
  currentObjects = []

  // 为每个传入的对象数据创建 Three.js 对象
  if (props.objects && props.objects.length > 0) {
    // Determine the bounding box of all objects to adjust camera
    const boundingBox = new THREE.Box3();
    let totalObjectsWidth = 0;
    let maxObjectHeight = 0;
    const padding = 0.5; // Padding between objects

    props.objects.forEach((objData, index) => {
      let geometry, material, mesh;
      const objectColor = objData.color ? new THREE.Color(objData.color) : new THREE.Color(0x007bff);
      const objectSize = objData.size || 1;

      switch (objData.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(objectSize, objectSize, objectSize);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(objectSize / 2, 32, 32); // Radius is half of size for visual consistency
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(objectSize / 2, objectSize, 32);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(objectSize / 2, objectSize / 2, objectSize, 32);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(objectSize / 2, objectSize / 4, 16, 100);
          break;
        case 'plane':
          geometry = new THREE.PlaneGeometry(objectSize, objectSize);
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(objectSize / 2);
          break;
        case 'icosahedron':
          geometry = new THREE.IcosahedronGeometry(objectSize / 2);
          break;
        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(objectSize / 2);
          break;
        default:
          geometry = new THREE.BoxGeometry(objectSize, objectSize, objectSize);
          break;
      }
      material = new THREE.MeshPhongMaterial({ color: objectColor }); // Use PhongMaterial for lighting effects
      mesh = new THREE.Mesh(geometry, material);

      // Position objects side by side
      mesh.position.x = totalObjectsWidth + objectSize / 2 + padding * index;
      totalObjectsWidth += objectSize + padding;
      maxObjectHeight = Math.max(maxObjectHeight, objectSize); // Assuming height is similar to size

      scene.add(mesh);
      currentObjects.push(mesh);
      boundingBox.expandByObject(mesh);
    });

    // Center objects and adjust camera based on bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    currentObjects.forEach(obj => {
      obj.position.x -= center.x; // Center all objects around the origin
      // obj.position.y -= center.y; // Keep Y as 0 for ground level
    });
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Adjust camera Z position to fit all objects in view
    // Using the maximum dimension (width or height) to ensure visibility
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180); // convert fov to radians
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.2; // Add some buffer

    camera.position.z = Math.max(cameraZ, 5); // Ensure a minimum distance
    camera.position.y = size.y / 2; // Adjust camera Y to roughly center objects vertically
    camera.lookAt(0, size.y / 2, 0); // Look at the center of the objects
  } else {
    // If no objects are provided, add a default cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x007bff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    currentObjects.push(mesh);
  }
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  // Simple rotation animation for all current objects
  currentObjects.forEach(obj => {
    obj.rotation.x += 0.01
    obj.rotation.y += 0.01
  })

  renderer.render(scene, camera)
}

onMounted(() => {
  initThree()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        obj.material.dispose()
      }
    })
    // Remove the DOM element
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement);
    }
  }
})

// Watch for changes in the 'objects' prop and re-create objects
watch(() => props.objects, () => {
  if (scene && camera && renderer) { // Ensure Three.js is initialized
    createObjects();
  }
}, { deep: true }); // Deep watch is important for array/object changes
</script>

<template>
  <div ref="containerRef" class="three-container"></div>
</template>

<style scoped>
.three-container {
  width: 100%;
  height: 400px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
</style>