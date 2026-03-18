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

    // 先推一条空的 assistant 消息，后面往里追加内容
    messages.value.push({ role: 'assistant', content: '' })
    const assistantIndex = messages.value.length - 1

    isLoading.value = true

    const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
    const API_URL = import.meta.env.VITE_AI_API_URL
      || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    const MODEL_NAME = import.meta.env.VITE_AI_MODEL_NAME || 'qwen-turbo'

    if (!API_KEY) {
      messages.value[assistantIndex].content =
        '❌ 未配置 API Key。请在 .env.local 中设置 VITE_AI_API_KEY。'
      isLoading.value = false
      return
    }

    try {
      const requestMessages = messages.value
        .slice(0, -1) // 去掉刚推的空 assistant 消息，不发给 API
        .map(msg => ({ role: msg.role, content: msg.content }))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: requestMessages,
          temperature: 0.7,
          stream: true  // 开启流式
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || `HTTP ${response.status}`)
      }

      // 用 ReadableStream 逐块读取
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 按换行切割成 SSE 事件
        const lines = buffer.split('\n')
        buffer = lines.pop() // 最后一行可能不完整，留着等下次拼

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const chunk = JSON.parse(data)
            const delta = chunk.choices?.[0]?.delta?.content
            if (delta) {
              // 直接往那条 assistant 消息追加内容，Vue 响应式自动更新 UI
              messages.value[assistantIndex].content += delta
            }
          } catch {
            // 解析单个 chunk 失败就跳过，不影响整体
            continue
          }
        }
      }

    } catch (error) {
      console.error('AI Request Failed:', error)
      messages.value[assistantIndex].content =
        `❌ 请求失败: ${error.message}。请检查 API Key 和网络设置。`
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = [
      { role: 'assistant', content: '对话已清空。有什么可以帮你？' }
    ]
  }

  const convertToMarkdown = () => {
    return messages.value
      .map(m => {
        const role = m.role === 'user' ? '**我**' : '**AI**'
        return `> ${role}: ${m.content}\n`
      })
      .join('\n')
  }

  return { messages, isLoading, sendMessage, clearMessages, convertToMarkdown }
}