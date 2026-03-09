// src/composables/useAgent.js
//
// Agent 架构：
//   用户指令 → Qwen (tool_use) → 解析 tool_calls → 执行编辑器操作
//
// 和普通 AI 聊天的区别：
//   普通聊天：AI 返回文字 → 显示在对话框
//   Agent：   AI 返回结构化操作指令 → 前端执行，直接改变编辑器内容

import { ref } from 'vue'

// ─── API 配置（从 .env.local 读取）────────────────────────────
// 在项目根目录的 .env.local 里加：
//   VITE_AI_API_KEY=你的key
//   VITE_AI_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
//   VITE_AI_MODEL=qwen-plus
const API_KEY = import.meta.env.VITE_AI_API_KEY || 'sk-01eccf4e52d84125ac707d9a4999ff07'
const API_URL = import.meta.env.VITE_AI_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const MODEL   = import.meta.env.VITE_AI_MODEL   || 'qwen-plus'

// ─── Tool 定义（告诉 AI 它能做哪些操作）──────────────────────
// AI 会根据用户意图自行选择调用哪个 tool，以及填什么参数
const EDITOR_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'insert_at_cursor',
      description: '在光标当前位置插入 Markdown 内容。适用于：在文档中间插入新内容、在选中位置替换内容。',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: '要插入的 Markdown 文本，可以是多行内容'
          }
        },
        required: ['content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'append_to_document',
      description: '在文档末尾追加 Markdown 内容。适用于：续写文章、追加章节、在结尾添加总结。',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: '要追加到文档末尾的 Markdown 文本'
          }
        },
        required: ['content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'replace_document',
      description: '用新内容完全替换整个文档。适用于：重写文档、按模板重新生成全文。',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: '新的完整文档 Markdown 内容'
          }
        },
        required: ['content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'replace_line',
      description: '替换文档中指定行号的内容（行号从 0 开始）。适用于：修改某个标题、修正某行错误。',
      parameters: {
        type: 'object',
        properties: {
          line_number: {
            type: 'integer',
            description: '要替换的行号，从 0 开始'
          },
          new_content: {
            type: 'string',
            description: '替换后该行的新内容'
          }
        },
        required: ['line_number', 'new_content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'clear_document',
      description: '清空整个文档内容。仅在用户明确要求清空时使用。',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
]

// ─── Agent 状态日志条目类型 ────────────────────────────────────
// 每次 Agent 执行会产生一组日志，显示在对话框里
// type: 'thinking' | 'action' | 'done' | 'error'

export function useAgent() {
  const isRunning = ref(false)
  const agentLog  = ref([])   // Agent 执行过程的日志，显示给用户看

  // ── 日志辅助 ──────────────────────────────────────────────
  const log = (type, message, detail = '') => {
    agentLog.value.push({ type, message, detail, time: Date.now() })
  }

  // ── 执行单个 tool_call ────────────────────────────────────
  const executeTool = (toolName, args, { markdownInput, insertMarkdown }) => {
    switch (toolName) {

      case 'insert_at_cursor': {
        // 在光标位置插入（复用已有的 insertMarkdown 函数）
        const content = args.content || ''
        insertMarkdown(content, content.length)
        log('action', `📝 在光标处插入了 ${content.split('\n').length} 行内容`)
        break
      }

      case 'append_to_document': {
        // 追加到末尾
        const content = args.content || ''
        const current = markdownInput.value
        markdownInput.value = current
          ? current + '\n\n' + content
          : content
        log('action', `📄 在文档末尾追加了 ${content.split('\n').length} 行内容`)
        break
      }

      case 'replace_document': {
        // 全文替换
        markdownInput.value = args.content || ''
        log('action', '🔄 已重写整个文档')
        break
      }

      case 'replace_line': {
        // 替换指定行
        const lines = markdownInput.value.split('\n')
        const lineNo = args.line_number ?? 0
        if (lineNo >= 0 && lineNo < lines.length) {
          lines[lineNo] = args.new_content || ''
          markdownInput.value = lines.join('\n')
          log('action', `✏️ 已修改第 ${lineNo + 1} 行`)
        } else {
          log('error', `❌ 行号 ${lineNo} 超出范围（文档共 ${lines.length} 行）`)
        }
        break
      }

      case 'clear_document': {
        markdownInput.value = ''
        log('action', '🗑️ 已清空文档')
        break
      }

      default:
        log('error', `❌ 未知操作: ${toolName}`)
    }
  }

  // ── 主入口：运行 Agent ─────────────────────────────────────
  const runAgent = async (userInstruction, { markdownInput, insertMarkdown }) => {
    if (isRunning.value) return
    isRunning.value = true
    agentLog.value = []   // 每次运行清空上一次日志

    log('thinking', `🤔 理解你的指令：「${userInstruction}」`)

    try {
      // 把当前文档内容也传给 AI，它才知道现在写了什么
      const currentDoc = markdownInput.value
      const systemPrompt = `你是一个 Markdown 文档编辑 Agent。
你可以通过调用工具直接操作用户的文档编辑器。

当前文档内容（可能为空）：
\`\`\`markdown
${currentDoc || '（文档为空）'}
\`\`\`

规则：
1. 根据用户意图选择最合适的工具
2. 生成的内容必须是合法的 Markdown 格式
3. 如果需要多步操作（如先清空再写入），可以连续调用多个工具
4. 不要在 tool 调用之外输出多余的解释文字`

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
            { role: 'user',   content: userInstruction }
          ],
          tools: EDITOR_TOOLS,
          tool_choice: 'auto',   // 让 AI 自己决定用哪个 tool
          temperature: 0.3       // 低温度，操作类任务要确定性强
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const message = data.choices?.[0]?.message

      // ── 情况1：AI 决定调用 tool ──────────────────────────
      if (message?.tool_calls?.length > 0) {
        log('thinking', `🔧 AI 计划执行 ${message.tool_calls.length} 个操作`)

        for (const call of message.tool_calls) {
          const toolName = call.function.name
          let args = {}
          try {
            args = JSON.parse(call.function.arguments || '{}')
          } catch {
            log('error', `❌ 参数解析失败: ${call.function.arguments}`)
            continue
          }

          // 每个操作之间加一点延迟，让用户能看到过程
          await new Promise(r => setTimeout(r, 400))
          executeTool(toolName, args, { markdownInput, insertMarkdown })
        }

        log('done', '✅ Agent 完成所有操作')
      }

      // ── 情况2：AI 只返回了文字（没有调用 tool）────────────
      // 这种情况是 AI 无法理解指令或指令是纯问答类
      else if (message?.content) {
        log('done', `💬 ${message.content}`)
      }

      else {
        log('error', '❌ AI 返回了空响应')
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