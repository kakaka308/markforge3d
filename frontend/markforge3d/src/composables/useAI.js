// src/composables/useAI.js
import { ref } from 'vue'

export function useAI() {
  const messages = ref([
    { role: 'assistant', content: '你好！我是你的 AI 助手，有什么可以帮你？' }
  ])
  const isLoading = ref(false)

  const sendMessage = async (userText) => {
    if (!userText.trim()) return

    messages.value.push({ role: 'user', content: userText })
    isLoading.value = true

    try {
      // TODO: 替换为真实的 fetch 请求
      // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... })
      
      // 模拟延迟和回复
      await new Promise(r => setTimeout(r, 1000))
      const aiReply = `我收到了你的问题：“${userText}”。\n\n这是一个模拟回复。你可以在 useAI.js 中配置真实的 API。`
      
      messages.value.push({ role: 'assistant', content: aiReply })
    } catch (error) {
      messages.value.push({ role: 'assistant', content: '抱歉，连接 AI 服务失败。' })
    } finally {
      isLoading.value = false
    }
  }

  // 将对话转换为 Markdown 文档
  const convertToMarkdown = () => {
    return messages.value.map(m => {
      const role = m.role === 'user' ? '**我**' : '**AI**'
      return `> ${role}: ${m.content}\n`
    }).join('\n')
  }

  return { messages, isLoading, sendMessage, convertToMarkdown }
}