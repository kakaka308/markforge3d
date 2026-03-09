<script setup>
import { ref, nextTick, inject, watch } from 'vue'
import { useAI } from '../composables/useAI'
import { useAgent } from '../composables/useAgent'

const emit = defineEmits(['create-doc'])

// ── 模式切换：chat = 普通聊天，agent = 编辑器操作 ──────────────
const mode = ref('agent')  // 默认打开 agent 模式

// ── 普通聊天 ───────────────────────────────────────────────────
const isOpen   = ref(false)
const inputVal = ref('')
const chatBox  = ref(null)
const { messages, isLoading, sendMessage, convertToMarkdown } = useAI()

// ── Agent ──────────────────────────────────────────────────────
const agentInput = ref('')
const agentLogBox = ref(null)
const { runAgent, isRunning, agentLog } = useAgent()

// App.vue 通过 provide 注入编辑器操作函数
const insertMarkdown = inject('insertMarkdown')
const markdownInput  = inject('markdownInput')   // 需要在 App.vue 里 provide

const toggle = () => { isOpen.value = !isOpen.value }

// ── 普通聊天发送 ───────────────────────────────────────────────
const send = async () => {
  if (!inputVal.value.trim()) return
  const text = inputVal.value
  inputVal.value = ''
  await sendMessage(text)
  scrollChatToBottom()
}

// ── Agent 执行 ─────────────────────────────────────────────────
const runAgentCmd = async () => {
  if (!agentInput.value.trim() || isRunning.value) return
  const instruction = agentInput.value
  agentInput.value = ''

  await runAgent(instruction, { markdownInput, insertMarkdown })
  scrollAgentToBottom()
}

const saveAsDoc = () => {
  const content = convertToMarkdown()
  emit('create-doc', `# AI 对话记录 ${new Date().toLocaleDateString()}\n\n${content}`)
  isOpen.value = false
}

const scrollChatToBottom = () => {
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
}
const scrollAgentToBottom = () => {
  nextTick(() => { if (agentLogBox.value) agentLogBox.value.scrollTop = agentLogBox.value.scrollHeight })
}

watch(agentLog, scrollAgentToBottom, { deep: true })

watch(isOpen, (val) => {
  if (val && mode.value === 'chat') {
    scrollChatToBottom()
    nextTick(() => document.querySelector('.ai-input input')?.focus())
  }
})

// 快捷指令——点一下就填入输入框
const quickCommands = [
  { label: '📝 生成大纲', cmd: '根据当前文档标题，生成一个完整的文章大纲，包含二级和三级标题，追加到文档末尾' },
  { label: '✨ 润色全文', cmd: '润色当前文档，保持原意但让语言更流畅专业，替换整个文档' },
  { label: '📊 生成表格', cmd: '根据文档内容生成一个总结性对比表格，追加到末尾' },
  { label: '🔢 添加代码示例', cmd: '为文档中的技术概念添加一个 JavaScript 代码示例，追加到末尾' },
]
</script>

<template>
  <div class="ai-wrapper">
    <!-- 悬浮按钮 -->
    <button class="ai-toggle" @click="toggle" :class="{ active: isOpen }" title="AI 助手">
      <span v-if="!isOpen">✨</span>
      <span v-else>×</span>
    </button>

    <transition name="fade">
      <div v-if="isOpen" class="ai-overlay" @click="toggle"></div>
    </transition>

    <transition name="scale-up">
      <div v-if="isOpen" class="ai-panel">

        <!-- 顶部 Tab -->
        <div class="panel-header">
          <div class="tabs">
            <button class="tab-btn" :class="{ active: mode === 'agent' }" @click="mode = 'agent'">
              🤖 Agent 编辑
            </button>
            <button class="tab-btn" :class="{ active: mode === 'chat' }" @click="mode = 'chat'">
              💬 AI 对话
            </button>
          </div>
          <button v-if="mode === 'chat'" class="action-btn" @click="saveAsDoc" title="保存为文档">
            💾 转为文档
          </button>
        </div>

        <!-- ══ Agent 模式 ══ -->
        <template v-if="mode === 'agent'">

          <!-- 快捷指令 -->
          <div class="quick-commands">
            <button
              v-for="q in quickCommands"
              :key="q.label"
              class="quick-btn"
              @click="agentInput = q.cmd"
              :disabled="isRunning"
            >
              {{ q.label }}
            </button>
          </div>

          <!-- Agent 执行日志 -->
          <div class="agent-log" ref="agentLogBox">
            <div v-if="agentLog.length === 0" class="empty-state">
              输入指令，让 AI 直接操作你的文档
            </div>

            <div
              v-for="(entry, i) in agentLog"
              :key="i"
              class="log-entry"
              :class="entry.type"
            >
              <span class="log-msg">{{ entry.message }}</span>
            </div>

            <!-- 执行中的动态指示 -->
            <div v-if="isRunning" class="log-entry thinking running">
              <span class="dot">·</span><span class="dot">·</span><span class="dot">·</span>
            </div>
          </div>

          <!-- Agent 输入区 -->
          <div class="input-area">
            <div class="ai-input">
              <input
                v-model="agentInput"
                @keyup.enter="runAgentCmd"
                placeholder="指令 AI 操作编辑器，例如：帮我写一篇关于 Vue3 的介绍"
                :disabled="isRunning"
              />
              <button class="send-btn" @click="runAgentCmd" :disabled="isRunning || !agentInput">
                {{ isRunning ? '⏳' : '➤' }}
              </button>
            </div>
          </div>
        </template>

        <!-- ══ 普通聊天模式 ══ -->
        <template v-else>
          <div class="chat-list" ref="chatBox">
            <div v-if="messages.length === 0" class="empty-state">
              👋 你好！有什么可以帮你？
            </div>

            <div v-for="(msg, i) in messages" :key="i" class="message-row" :class="msg.role">
              <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
              <div class="bubble">{{ msg.content }}</div>
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
              <button class="send-btn" @click="send" :disabled="isLoading || !inputVal">➤</button>
            </div>
          </div>
        </template>

      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ── 悬浮按钮 ── */
