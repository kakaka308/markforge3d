<script setup>
import parseMarkdown from 'markdown-three-parser'
import { ref, computed } from 'vue'

// 原始 Markdown 文本
const markdownText = ref(`# Hello Markdown

**这是粗体**
*这是斜体*

:::three cube:::
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
      <div class="left"></div>
      <div class="right"></div>
     </div>
    <el-main>
      <el-row :gutter="20" style="height: 100%">
        <!-- 左侧输入 -->
        <el-col :span="12" style="height: 100%">
          <el-card shadow="never" style="height: 100%">
            <template #header>Markdown 输入</template>
            <el-input
              type="textarea"
              v-model="markdownText"
              :rows="25"
              placeholder="输入 Markdown..."
              style="height: 100%"
            />
          </el-card>
        </el-col>

        <!-- 右侧渲染 -->
        <el-col :span="12" style="height: 100%">
          <el-card shadow="never" style="height: 100%">
            <template #header>HTML 预览</template>
            <div
              class="preview"
              v-html="renderedHtml"
              style="height: 100%; overflow-y: auto"
            ></div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 底部 -->
    <el-footer style="text-align: center; padding: 5px; font-size: 12px">
      MarkForge 3D © 2025
    </el-footer>
  </div>
</template>

<style>
body {
  font-size: 20px; /* 基础字体大小 */
  background-color: #f9f2f1;
}

/* 让 Element Plus 组件也变大 */
.el-input__inner,
.el-card__header,
.preview,
.el-header,
.el-footer {
  font-size: 16px !important;
}
.container {
  height: 100vh;
}
.header  {
  background:linear-gradient(to right, #fdc1b7, #f5e9e6); 
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .headertitle {
    margin: 10px;
  }
}
</style>

