<script setup>
import { ref, nextTick, inject, watch } from 'vue'
import { useAI } from '../composables/useAI'

const isOpen = ref(false)
const inputVal = ref('')
const chatBox = ref(null)
const { messages, isLoading, sendMessage, convertToMarkdown } = useAI()

// 接收父组件传递的创建文档方法
const emit = defineEmits(['create-doc'])

const toggle = () => isOpen.value = !isOpen.value

// 发送消息
const send = async () => {
  if (!inputVal.value.trim()) return
  const text = inputVal.value
  inputVal.value = ''
  await sendMessage(text)
  scrollToBottom()
}

// 导出为文档
const saveAsDoc = () => {
  const content = convertToMarkdown()
  emit('create-doc', `# AI 对话记录 ${new Date().toLocaleDateString()}\n\n${content}`)
  isOpen.value = false // 保存后自动关闭
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}

// 监听打开状态，打开时聚焦输入框
watch(isOpen, (val) => {
  if (val) {
    scrollToBottom()
    nextTick(() => document.querySelector('.ai-input input')?.focus())
  }
})
</script>

<template>
  <div class="ai-wrapper">
    <button class="ai-toggle" @click="toggle" :class="{ active: isOpen }" title="AI 助手">
      <span v-if="!isOpen">✨</span>
      <span v-else>×</span>
    </button>

    <transition name="fade">
      <div v-if="isOpen" class="ai-overlay" @click="toggle"></div>
    </transition>

    <transition name="scale-up">
      <div v-if="isOpen" class="ai-panel">
        
        <div class="panel-header">
          <div class="title">
            <span class="icon">🤖</span>
            <span>AI 智能助手</span>
          </div>
          <div class="actions">
            <button class="action-btn save" @click="saveAsDoc" title="将对话保存为新文档">
              💾 转为文档
            </button>
          </div>
        </div>

        <div class="chat-list" ref="chatBox">
          <div v-if="messages.length === 0" class="empty-state">
            👋 你好！我是你的 AI 助手，有什么可以帮你？
          </div>
          
          <div v-for="(msg, i) in messages" :key="i" class="message-row" :class="msg.role">
            <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
            <div class="bubble">
              <div class="content">{{ msg.content }}</div>
            </div>
          </div>

          <div v-if="isLoading" class="message-row assistant">
            <div class="avatar">🤖</div>
            <div class="bubble loading">
              <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="ai-input">
            <input 
              v-model="inputVal" 
              @keyup.enter="send" 
              placeholder="输入你的问题..." 
              :disabled="isLoading"
            />
            <button class="send-btn" @click="send" :disabled="isLoading || !inputVal">
              ➤
            </button>
          </div>
        </div>

      </div>
    </transition>
  </div>
</template>

<style scoped>
/* --- 1. 悬浮按钮 --- */
.ai-toggle {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #8e44ad);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  font-size: 28px;
  cursor: pointer;
  z-index: 5000;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-toggle:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

.ai-toggle.active {
  background: #555;
  transform: rotate(90deg);
}

/* --- 2. 遮罩层 --- */
.ai-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4); /* 深色遮罩 */
  backdrop-filter: blur(2px);     /* 背景微糊 */
  z-index: 4998;
}

/* --- 3. 中央面板 (Glassmorphism 风格) --- */
.ai-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  max-width: 90vw;
  height: 600px;
  max-height: 85vh;
  z-index: 4999;
  
  display: flex;
  flex-direction: column;
  
  /* 核心磨砂效果 */
  background: rgba(255, 255, 255, 0.75); /* 浅色半透明 */
  backdrop-filter: blur(20px);           /* 强模糊 */
  -webkit-backdrop-filter: blur(20px);
  
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 深色模式适配 */
:global(.dark-mode) .ai-panel {
  background: rgba(30, 30, 30, 0.75); /* 深色半透明 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

/* --- 面板内部布局 --- */
.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.1); /* 头部微亮 */
}
:global(.dark-mode) .panel-header { border-bottom-color: rgba(255,255,255,0.1); }

.title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,0.2);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.action-btn:hover { background: var(--color-accent); color: white; border-color: transparent;}

/* 聊天列表 */
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  margin-top: 100px;
  color: var(--text-secondary);
  font-size: 16px;
  opacity: 0.8;
}

.message-row {
  display: flex;
  gap: 12px;
  max-width: 85%;
}
.message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
:global(.dark-mode) .avatar { background: rgba(255,255,255,0.1); }

.bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  word-break: break-word;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* 气泡颜色 */
.assistant .bubble {
  background: var(--bg-surface); /* 跟随主题表面色 */
  color: var(--text-primary);
  border-top-left-radius: 2px;
}
.user .bubble {
  background: var(--color-accent);
  color: white;
  border-top-right-radius: 2px;
}

/* 输入区 */
.input-area {
  padding: 20px;
  /* background: rgba(255,255,255,0.2); */
  border-top: 1px solid rgba(0,0,0,0.05);
}
:global(.dark-mode) .input-area { border-top-color: rgba(255,255,255,0.1); }

.ai-input {
  display: flex;
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid transparent;
  transition: border 0.2s;
}
.ai-input:focus-within {
  border-color: var(--color-accent);
}

.ai-input input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 15px;
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
}

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  border: none;
  background: var(--color-accent);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 动画定义 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-up-enter-active, .scale-up-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-up-enter-from, .scale-up-leave-to { 
  opacity: 0; 
  transform: translate(-50%, -50%) scale(0.9); 
}

/* Loading 动画点 */
.loading .dot {
  animation: bounce 1.4s infinite ease-in-out both;
  display: inline-block;
  margin: 0 1px;
}
.loading .dot:nth-child(1) { animation-delay: -0.32s; }
.loading .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>