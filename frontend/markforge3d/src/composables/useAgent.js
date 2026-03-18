// src/composables/useAgent.js
//
// targetMode 说明：
//   'insert'    → 插入当前文档（AI 自选光标插入 or 末尾追加）
//   'overwrite' → 覆盖当前文档（同步更新标题）
//   'new'       → 新建文档（emit create-doc，不动当前编辑器）

import { ref } from 'vue'

// 从环境变量读取，不要硬编码 key
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const API_URL = import.meta.env.VITE_AI_API_URL
  || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const MODEL = import.meta.env.VITE_AI_MODEL || 'qwen-plus'

// ── insert 模式：细粒度工具，AI 自己判断插入位置 ──────────────
const TOOLS_INSERT = [
  {
    type: 'function',
    function: {
      name: 'insert_at_cursor',
      description: '在光标当前位置插入内容。适用于在文档中间添加段落、小节。',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '要插入的 Markdown 文本' }
        },
        required: ['content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'append_to_document',
      description: '在文档末尾追加内容。适用于续写、追加总结、补充章节。',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '要追加的 Markdown 文本' }
        },
        required: ['content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'replace_line',
      description: '替换指定行的内容（行号从 0 开始）。适用于修改标题、修正某行。',
      parameters: {
        type: 'object',
        properties: {
          line_number: { type: 'integer', description: '要替换的行号，从 0 开始' },
          new_content: { type: 'string', description: '替换后该行的新内容' }
        },
        required: ['line_number', 'new_content']
      }
    }
  }
]

// ── overwrite / new 模式：只开放 write_document ───────────────
const TOOLS_WRITE = [
  {
    type: 'function',
    function: {
      name: 'write_document',
      description: '生成完整的 Markdown 文档。overwrite 模式替换当前文档，new 模式创建新文档。',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string', description: '文档标题（纯文字，不含 #）' },
          content: { type: 'string', description: '完整 Markdown 正文（不含标题行）' }
        },
        required: ['title', 'content']
      }
    }
  }
]

