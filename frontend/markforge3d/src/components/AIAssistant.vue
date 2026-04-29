<script setup>
import { ref, nextTick, inject, watch, computed } from 'vue'
import { useAI } from '../composables/useAI'
import { useAgent } from '../composables/useAgent'
import { 
  Edit, Refresh, DocumentAdd, 
  List, Grid, Monitor, Check, 
  MagicStick, Rank, Switch, 
  Notebook, Files, Ticket,
  ChatLineRound, DeleteFilled, User
} from '@element-plus/icons-vue'
const emit = defineEmits(['create-doc'])

// ── 面板开关 & Tab ───────────────────────────────────────────
const isOpen = ref(false)
const mode   = ref('agent')   // 'agent' | 'chat'

// ── 目标模式（agent 和 chat 共用）───────────────────────────
// 'insert'    插入当前文档
// 'overwrite' 覆盖当前文档
// 'new'       新建文档
const targetMode = ref('insert')

const targetOptions = [
  { value: 'insert',    icon: Edit, label: '插入当前文档' },
  { value: 'overwrite', icon: Refresh, label: '覆盖当前文档' },
  { value: 'new',       icon: DocumentAdd, label: '新建文档'     }
]

// ── 注入（App.vue 必须 provide 这三个）──────────────────────
const insertMarkdown = inject('insertMarkdown')
const markdownInput  = inject('markdownInput')
const docTitle       = inject('docTitle')

// ── 普通聊天 ────────────────────────────────────────────────
const chatBox  = ref(null)
const inputVal = ref('')
const { messages, isLoading, sendMessage, clearMessages, convertToMarkdown } = useAI()
// 键盘事件
const send = async () => {
  if (!inputVal.value.trim() || isLoading.value) return
  const text = inputVal.value
  inputVal.value = ''
  await sendMessage(text)
  scrollTo(chatBox)
}

// 将聊天内容写入编辑器，根据 targetMode 决定行为
const applyChat = () => {
  const title = `AI 对话记录 ${new Date().toLocaleDateString()}`
  const fullContent = `# ${title}\n\n${convertToMarkdown()}`

  if (targetMode.value === 'new') {
    emit('create-doc', { title, content: fullContent })
  } else if (targetMode.value === 'overwrite') {
    if (docTitle) docTitle.value = title
    markdownInput.value = fullContent
  } else {
    // insert：追加到末尾
    markdownInput.value = markdownInput.value
      ? markdownInput.value + '\n\n' + fullContent
      : fullContent
  }
  isOpen.value = false
}

// ── Agent ────────────────────────────────────────────────────
const agentInput  = ref('')
const agentLogBox = ref(null)
const { runAgent, isRunning, agentLog } = useAgent()

const runAgentCmd = async () => {
  if (!agentInput.value.trim() || isRunning.value) return
  const instruction = agentInput.value
  agentInput.value = ''

  await runAgent(instruction, targetMode.value, {
    markdownInput,
    insertMarkdown,
    docTitle,
    emit: (event, payload) => emit(event, payload)
  })
}

// ── 快捷指令（根据 targetMode 切换） ─────────────────────────
const quickCommands = computed(() => {
  if (targetMode.value === 'insert') {
    return [
      { label: '生成大纲', cmd: '根据当前文档内容生成详细大纲（含二三级标题），追加到末尾', icon: List },
      { label: '添加表格', cmd: '根据文档内容生成一个总结性对比表格，追加到末尾', icon: Grid },
      { label: '添加代码示例', cmd: '为文档中的技术概念补充代码示例，追加到末尾', icon: Monitor  },
      { label: '添加总结', cmd: '根据文档内容生成总结段落，追加到末尾', icon: Check }
    ]
  } else if (targetMode.value === 'overwrite') {
    return [
      { label: '润色全文', cmd: '润色当前文档，保持原意，让语言更流畅专业，重写整篇', icon: MagicStick },
      { label: '重构结构', cmd: '重新组织文档结构，改善标题层级和段落逻辑，重写整篇', icon: Rank },
      { label: '翻译为英文', cmd: '将当前文档翻译为英文，保持 Markdown 格式不变', icon: Switch  }
    ]
  } else {
    return [
      { label: 'Vue3 入门', cmd: '写一篇 Vue3 Composition API 入门教程，包含代码示例', icon: Notebook },
      { label: '技术方案', cmd: '写一份前端技术方案文档模板，含背景、方案对比、结论', icon: Files },
      { label: '周报模板', cmd: '生成一份本周技术工作周报，含本周完成、下周计划、风险', icon: Ticket }
    ]
  }
})