.ai-toggle {
  position: fixed;
  bottom: 30px; right: 30px;
  width: 60px; height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #8e44ad);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  font-size: 28px;
  cursor: pointer;
  z-index: 5000;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex; align-items: center; justify-content: center;
}
.ai-toggle:hover { transform: scale(1.1) rotate(15deg); }
.ai-toggle.active { background: #555; transform: rotate(90deg); }

/* ── 遮罩 ── */
.ai-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  z-index: 4998;
}

/* ── 面板 ── */
.ai-panel {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 820px; max-width: 92vw;
  height: 620px; max-height: 88vh;
  z-index: 4999;
  display: flex; flex-direction: column;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  overflow: hidden;
}
:global(.dark-mode) .ai-panel {
  background: rgba(30,30,30,0.78);
  border-color: rgba(255,255,255,0.1);
}

/* ── Tab 头部 ── */
.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
:global(.dark-mode) .panel-header { border-bottom-color: rgba(255,255,255,0.08); }

.tabs { display: flex; gap: 6px; }

.tab-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: var(--color-accent);
  color: white;
  border-color: transparent;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer; font-size: 13px;
  transition: all 0.2s;
}
.action-btn:hover { background: var(--color-accent); color: white; border-color: transparent; }

/* ── 快捷指令 ── */
.quick-commands {
  padding: 10px 16px;
  display: flex; flex-wrap: wrap; gap: 6px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  flex-shrink: 0;
}
:global(.dark-mode) .quick-commands { border-bottom-color: rgba(255,255,255,0.06); }

.quick-btn {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.quick-btn:hover:not(:disabled) {
  background: var(--color-accent);
  color: white; border-color: transparent;
}
.quick-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Agent 日志区 ── */
.agent-log {
  flex: 1; overflow-y: auto;
  padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
}

.log-entry {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  animation: fadeInUp 0.25s ease;
}

.log-entry.thinking {
  background: rgba(100, 181, 246, 0.12);
  border-left: 3px solid #64b5f6;
  color: var(--text-primary);
}
.log-entry.action {
  background: rgba(129, 199, 132, 0.12);
  border-left: 3px solid #81c784;
  color: var(--text-primary);
}
.log-entry.done {
  background: rgba(var(--color-accent-rgb, 100,181,246), 0.1);
  border-left: 3px solid var(--color-accent);
  color: var(--text-primary);
  font-weight: 500;
}
.log-entry.error {
  background: rgba(229, 115, 115, 0.12);
  border-left: 3px solid #e57373;
  color: #e57373;
}
.log-entry.running {
  background: rgba(100, 181, 246, 0.08);
  border-left: 3px solid #64b5f6;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 普通聊天 ── */
.chat-list {
  flex: 1; overflow-y: auto;
  padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}

.message-row {
  display: flex; gap: 12px; max-width: 85%;
}
.message-row.user { align-self: flex-end; flex-direction: row-reverse; }

.avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
:global(.dark-mode) .avatar { background: rgba(255,255,255,0.1); }

.bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px; line-height: 1.6;
  word-break: break-word;
}
.assistant .bubble { background: var(--bg-surface); color: var(--text-primary); border-top-left-radius: 2px; }
.user .bubble      { background: var(--color-accent); color: white; border-top-right-radius: 2px; }

/* ── 输入区（共用）── */
.input-area {
  padding: 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
}
:global(.dark-mode) .input-area { border-top-color: rgba(255,255,255,0.08); }

.ai-input {
  display: flex;
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid transparent;
  transition: border 0.2s;
}
.ai-input:focus-within { border-color: var(--color-accent); }

.ai-input input {
  flex: 1; border: none; background: transparent;
  padding: 10px 14px; font-size: 14px;
  color: var(--text-primary); outline: none;
}

.send-btn {
  width: 40px; height: 40px;
  border-radius: 8px; border: none;
  background: var(--color-accent);
  color: white; font-size: 16px;
  cursor: pointer; transition: opacity 0.2s;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── 空状态 ── */
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 60px 20px;
  opacity: 0.7;
}

/* ── 动画点 ── */
.dot { animation: bounce 1.4s infinite ease-in-out both; display: inline-block; margin: 0 1px; }
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ── 过渡动画 ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-up-enter-active, .scale-up-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-up-enter-from, .scale-up-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
</style>