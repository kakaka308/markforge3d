<script setup>
import { ref, nextTick } from 'vue'
import { useAI } from '../composables/useAI'

const isOpen = ref(false)
const inputVal = ref('')
const chatBox = ref(null)
const { messages, isLoading, sendMessage, convertToMarkdown } = useAI()

const emit = defineEmits(['create-doc'])

const toggle = () => isOpen.value = !isOpen.value

const send = async () => {
  if (!inputVal.value) return
  const text = inputVal.value
  inputVal.value = ''
  await sendMessage(text)
  scrollToBottom()
}

const saveAsDoc = () => {
  const content = convertToMarkdown()
  emit('create-doc', `# AI 对话记录 ${new Date().toLocaleDateString()}\n\n${content}`)
  alert('对话已生成新文档！')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}
</script>

<template>
  <div class="ai-wrapper" :class="{ open: isOpen }">
    <div class="ai-toggle" @click="toggle">🤖</div>
    
    <div class="ai-panel" v-if="isOpen">
      <div class="ai-header">
        <span>AI 助手</span>
        <button @click="saveAsDoc" title="生成文档">💾 转为文档</button>
      </div>
      
      <div class="chat-list" ref="chatBox">
        <div v-for="(msg, i) in messages" :key="i" class="msg" :class="msg.role">
          <div class="bubble">{{ msg.content }}</div>
        </div>
        <div v-if="isLoading" class="msg assistant"><div class="bubble">思考中...</div></div>
      </div>

      <div class="input-area">
        <input 
          v-model="inputVal" 
          @keyup.enter="send" 
          placeholder="输入问题..." 
          :disabled="isLoading"
        />
        <button @click="send" :disabled="isLoading">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.ai-toggle {
  width: 50px;
  height: 50px;
  background: var(--color-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.ai-toggle:hover { transform: scale(1.1); }

.ai-panel {
  width: 350px;
  height: 500px;
  background: var(--bg-color);
  border: 1px solid #ccc;
  border-radius: 12px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  overflow: hidden;
}

.ai-header {
  padding: 10px 15px;
  background: var(--bg-toolbar);
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.ai-header button { font-size: 12px; padding: 4px 8px; cursor: pointer; }

.chat-list { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
.msg { display: flex; }
.msg.user { justify-content: flex-end; }
.msg.assistant { justify-content: flex-start; }
.bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
}
.user .bubble { background: var(--color-accent); color: white; }
.assistant .bubble { background: var(--bg-th); color: var(--color); border: 1px solid #ddd; }

.input-area {
  padding: 10px;
  border-top: 1px solid #ccc;
  display: flex;
  gap: 5px;
}
.input-area input { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: var(--bg-color); color: var(--color);}
.input-area button { padding: 0 15px; cursor: pointer; }
</style>