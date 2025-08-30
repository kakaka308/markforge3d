<script setup>
import { parseMarkdown } from 'markdown-three-parser'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, createVNode, render } from 'vue' // 导入 createVNode 和 render
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'
import ThreePreview from './components/ThreePreview.vue' // 导入 ThreePreview 组件
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const exportPdf = async () => {
  const box = document.querySelector('.part-preview .box')
  if (!box) return

  // 显示加载状态
  // 您可以在这里添加加载状态UI

  // 记录原始样式
  const originalHeight = box.style.height
  const originalOverflow = box.style.overflow

  // 展开所有内容
  box.style.height = 'auto'
  box.style.overflow = 'visible'

  try {
    const canvas = await html2canvas(box, {
      useCORS: true,
      scale: 2, // 提高输出质量
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const imgProps = pdf.getImageProperties(imgData)
    const imgWidth = pdfWidth
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    pdf.save('markforge-export.pdf')
    
    // 显示成功消息
    // 您可以在这里添加成功状态UI
    
  } catch (err) {
    console.error('导出 PDF 失败:', err)
    // 显示错误消息
  } finally {
    // 恢复原来的高度和滚动条
    box.style.height = originalHeight
    box.style.overflow = originalOverflow
  }
}



// --- 自动保存功能实现 ---

// 定义 localStorage 的键名，用于存储草稿
const STORAGE_KEY = 'my_markdown_draft'

// 尝试从 localStorage 读取草稿。如果没有，则使用默认值。
const markdownText = ref(localStorage.getItem(STORAGE_KEY) || `# Hello Markdown\n\n:::three\n### cube (0x007bff, 1.5)\n### sphere (red, 1)\n### cone (#00ff00, 1.2)\n### dodecahedron (#ff00ff, 0.8)\n:::\n\nThis is some regular text.`);

// 监听 markdownText 的变化，并自动保存到 localStorage
// 这是一个深度监听，确保任何更改都能被捕获
watch(markdownText, (newVal) => {
  localStorage.setItem(STORAGE_KEY, newVal)
}, { deep: true })

const renderedHtml = computed(() => parseMarkdown(markdownText.value))

const textareaRef = ref(null)

// 存储 ThreePreview 实例的引用，以便在更新时可以销毁
const threePreviewInstances = ref([])

// 插入 Markdown 模板的函数
function insertMarkdown(template, cursorStart = null, cursorEnd = null) {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  markdownText.value =
    markdownText.value.substring(0, start) +
    template +
    markdownText.value.substring(end)

  nextTick(() => {
    const posStart = start + (cursorStart ?? template.length)
    const posEnd = start + (cursorEnd ?? template.length)
    textarea.focus()
    textarea.setSelectionRange(posStart, posEnd)
  })
}

// Swiper 初始化
const menuButtonRef = ref(null)
const swiperInstance = ref(null)

// 快捷键处理函数
const handleShortcut = (e) => {
  // 检查是否为 Ctrl 或 Cmd 键
  const isMac = navigator.platform.includes('Mac')
  const isModifier = isMac ? e.metaKey : e.ctrlKey

  if (isModifier) {
    switch (e.key) {
      case 'b': // 粗体
        e.preventDefault()
        insertMarkdown('**粗体文字**', 2, 6)
        break
      case 'i': // 斜体
        e.preventDefault()
        insertMarkdown('*斜体文字*', 1, 5)
        break
      case '1': // 标题
        e.preventDefault()
        insertMarkdown('# 标题1', 1)
        break
      case '2': // 标题
        e.preventDefault()
        insertMarkdown('## 标题2', 2)
        break
      case '3': // 标题
        e.preventDefault()
        insertMarkdown('### 标题3', 3)
        break
      case '4': // 标题
        e.preventDefault()
        insertMarkdown('#### 标题4', 4)
        break
      case '5': // 标题
        e.preventDefault()
        insertMarkdown('##### 标题5', 5)
        break
      case 'k': // 链接
        e.preventDefault()
        insertMarkdown('[链接文本](https://)', 1, 5)
        break
      case 'l': // 无序列表
        e.preventDefault()
        insertMarkdown('- 列表项', 2)
        break
      case 'e': // 代码块
        e.preventDefault()
        insertMarkdown('```javascript\n// 代码\n```', 13, 13)
        break
      case 'I': // 图片 (Ctrl+Shift+I)
        if (e.shiftKey) {
          e.preventDefault()
          insertMarkdown('![图片描述](https://)', 2, 6)
        }
        break
      case 'Q': // 引用 (Ctrl+Shift+Q)
        if (e.shiftKey) {
          e.preventDefault()
          insertMarkdown('> 引用内容', 2)
        }
        break
      case 'T': // Three.js block (Ctrl+Shift+T)
        if (e.shiftKey) {
          e.preventDefault()
          insertMarkdown(':::three\n### cube (0x007bff, 1)\n:::', 8, 23)
        }
        break;
    }
  }
}

// 渲染 ThreePreview 组件
const renderThreePreviews = () => {
  // 1. 清理旧实例（添加安全检查）
  threePreviewInstances.value.forEach(({ vnode, container }) => {
    if (!vnode || !container) return; // 跳过无效引用
    try {
      render(container); // 卸载组件
      if (container.parentNode) { // 检查父节点是否存在
        container.parentNode.removeChild(container);
      }
    } catch (e) {
      console.warn('清理 ThreePreview 实例时出错:', e);
    }
  });
  threePreviewInstances.value = [];

  // 2. 获取预览容器（添加存在性检查）
  const previewBox = document.querySelector('.part-preview .box');
  if (!previewBox) {
    console.warn('未找到预览容器');
    return;
  }

  // 3. 处理 Three.js 占位符（确保占位符存在）
  const placeholders = previewBox.querySelectorAll('.three-js-container');
  if (placeholders.length === 0) return; // 无占位符时直接返回

  placeholders.forEach((placeholder) => {
    try {
      // 解析数据（添加错误处理）
      const objectsData = JSON.parse(placeholder.dataset.objects || '[]');
      
      // 创建挂载点
      const mountPoint = document.createElement('div');
      mountPoint.className = 'dynamic-three-container';
      
      // 安全替换 DOM
      if (placeholder.parentNode) {
        placeholder.parentNode.replaceChild(mountPoint, placeholder);
      }

      // 渲染组件
      const vnode = createVNode(ThreePreview, { objects: objectsData });
      render(vnode, mountPoint);

      // 保存实例引用
      threePreviewInstances.value.push({ vnode, container: mountPoint });
    } catch (e) {
      console.error('渲染 ThreePreview 时出错:', e);
    }
  });
};

onMounted(() => {
  console.log('草稿已从 localStorage 恢复');

  // 初始化 Swiper
  const menuButton = menuButtonRef.value;
  let openMenu = () => {
    if (swiperInstance.value) {
      swiperInstance.value.slidePrev();
    }
  };

  swiperInstance.value = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    initialSlide: 1,
    resistanceRatio: 0,
    slideToClickedSlide: true,
    on: {
      slideChangeTransitionStart: function () {
        if (this.activeIndex === 0) {
          menuButton.classList.add('cross');
          menuButton.removeEventListener('click', openMenu);
        } else {
          menuButton.classList.remove('cross');
        }
      },
      slideChangeTransitionEnd: function () {
        if (this.activeIndex === 1) {
          menuButton.addEventListener('click', openMenu);
        }
      },
    },
  });

  // 初始状态添加监听器
  if (swiperInstance.value.activeIndex === 1) {
    menuButton.addEventListener('click', openMenu);
  }

  // 检查预览容器是否存在后再渲染
  const previewBox = document.querySelector('.part-preview .box');
  if (previewBox) {
    previewBox.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        // 同步复选框状态到 Markdown（原有逻辑）
      }
    });

    // 添加键盘事件监听
    if (textareaRef.value) {
      textareaRef.value.addEventListener('keydown', handleShortcut);
    }

    // 首次渲染 Three.js 预览
    nextTick(() => {
      if (document.querySelector('.part-preview .box')) {
        renderThreePreviews();
      }
    });
  }
});