// ── 工具函数 ─────────────────────────────────────────────────
const toggle = () => { isOpen.value = !isOpen.value }

const scrollTo = (boxRef) => {
  nextTick(() => {
    if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight
  })
}

watch(agentLog, () => scrollTo(agentLogBox), { deep: true })

watch(isOpen, (val) => {
  if (val && mode.value === 'chat') scrollTo(chatBox)
})
</script>

<template>
  <div class="ai-wrapper">

    <!-- 悬浮按钮 -->
    <button class="ai-toggle" @click="toggle" :class="{ active: isOpen }" title="AI 助手">
      <span v-if="!isOpen">✨</span>
      <span v-else>×</span>
    </button>

    <transition name="fade">
      <div v-if="isOpen" class="ai-overlay" @click="toggle" />
    </transition>

    <transition name="scale-up">
      <div v-if="isOpen" class="ai-panel">

        <!-- 顶部：Tab + 目标模式选择器 -->
        <div class="panel-header">
          <div class="tabs">
            <button class="tab-btn" :class="{ active: mode === 'agent' }" @click="mode = 'agent'">
              <component :is="List" style="width: 0.9em; height: 0.9em; margin-right: 4px;" />
              Agent
            </button>
            <button class="tab-btn" :class="{ active: mode === 'chat' }" @click="mode = 'chat'">
              <component :is="ChatLineRound" style="width: 0.9em; height: 0.9em; margin-right: 4px;" />
              对话
            </button>
          </div>

          <!-- 目标模式（两个 tab 共用） -->
           <div class="target-selector">
            <button
              v-for="opt in targetOptions"
              :key="opt.value"
              class="target-btn"
              :class="{ active: targetMode === opt.value }"
              @click="targetMode = opt.value"
              :title="opt.label"
            >
              <component :is="opt.icon" style="width: 1em; height: 1em; vertical-align: middle; margin-right: 4px;" />
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- 快捷指令（根据 targetMode 动态变化） -->
        <div class="quick-commands">
          <button
            v-for="q in quickCommands"
            :key="q.label"
            class="quick-btn"
            @click="agentInput = q.cmd; mode = 'agent'"
            :disabled="isRunning"
          >
          <component :is="q.icon" style="width: 1em; height: 1em; margin-right: 4px; vertical-align: middle;" />
            {{ q.label }}
          </button>
        </div>

        <!-- ══ Agent 模式 ══ -->
        <template v-if="mode === 'agent'">

          <div class="agent-log" ref="agentLogBox">
            <!-- 空状态 -->
            <div v-if="agentLog.length === 0" class="empty-state">
              <div class="empty-icon">
                <component :is="Monitor" style="width: 2em; height: 2em;" />
              </div>
              <div>输入指令，让 AI 直接操作你的文档</div>
              <div class="empty-sub">
                当前：{{ targetOptions.find(o => o.value === targetMode)?.label }}
              </div>
            </div>
            <!-- 日志列表 -->
            <div
              v-for="(entry, i) in agentLog"
              :key="i"
              class="log-entry"
              :class="entry.type"
            >
              {{ entry.message }}
            </div>
            <!-- 思考中 -->
            <div v-if="isRunning" class="log-entry thinking">
              <span class="dot">·</span><span class="dot">·</span><span class="dot">·</span>
            </div>
          </div>
          <!-- 输入框 -->
          <div class="input-area">
            <div class="ai-input">
              <input
                v-model="agentInput"
                @keyup.enter="runAgentCmd"
                :placeholder="`指令 AI ${targetOptions.find(o => o.value === targetMode)?.label}，例如：写一篇 Vue3 入门教程`"
                :disabled="isRunning"
              />
              <button class="send-btn" @click="runAgentCmd" :disabled="isRunning || !agentInput">
                {{ isRunning ? '⏳' : '➤' }}
              </button>
            </div>
          </div>
        </template>

        <!-- ══ 普通对话模式 ══ -->
        <template v-else>
          <div class="chat-list" ref="chatBox">
            <!-- 空状态 -->
            <div v-if="messages.length === 0" class="empty-state">
              <div class="empty-icon">
                <component :is="ChatLineRound" style="width: 2em; height: 2em;" />
              </div>
              <div>有什么可以帮你？</div>
            </div>
            <!-- 消息列表 -->
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="message-row"
              :class="msg.role"
            >
              <div class="avatar">
                <component :is="msg.role === 'user' ? User : Monitor" style="width: 1.2em; height: 1.2em;" />
              </div>
              <div class="bubble">{{ msg.content }}</div>
            </div>
            <!-- 思考中 -->
            <div v-if="isLoading" class="message-row assistant">
              <div class="avatar">
                <component :is="ChatLineRound" style="width: 1.5em; height: 1.5em;" />
              </div>
              <div class="bubble">
                <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
              </div>
            </div>
          </div>
          <!-- 输入框 -->
          <div class="input-area">
            <div class="chat-actions">
              <button class="action-btn" @click="clearMessages" title="清空对话">
                <component :is="DeleteFilled" style="width: 0.9em; height: 0.9em; margin-right: 4px;" />
                
                清空
              </button>
              <button
                class="apply-btn"
                @click="applyChat"
                :disabled="messages.length <= 1"
                :title="`将对话写入（${targetOptions.find(o => o.value === targetMode)?.label}）`"
              >
                <component :is="targetOptions.find(o => o.value === targetMode)?.icon" style="width: 0.9em; height: 0.9em; margin-right: 4px;" />
                写入（{{ targetOptions.find(o => o.value === targetMode)?.label }}）
              </button>
            </div>
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
  color: white; border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  font-size: 28px; cursor: pointer;
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
  width: 860px; max-width: 93vw;
  height: 640px; max-height: 88vh;
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
:global(html.dark-mode .ai-panel) {
  background: rgba(30, 32, 38, 0.96);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}

