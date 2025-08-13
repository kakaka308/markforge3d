<script setup>
import parseMarkdown from 'markdown-three-parser'
import { ref, computed } from 'vue'

// 原始 Markdown 文本
const markdownText = ref(`# Hello Markdown

**这是粗体**
*这是斜体*

这是一段内容，
然后是第二行，但不是一个新段落。

这是一个无序列表：
* 第一项
   * 嵌套项
* 第二项

这是一个有序列表：
1. 第一项
    1. 嵌套有序列表
    2. 第二项
2. 第二项

这是表格：
| 标题1 | 标题2 | 标题3 |
| :---- | :---: | ----: |
| 左对齐 | 居中 | 右对齐 |
| 内容1 | 内容2 | 内容3 |

\`\`\`javascript
// 代码高亮示例
function hello() {
  console.log('Hello Prism.js!');
  return <div>JSX 也会被高亮</div>;
}
\`\`\`

\`内联代码也会高亮\`

`)

const renderedHtml = computed(() => parseMarkdown(markdownText.value))
</script>

<template>
  <div class="container">
    <!-- 顶部导航栏 -->
      <header class="header">
      <div class="headertitle">MarkForge 3D 编辑器</div>
      </header>

    <!-- 主体内容 -->
      <div class="main">
      <!-- 左侧输入 -->
      <div class="left">
        <div class="card">
          <div class="part-title">Markdown 输入</div>
          <div class="part-textarea">
            <textarea v-model="markdownText"></textarea>
          </div>
        </div>
      </div>
        <!-- 右侧渲染 -->
      <div class="right">
        <div class="card">
          <div class="part-title">HTML 预览</div>
          <div class="part-preview">
            <div class="box" v-html="renderedHtml"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer">MarkForge 3D © 2025</div>
  </div>
</template>

<style lang="scss">
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
  overflow: hidden; /* 防止整个页面滚动 */
}

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .header {
    background: linear-gradient(to right, #fdc1b7, #f5e9e6);
    height: 60px;
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
    min-height: 0; /* 关键：允许内部元素缩小 */
    overflow: hidden; /* 防止滚动条出现在这里 */
    .left,
    .right {
      flex: 1;
      padding: 20px;
      min-width: 0; /* 防止 flex 元素溢出 */
      display: flex;
      flex-direction: column;
    }
    
    .card {
      flex: 1;
      min-height: 0; /* 关键：允许内部元素缩小 */
      margin: 10px;
      border: 1px solid gray;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: white;
      display: flex;
      flex-direction: column;
      
      .part-title {
        background: linear-gradient(to right, #FAE1DD, #F8EDEB);
        padding: 10px;
        border-bottom: 1px solid gray;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      .part-textarea {
        flex: 1;
        min-height: 0;
        padding: 10px;
        display: flex;
       
        textarea {
          width: 100%;
          flex: 1;
          resize: none;
          border: 1px solid gray;
          border-radius: 4px;
          padding: 10px;
          font-family: inherit;
          font-size: 24px;
          overflow: auto; /* 内容多时显示滚动条 */
        }
      }
      
      .part-preview {
        flex: 1;
        min-height: 0;
        padding: 10px;
        display: flex;
        
        .box {
          width: 100%;
          flex: 1;
          border: 1px solid gray;
          border-radius: 4px;
          padding: 10px;
          font-size: 24px;
          overflow: auto; /* 内容多时显示滚动条 */
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
}

/* 添加表格样式以解决没有边框的问题 */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
}

ul, ol {
  padding-left: 20px;
}

pre[class*="language-"] {
  border-radius: 8px;
  margin: 1em 0;
  padding: 1em;
  overflow: auto;
  background: #f5f7ff;
  border: 1px solid #e1e4e8;
  
  code {
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 0.9em;
    line-height: 1.5;
  }
}

code:not([class*="language-"]) {
  background: #F8EDEB;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

</style>