// 监听 renderedHtml 的变化，并在 DOM 更新后重新渲染 ThreePreview
watch(renderedHtml, () => {
  nextTick(() => {
    // 双重检查预览容器是否存在
    if (document.querySelector('.part-preview .box')) {
      renderThreePreviews();
    }
  });
});

// 在组件卸载前移除事件监听器并销毁 Three.js 实例
onBeforeUnmount(() => {
  // 移除键盘事件监听
  if (textareaRef.value) {
    textareaRef.value.removeEventListener('keydown', handleShortcut);
  }

  // 清理 Three.js 实例（添加安全检查）
  threePreviewInstances.value.forEach(({ vnode, container }) => {
    if (!vnode || !container) return;
    try {
      render(container);
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    } catch (e) {
      console.warn('卸载时清理 ThreePreview 失败:', e);
    }
  });
});
</script>

<template>
  <div class="swiper-container">
    <div class="swiper-wrapper">
      <div class="swiper-slide menu">
        <div class="menu-content">
          <ul>
            <li><button @click="exportPdf" class="export-button">导出为 PDF</button></li>
            <li>菜单项 2</li>
            <li>菜单项 3</li>
          </ul>
        </div>
      </div>

      <div class="swiper-slide content">
        <div class="container">
          <div ref="menuButtonRef" class="menu-button">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
          <header class="header">
            <div class="headertitle">MarkForge 3D 编辑器</div>
          </header>

          <div class="toolbar">
            <div class="tooltip">
              <button @click="insertMarkdown('**粗体文字**', 2, 6)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 4h8a4 4 0 0 1 0 8H6zM14 12a4 4 0 0 1 0 8H6v-8z"/>
                </svg>
              </button>
              <span class="tooltiptext">粗体 (Bold)</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('*斜体文字*', 1, 5)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="19" y1="4" x2="10" y2="4"/>
                  <line x1="14" y1="20" x2="5" y2="20"/>
                  <line x1="15" y1="4" x2="9" y2="20"/>
                </svg>
              </button>
              <span class="tooltiptext">斜体 (Italic)</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('# 标题1', 2)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 6v12M12 6v12M4 12h8"/>
                  <text x="16" y="15" font-size="8" fill="currentColor">1</text>
                </svg>
              </button>
              <span class="tooltiptext">一级标题</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('[链接文本](https://)', 1, 5)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
              <span class="tooltiptext">插入链接</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('![图片描述](https://)', 2, 6)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </button>
              <span class="tooltiptext">插入图片</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('- 列表项', 2)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <circle cx="4" cy="6" r="1"/>
                  <circle cx="4" cy="12" r="1"/>
                  <circle cx="4" cy="18" r="1"/>
                </svg>
              </button>
              <span class="tooltiptext">无序列表</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('```javascript\n// 代码\n```', 13, 13)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </button>
              <span class="tooltiptext">代码块</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown('> 引用内容', 2)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 0 1-2-2v-4a4 4 0 0 1 4-4h2V5H5a7 7 0 0 0-7 7v7a5 5 0 0 0 5 5h4z"/>
                  <path d="M21 21h-4a2 2 0 0 1-2-2v-4a4 4 0 0 1 4-4h2V5h-2a7 7 0 0 0-7 7v7a5 5 0 0 0 5 5h4z"/>
                </svg>
              </button>
              <span class="tooltiptext">引用</span>
            </div>

            <div class="tooltip">
              <button @click="insertMarkdown(':::three\n### cube (0x007bff, 1)\n:::', 8, 23)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-box">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.37 12 11 20.73 6.37"></polyline>
                  <line x1="12" y1="22.73" x2="12" y2="11"></line>
                </svg>
              </button>
              <span class="tooltiptext">插入 3D 预览</span>
            </div>

            <div>
              <input type="checkbox" id="switch" switch class="input input--switch"  value="dark"></input>
            </div>
          </div>

          <div class="main">
            <div class="left">
              <div class="card">
                <div class="part-title">Markdown 输入</div>
                <div class="part-textarea">
                  <textarea ref="textareaRef" v-model="markdownText"></textarea>
                </div>
              </div>
            </div>

            <div class="right">
              <div class="card">
                <div class="part-title">HTML 预览</div>
                <div class="scroll-container">
                  <div class="part-preview">
                      <div class="box" v-html="renderedHtml"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">MarkForge 3D © 2025</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'swiper/css/bundle';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-size: 26px;
  background-color: #f9f2f1;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