/* ── Header ── */
.panel-header {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex; align-items: center; gap: 12px;
  flex-shrink: 0; flex-wrap: wrap;
}
:global(.dark-mode) .panel-header {
  border-bottom-color: rgba(255,255,255,0.1);
}

/* ── Tab ── */
.tabs { display: flex; gap: 4px; }
.tab-btn {
  padding: 5px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.tab-btn.active { background: var(--color-accent); color: white; border-color: transparent; }
:global(.dark-mode .tab-btn)  {
  color: rgba(255,255,255,0.7);
  border-color: rgba(255,255,255,0.15);
}
:global(.dark-mode .tab-btn:hover:not(.active))  {
  background: rgba(255,255,255,0.08);
}

/* ── 目标模式选择器 ── */
.target-selector { display: flex; gap: 4px; margin-left: auto; flex-wrap: wrap; }
.target-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.target-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(100,181,246,0.08);
  font-weight: 600;
}
.target-btn:hover:not(.active) { background: var(--bg-hover, rgba(0,0,0,0.04)); }
:global(.dark-mode .target-btn)  {
  color: rgba(255,255,255,0.65);
  border-color: rgba(255,255,255,0.15);
}
:global(.dark-mode .target-btn:hover:not(.active))  {
  background: rgba(255,255,255,0.08);
}
:global(.dark-mode .target-btn.active)  {
  color: #90caf9;
  border-color: #90caf9;
  background: rgba(144,202,249,0.12);
}

/* ── 快捷指令 ── */
.quick-commands {
  padding: 8px 14px;
  display: flex; flex-wrap: wrap; gap: 6px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  flex-shrink: 0;
}
.quick-btn {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 12px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.quick-btn:hover:not(:disabled) { background: var(--color-accent); color: white; border-color: transparent; }
.quick-btn:disabled { opacity: 0.4; cursor: not-allowed; }
:global(.dark-mode .quick-commands)  {
  border-bottom-color: rgba(255,255,255,0.08);
}
:global(.dark-mode .quick-btn)  {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.8);
}
:global(.dark-mode .quick-btn:hover:not(:disabled))  {
  background: var(--color-accent);
  color: white;
  border-color: transparent;
}

