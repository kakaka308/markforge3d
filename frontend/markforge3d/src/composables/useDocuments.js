// src/composables/useDocuments.js
// 修复：新增自动保存，编辑内容停止 2s 后自动更新文档列表，
// 避免用户忘记点保存导致内容丢失。
import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { nanoid } from 'nanoid'

const STORAGE_KEY = 'markforge_docs'

export function useDocuments(currentContent, currentTitle) {
  const documents    = ref([])
  const currentDocId = ref(null)

  const loadDocs = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) documents.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载文档列表失败:', e)
      documents.value = []
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value))
    } catch (e) {
      console.error('保存文档列表失败:', e)
    }
  }

  // 标题变化实时同步到文档列表
  watch(currentTitle, (newTitle) => {
    if (!currentDocId.value) return
    const doc = documents.value.find(d => d.id === currentDocId.value)
    if (doc) {
      doc.title     = newTitle.trim() || '未命名文档'
      doc.updatedAt = new Date().toLocaleString()
      saveToStorage()
    }
  })

  const saveCurrentDoc = () => {
    if (!currentContent.value && !currentTitle.value) return

    const title = currentTitle.value.trim() || '未命名文档'
    const now   = new Date().toLocaleString()

    if (currentDocId.value) {
      const index = documents.value.findIndex(d => d.id === currentDocId.value)
      if (index !== -1) {
        documents.value[index] = {
          ...documents.value[index],
          title,
          content:   currentContent.value,
          updatedAt: now
        }
        // 置顶最近编辑的文档
        const updated = documents.value.splice(index, 1)[0]
        documents.value.unshift(updated)
      } else {
        _createInternal(title, now)
      }
    } else {
      _createInternal(title, now)
    }
    saveToStorage()
  }

  const _createInternal = (title, time) => {
    const newDoc = {
      id:        nanoid(),
      title,
      content:   currentContent.value,
      createdAt: time
    }
    documents.value.unshift(newDoc)
    currentDocId.value = newDoc.id
  }

  // 自动保存：内容停止编辑 2s 后自动保存到文档列表
  // 只在有 currentDocId（已有文档）或有内容时才触发，避免空文档写入列表
  watchDebounced(
    currentContent,
    () => {
      if (currentContent.value || currentDocId.value) {
        saveCurrentDoc()
      }
    },
    { debounce: 2000 }
  )

  const createNewDoc = () => {
    currentDocId.value = null
    localStorage.removeItem('draft')
    localStorage.removeItem('draft_title')
    return { content: '', title: '未命名文档' }
  }

  const updateDocTitle = (id, newTitle) => {
    const doc = documents.value.find(d => d.id === id)
    if (!doc) return
    doc.title = newTitle.trim() || '未命名文档'
    saveToStorage()
  }

  const deleteDoc = (id) => {
    documents.value = documents.value.filter(doc => doc.id !== id)
    if (currentDocId.value === id) currentDocId.value = null
    saveToStorage()
  }

  loadDocs()

  return {
    documents,
    currentDocId,
    saveCurrentDoc,
    createNewDoc,
    updateDocTitle,
    deleteDoc
  }
}