export function useAgent() {
  const isRunning = ref(false)
  const agentLog  = ref([])

  const log = (type, message) => {
    agentLog.value.push({ type, message, time: Date.now() })
  }

  // ── 执行具体的工具 ─────────────────────────────────────────────
  const executeTool = (toolName, args, ctx) => {
    const { targetMode, markdownInput, insertMarkdown, docTitle, emit } = ctx

    if (toolName === 'insert_at_cursor') {
      const c = args.content || ''
      insertMarkdown(c, c.length)
      log('action', `在光标处插入了 ${c.split('\n').length} 行`)
      return
    }

    if (toolName === 'append_to_document') {
      const c = args.content || ''
      markdownInput.value = markdownInput.value
        ? markdownInput.value + '\n\n' + c
        : c
      log('action', `追加了 ${c.split('\n').length} 行到文档末尾`)
      return
    }

    if (toolName === 'replace_line') {
      const lines = markdownInput.value.split('\n')
      const lineNo = args.line_number ?? 0
      if (lineNo >= 0 && lineNo < lines.length) {
        lines[lineNo] = args.new_content || ''
        markdownInput.value = lines.join('\n')
        log('action', `已修改第 ${lineNo + 1} 行`)
      } else {
        log('error', `行号 ${lineNo} 超出范围（共 ${lines.length} 行）`)
      }
      return
    }

    if (toolName === 'write_document') {
      const title   = (args.title   || '未命名文档').trim()
      const content = (args.content || '').trim()
      const fullDoc = `# ${title}\n\n${content}`

      if (targetMode === 'overwrite') {
        if (docTitle) docTitle.value = title
        markdownInput.value = fullDoc
        log('action', `已覆盖当前文档「${title}」`)
      } else if (targetMode === 'new') {
        emit('create-doc', { title, content: fullDoc })
        log('action', `已新建文档「${title}」`)
      }
      return
    }

    log('error', `未知操作: ${toolName}`)
  }

  // ── 主入口 ─────────────────────────────────────────────────
  const runAgent = async (userInstruction, targetMode, ctx) => {
  if (isRunning.value) return
  isRunning.value = true
  agentLog.value = []

  if (!API_KEY) {
    log('error', '❌ 未配置 API Key，请在 .env.local 中设置 VITE_AI_API_KEY')
    isRunning.value = false
    return
  }

  const modeLabel = {
    insert: '插入当前文档',
    overwrite: '覆盖当前文档',
    new: '新建文档'
  }[targetMode] || targetMode

  log('thinking', `🤔 指令：「${userInstruction}」`)
  log('thinking', `📌 目标：${modeLabel}`)

  // 推一条"AI 正在生成..."的日志条目，后面往里追加内容
  agentLog.value.push({ type: 'thinking', message: '💭 AI 正在思考：', time: Date.now() })
  const streamingIndex = agentLog.value.length - 1

  try {
    const currentDoc = ctx.markdownInput.value
    const tools = targetMode === 'insert' ? TOOLS_INSERT : TOOLS_WRITE

    const contextBlock = {
      insert: `当前文档内容（你将在其中插入内容）：\n\`\`\`markdown\n${currentDoc || '（文档为空）'}\n\`\`\``,
      overwrite: `当前文档内容（你将完全重写它）：\n\`\`\`markdown\n${currentDoc || '（文档为空）'}\n\`\`\``,
      new: '你将为用户创建一份全新文档，与当前编辑器内容无关。'
    }[targetMode]

    const systemPrompt = `你是一个 Markdown 文档编辑 Agent，通过调用工具操作编辑器。

${contextBlock}

规则：
1. 只通过工具返回结果，不要输出任何解释性文字
2. 生成标准 Markdown 格式
3. write_document 的 title 为纯文字（不含 #），content 为正文`

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInstruction }
        ],
        tools,
        tool_choice: 'required',
        temperature: 0.4,
        stream: true  // 开启流式
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || `HTTP ${response.status}`)
    }

    // ── 流式读取，同时拼接 tool_calls ──────────────────────
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // 用于累积每个 tool_call 的完整参数
    // 结构：{ 0: { name: 'write_document', arguments: '{"title":...' }, ... }
    const toolCallBuffers = {}

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') break

        try {
          const chunk = JSON.parse(data)
          const delta = chunk.choices?.[0]?.delta

          // 普通文字（tool_choice: required 时一般没有，保底处理）
          if (delta?.content) {
            agentLog.value[streamingIndex].message += delta.content
          }

          // 工具调用分块到来，累积拼接
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0
              if (!toolCallBuffers[idx]) {
                toolCallBuffers[idx] = { name: '', arguments: '' }
              }
              if (tc.function?.name) {
                toolCallBuffers[idx].name += tc.function.name
              }
              if (tc.function?.arguments) {
                toolCallBuffers[idx].arguments += tc.function.arguments

                // 实时显示正在生成的内容（让用户看到进度）
                agentLog.value[streamingIndex].message =
                  `💭 AI 正在生成内容... (${toolCallBuffers[idx].arguments.length} 字符)`
              }
            }
          }
        } catch {
          continue
        }
      }
    }

    // ── 流结束，执行拼完整的工具调用 ───────────────────────
    const completedCalls = Object.values(toolCallBuffers)

    if (completedCalls.length > 0) {
      // 把"正在思考"的条目改成完成状态
      agentLog.value[streamingIndex].message = '✨ 内容生成完毕，开始执行操作...'

      log('thinking', `🔧 AI 计划执行 ${completedCalls.length} 个操作`)

      for (const call of completedCalls) {
        let args = {}
        try {
          args = JSON.parse(call.arguments || '{}')
        } catch {
          log('error', '❌ 参数解析失败')
          continue
        }

        await new Promise(r => setTimeout(r, 350))
        executeTool(call.name, args, { ...ctx, targetMode })
      }

      log('done', '✅ 操作完成')

    } else {
      agentLog.value[streamingIndex].message = '💬 AI 没有调用任何工具'
      log('done', '完成')
    }

  } catch (err) {
    log('error', `❌ 请求失败: ${err.message}`)
    console.error('[Agent Error]', err)
  } finally {
    isRunning.value = false
  }
}

  return { runAgent, isRunning, agentLog }
}