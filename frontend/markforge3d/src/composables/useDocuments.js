// src/composables/useDocuments.js
import { ref, watch } from 'vue'
import { nanoid } from 'nanoid' // 如果没有安装 nanoid，可以用 Date.now().toString()

const STORAGE_KEY = 'markforge_docs'

export function useDocuments(currentContent) {
  const documents = ref([])

  // 从 LocalStorage 加载
  const loadDocs = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      documents.value = JSON.parse(saved)
    }
  }

  // 保存当前文档
  const saveCurrentDoc = () => {
    if (!currentContent.value) return

    // 提取标题 (# 标题)
    const titleMatch = currentContent.value.match(/^#\s+(.*)/m)
    const title = titleMatch ? titleMatch[1] : '未命名文档'
    
    const newDoc = {
      id: nanoid(),
      title,
      content: currentContent.value,
      createdAt: new Date().toLocaleString()
    }

    documents.value.unshift(newDoc)
    saveToStorage()
  }

  const deleteDoc = (id) => {
    documents.value = documents.value.filter(doc => doc.id !== id)
    saveToStorage()
  }

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value))
  }

  loadDocs()

  return {
    documents,
    saveCurrentDoc,
    deleteDoc
  }
}