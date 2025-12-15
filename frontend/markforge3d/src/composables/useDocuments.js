// src/composables/useDocuments.js
import { ref, watch } from 'vue'
import { nanoid } from 'nanoid'

const STORAGE_KEY = 'markforge_docs'

export function useDocuments(currentContent, currentTitle) {
  const documents = ref([])
  const currentDocId = ref(null)

  const loadDocs = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      documents.value = JSON.parse(saved)
    }
  }

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value))
  }

  // 🔥 新增：监听 currentTitle 变化，实时更新文档列表中的标题
  watch(currentTitle, (newTitle) => {
    if (currentDocId.value) {
      const doc = documents.value.find(d => d.id === currentDocId.value)
      if (doc) {
        doc.title = newTitle.trim() || '未命名文档'
        doc.updatedAt = new Date().toLocaleString()
        saveToStorage() // 立即保存到 LocalStorage
      }
    }
  })

  // 保存当前文档（手动点击保存时触发，或新建保存）
  const saveCurrentDoc = () => {
    if (!currentContent.value && !currentTitle.value) return

    const title = currentTitle.value.trim() || '未命名文档'
    const now = new Date().toLocaleString()

    if (currentDocId.value) {
      // 覆盖更新
      const index = documents.value.findIndex(d => d.id === currentDocId.value)
      if (index !== -1) {
        documents.value[index] = {
          ...documents.value[index],
          title: title,
          content: currentContent.value,
          updatedAt: now
        }
        // 移到顶部
        const updatedDoc = documents.value.splice(index, 1)[0]
        documents.value.unshift(updatedDoc)
      } else {
        _createInternal(title, now)
      }
    } else {
      // 新建
      _createInternal(title, now)
    }
    saveToStorage()
  }

  const _createInternal = (title, time) => {
    const newDoc = {
      id: nanoid(),
      title,
      content: currentContent.value,
      createdAt: time
    }
    documents.value.unshift(newDoc)
    currentDocId.value = newDoc.id
  }

  const createNewDoc = () => {
    currentDocId.value = null
    currentContent.value = ''
    currentTitle.value = '未命名文档'
    localStorage.removeItem('draft')
    localStorage.removeItem('draft_title')
  }

  const updateDocTitle = (id, newTitle) => {
    const doc = documents.value.find(d => d.id === id)
    if (doc) {
      doc.title = newTitle.trim() || '未命名文档'
      saveToStorage()
      if (id === currentDocId.value) {
        currentTitle.value = doc.title
      }
    }
  }

  const deleteDoc = (id) => {
    documents.value = documents.value.filter(doc => doc.id !== id)
    if (currentDocId.value === id) {
      currentDocId.value = null
    }
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