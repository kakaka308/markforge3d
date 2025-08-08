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
  <el-container style="height: 100vh">
    <!-- 顶部导航栏 -->
    <el-header style="background: #409EFF; color: white; font-size: 20px">
      MarkForge 3D 编辑器
    </el-header>

    <!-- 主体内容 -->
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
  </el-container>
</template>