// Swiper 相关样式
.swiper-container {
  width: 100vw;
  height: 100vh;
}

.swiper-slide {
  width: 70%; // 菜单宽度
  max-width: 320px;
  background-color: #D8E2DC; // 菜单背景色
  color: #000000;

  &.content {
    width: 100%;
    max-width: none;
    background-color: #f9f2f1;
  }
}

.menu {
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-content {
  width: 100%;
  padding: 20px;
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    padding: 10px;
    font-size: large;
    border-bottom: 1px solid gray;
    cursor: pointer;
    &:last-child {
      border-bottom: none;
    }
    .export-button {
      background: transparent;
      border: none;
      font-size: large;
    }
  }
}

.menu-button {
  position: absolute;
  top: 0px;
  left: 0px;
  padding: 13px;
  cursor: pointer;
  z-index: 100;
  background: linear-gradient(to right, #D8E2DC, #fdc1b7);
  transition: 0.3s;
}

.menu-button .bar:nth-of-type(1) {
  margin-top: 0px;
}
.menu-button .bar:nth-of-type(3) {
  margin-bottom: 0px;
}
.bar {
  position: relative;
  display: block;
  width: 50px;
  height: 5px;
  margin: 10px auto;
  background-color: #fff;
  border-radius: 10px;
  transition: 0.3s;
}
.menu-button:hover .bar:nth-of-type(1) {
  transform: translateY(1.5px) rotate(-4.5deg);
}
.menu-button:hover .bar:nth-of-type(2) {
  opacity: 0.9;
}
.menu-button:hover .bar:nth-of-type(3) {
  transform: translateY(-1.5px) rotate(4.5deg);
}
.cross .bar:nth-of-type(1) {
  transform: translateY(15px) rotate(-45deg);
}
.cross .bar:nth-of-type(2) {
  opacity: 0;
}
.cross .bar:nth-of-type(3) {
  transform: translateY(-15px) rotate(45deg);
}
.cross:hover .bar:nth-of-type(1) {
  transform: translateY(13.5px) rotate(-40.5deg);
}
.cross:hover .bar:nth-of-type(2) {
  opacity: 0.1;
}
.cross:hover .bar:nth-of-type(3) {
  transform: translateY(-13.5px) rotate(40.5deg);
}


.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(to right, #fdc1b7, #f5e9e6);
  height: 60.94px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  .headertitle {
    color: white;
    font-weight: bold;
    margin: 0 10px;
  }
}

.main {
  display: flex;
  flex: 1;
  min-height: 0;

  .left, .right {
    flex: 1;
    padding: 20px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .card {
    min-height: 0;
    margin: 10px;
    border: 1px solid gray;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    background-color: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .part-title {
      background: linear-gradient(to right, #FAE1DD, #F8EDEB);
      padding: 10px;
      border-bottom: 1px solid gray;
      font-weight: bold;
      flex-shrink: 0;
    }
    .scroll-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    
    .part-textarea {
      textarea {
        width: 100%;
        min-height: 1000px;
        resize: none;
        border: 1px solid gray;
        border-radius: 4px;
        padding: 10px;
        font-family: inherit;
        font-size: 24px;
      }
    }
    
    .part-preview {
      .box {
        width: 100%;
        min-height: 300px;
        border: 1px solid gray;
        border-radius: 4px;
        padding: 10px;
        font-size: 24px;
      }
    }
  }
}

.footer {
  background: linear-gradient(to right, #D8E2DC, #FFE5D9);
  color: black;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  flex-shrink: 0;
}

/* 表格、代码、列表样式保留 */
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #ccc; padding: 8px; }
th { background-color: #f2f2f2; }
ul, ol { padding-left: 20px; }
pre[class*="language-"] {
  border-radius: 8px;
  margin: 1em 0;
  padding: 1em;
  overflow: auto;
  background: #f5f7ff;
  border: 1px solid #e1e4e8;
  code { font-family: 'Fira Code', Consolas, Monaco, monospace; font-size: 0.9em; line-height: 1.5; }
}
code:not([class*="language-"]) {
  background: #d8d8d8;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 8px;
  padding: 6px 10px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
  button {
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    svg { stroke-width: 2; }
    &:hover { background: #f0f0f0; transform: translateY(-1px); }
  }
  
}

/* Tooltip */
.tooltip { position: relative; display: inline-block;
  .tooltiptext {
    visibility: hidden;
    opacity: 0;
    background-color: #333;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    position: absolute;
    z-index: 1;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 17px;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  &:hover .tooltiptext { visibility: visible; opacity: 1; }
}

// 复选框样式
.part-preview input[type="checkbox"] {
  appearance: none; /* 去掉默认样式 */
  width: 20px;
  height: 20px;
  border: 2px solid #FEC89A;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  vertical-align: middle;
}

.part-preview input[type="checkbox"]:checked {
  background-color: #FEC89A;
}

.part-preview input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 0;
  left: 4px;
  color: white;
  font-size: 16px;
}
</style>