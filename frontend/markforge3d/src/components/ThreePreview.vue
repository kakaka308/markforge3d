<script setup>
import * as THREE from 'three'
import { onMounted, onBeforeUnmount, ref, watch, defineExpose } from 'vue' // 导入 defineExpose

const props = defineProps({
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

  // 核心修改：在创建渲染器时设置 preserveDrawingBuffer 为 true
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true // 确保在 toDataURL() 调用时缓冲区内容不会被清除
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  createObjects()

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(0, 1, 1)
  scene.add(directionalLight)

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

  if (props.objects && props.objects.length > 0) {
    const boundingBox = new THREE.Box3();
    let totalObjectsWidth = 0;
    const padding = 0.5;

    props.objects.forEach((objData, index) => {
      let geometry, material, mesh;
      const objectColor = objData.color ? new THREE.Color(objData.color) : new THREE.Color(0x007bff);
      const objectSize = objData.size || 1;

      switch (objData.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(objectSize, objectSize, objectSize);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(objectSize / 2, 32, 32);
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
      material = new THREE.MeshPhongMaterial({ color: objectColor });
      mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = totalObjectsWidth + objectSize / 2 + padding * index;
      totalObjectsWidth += objectSize + padding;

      scene.add(mesh);
      currentObjects.push(mesh);
      boundingBox.expandByObject(mesh);
    });

    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    currentObjects.forEach(obj => {
      obj.position.x -= center.x;
    });
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.2;

    camera.position.z = Math.max(cameraZ, 5);
    camera.position.y = size.y / 2;
    camera.lookAt(0, size.y / 2, 0);
  } else {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x007bff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    currentObjects.push(mesh);
  }
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

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
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement);
    }
  }
})

watch(() => props.objects, () => {
  if (scene && camera && renderer) {
    createObjects();
  }
}, { deep: true });

// 核心修改：暴露一个方法来获取截图
const getScreenshot = () => {
  return new Promise(resolve => {
    // 等待一帧动画，确保渲染完成后再截图
    requestAnimationFrame(() => {
      if (renderer) {
        const dataUrl = renderer.domElement.toDataURL('image/png')
        resolve(dataUrl)
      } else {
        resolve(null)
      }
    })
  })
}

// 核心修改：使用 defineExpose 暴露这个方法
defineExpose({
  getScreenshot,
})
</script>

<template>
  <div ref="containerRef" class="three-container"></div>
</template>

<style scoped>
.three-container {
  width: 100%; /* Make sure this line is exactly as shown */
  height: 400px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
</style>