/* ── Agent 日志 ── */
.agent-log {
  flex: 1; overflow-y: auto;
  padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.log-entry {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px; line-height: 1.5;
  animation: fadeSlideIn 0.2s ease;
}
.log-entry.thinking { background: rgba(100,181,246,0.2); border-left: 3px solid #64b5f6; color: var(--text-primary); }
.log-entry.action   { background: rgba(129,199,132,0.2); border-left: 3px solid #81c784; color: var(--text-primary); }
.log-entry.done     { background: rgba(100,181,246,0.2); border-left: 3px solid var(--color-accent); color: var(--text-primary); font-weight: 500; }
.log-entry.error    { background: rgba(229,115,115,0.2); border-left: 3px solid #e57373; color: #e57373; }
:global(.dark-mode .log-entry.thinking)  {
  background: rgba(144,202,249,0.1);
  border-left-color: #90caf9;
  color: rgba(255,255,255,0.88);
}
:global(.dark-mode .log-entry.action)  {
  background: rgba(129,199,132,0.1);
  border-left-color: #81c784;
  color: rgba(255,255,255,0.88);
}
:global(.dark-mode .log-entry.done)  {
  background: rgba(144,202,249,0.08);
  border-left-color: #90caf9;
  color: rgba(255,255,255,0.88);
}
:global(.dark-mode .log-entry.error)  {
  background: rgba(229,115,115,0.12);
  border-left-color: #ef9a9a;
  color: #ef9a9a;
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 聊天列表 ── */
.chat-list {
  flex: 1; overflow-y: auto;
  padding: 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.message-row { display: flex; gap: 10px; max-width: 85%; }
.message-row.user { align-self: flex-end; flex-direction: row-reverse; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0,0,0,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}

.bubble { padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.6; word-break: break-word; }
.assistant .bubble { background: var(--bg-surface); color: var(--text-primary); border-top-left-radius: 2px; }
.user .bubble      { background: var(--color-accent); color: white; border-top-right-radius: 2px; }
:global(.dark-mode .assistant .bubble)  {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.88);
}
:global(.dark-mode .avatar) {
  background: rgba(255,255,255,0.1);
}

/* ── 输入区 ── */
.input-area {
  padding: 12px 14px;
  border-top: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.chat-actions { display: flex; justify-content: flex-end; gap: 8px; }
.action-btn {
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent; color: var(--text-secondary);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: var(--bg-surface); }
.apply-btn {
  padding: 6px 14px; border-radius: 8px;
  border: 1px solid var(--color-accent);
  background: transparent; color: var(--color-accent);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.apply-btn:hover:not(:disabled) { background: var(--color-accent); color: white; }
.apply-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.ai-input {
  display: flex;
  background: var(--bg-surface);
  border-radius: 12px; padding: 4px;
  border: 1px solid transparent; transition: border 0.2s;
}
.ai-input:focus-within { border-color: var(--color-accent); }
.ai-input input {
  flex: 1; border: none; background: transparent;
  padding: 9px 12px; font-size: 14px;
  color: var(--text-primary); outline: none;
}
.send-btn {
  width: 38px; height: 38px; border-radius: 8px; border: none;
  background: var(--color-accent); color: white; font-size: 15px;
  cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s;
}
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
:global(.dark-mode .input-area) {
  border-top-color: rgba(255,255,255,0.08);
}
:global(.dark-mode .ai-input) {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.1);
}
:global(.dark-mode .ai-input:focus-within) {
  border-color: #90caf9;
}
:global(.dark-mode .ai-input input) {
  color: rgba(255,255,255,0.9);
}
:global(.dark-mode .ai-input input::placeholder)  {
  color: rgba(255,255,255,0.35);
}

/* ── 空状态 ── */
.empty-state {
  text-align: center; color: var(--text-secondary);
  padding: 50px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.empty-icon { font-size: 36px; }
.empty-sub  { font-size: 12px; opacity: 0.6; }
:global(.dark-mode .empty-state) {
  color: rgba(255,255,255,0.5);
}

/* ── 动画点 ── */
.dot { animation: bounce 1.4s infinite ease-in-out both; display: inline-block; margin: 0 1px; }
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ── 操作按钮暗色 ── */
:global(.dark-mode .action-btn) {
  color: rgba(255,255,255,0.65);
  border-color: rgba(255,255,255,0.15);
}
:global(.dark-mode .action-btn:hover ){
  background: rgba(255,255,255,0.08);
}
:global(.dark-mode .apply-btn) {
  color: #90caf9;
  border-color: #90caf9;
}
:global(.dark-mode .apply-btn:hover:not(:disabled)) {
  background: #90caf9;
  color: #1a1a1a;
}

/* ── 过渡 ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-up-enter-active, .scale-up-leave-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.scale-up-enter-from, .scale-up-leave-to { opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
</style>