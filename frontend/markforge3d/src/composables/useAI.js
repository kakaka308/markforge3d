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
      // ================= 配置区域 =================
      // 建议：实际项目中请在 .env 文件中使用 import.meta.env.VITE_API_KEY 获取，不要直接硬编码
      const API_KEY = 'sk-000'; // 🔴 替换为你的 API Key
      const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'; // 🔴 替换为服务商的 Base URL (例如 DeepSeek 是 https://api.deepseek.com/chat/completions)
      const MODEL_NAME = 'qwen-turbo'; // 🔴 替换为模型名称 (例如 deepseek-chat, qwen-turbo)
      // ===========================================

      // 准备请求体：将当前的历史消息记录 (messages.value) 发送给 AI，这样它就有上下文记忆
      // map 用于确保只发送 API 需要的 role 和 content 字段
      const requestMessages = messages.value.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // 发起请求
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: requestMessages,
          temperature: 0.7, // 随机性 (0-2)，越低越严谨，越高越发散
          stream: false     // 这里演示非流式传输，如果需要打字机效果需要改写为流式
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // 处理 API 返回的错误信息
        const errorMsg = data.error?.message || `HTTP Error ${response.status}`
        throw new Error(errorMsg)
      }

      // 获取 AI 的回复内容
      const aiReply = data.choices?.[0]?.message?.content || '未收到回复内容'
      
      // 添加到对话列表
      messages.value.push({ role: 'assistant', content: aiReply })

    } catch (error) {
      console.error('AI Request Failed:', error)
      messages.value.push({ 
        role: 'assistant', 
        content: `❌ 请求失败: ${error.message}。请检查 API Key 和网络设置。` 
      })
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