# MarkForge 3D

> 将 Three.js 3D 场景与 AI Agent 融入 Markdown 的 Web 编辑器

MarkForge 3D 是一款面向开发者和技术写作者的 Web 端 Markdown 编辑器。你可以在同一份文档里写文字、数学公式、代码块，并用自定义语法直接声明 Three.js 3D 物体，实时渲染到预览区。所有文档的标题结构会自动构建成可交互的知识图谱，AI Agent 可通过自然语言直接操作编辑器内容。

---

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [Three.js 场景语法](#threejs-场景语法)
- [Markdown 语法支持](#markdown-语法支持)
- [AI Agent](#ai-agent)
- [快捷键](#快捷键)
- [架构设计](#架构设计)
- [开发指南](#开发指南)

---

## 功能特性

- **实时双栏编辑** — 左侧 Markdown 编辑，右侧 HTML 预览，双向滚动同步
- **3D 场景嵌入** — 在文档中用 `:::three` 块声明立方体、球体、圆柱等几何体，Three.js 实时渲染
- **AI 编辑 Agent** — 基于 Qwen Function Calling，AI 可直接执行插入/替换/追加等文档操作
- **知识图谱** — Three.js Force-Directed Graph 可视化所有文档的标题层级，支持跨文档同名节点连接与聚焦高亮
- **数学公式** — KaTeX 渲染行内 `$...$` 与块级 `$$...$$` 公式
- **代码高亮** — Prism.js 支持多语言语法高亮
- **文档管理** — localStorage 持久化，2 秒自动保存，版本历史快照（最多 50 条）
- **导出** — 导出 PNG / PDF，完整保留页面内 3D 场景内容
- **主题切换** — CSS 变量驱动的暗色 / 亮色模式

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | Vue 3 · Composition API · `<script setup>` · Vite |
| 3D 渲染 | Three.js r128 · three-forcegraph · three-spritetext |
| AI 能力 | 通义千问 Qwen-Plus · Function Calling / Tool Use |
| Markdown | 自研 `markdown-three-parser`（零第三方解析依赖） |
| 数学公式 | KaTeX 0.16 |
| 代码高亮 | Prism.js |
| 导出 | html2canvas · jsPDF |
| UI 组件 | Element Plus |
| 工具链 | pnpm Monorepo · Vitest · @vueuse/core |

---

## 项目结构

```
markforge3d/
├── frontend/                        # Vue 3 前端应用
│   └── src/
│       ├── App.vue                  # 根组件，状态管理与 provide
│       ├── components/
│       │   ├── MarkdownEditor.vue   # Markdown 输入区
│       │   ├── PreviewPane.vue      # HTML 预览区
│       │   ├── ThreePreview.vue     # 文档内嵌 3D 渲染组件
│       │   ├── KnowledgeGraph.vue   # 知识图谱（Three.js Force Graph）
│       │   ├── AIAssistant.vue      # AI 助手面板
│       │   ├── Toolbar.vue          # 工具栏
│       │   ├── DocList.vue          # 文档列表
│       │   └── HistoryPanel.vue     # 版本历史面板
│       └── composables/
│           ├── useAgent.js          # AI Agent 核心逻辑
│           ├── useScrollSync.js     # 双栏滚动同步
│           ├── useHistory.js        # 版本历史
│           ├── useDocuments.js      # 文档管理（含自动保存）
│           ├── useThreeRenderer.js  # Three.js 渲染器
│           ├── exportUtils.js       # 导出公共逻辑
│           ├── usePdfExport.js      # PDF 导出
│           ├── useImageExport.js    # PNG 导出
│           ├── useTheme.js          # 主题切换
│           └── useShortcuts.js      # 键盘快捷键
│
└── packages/
    └── markdown-three-parser/       # 自研 Markdown 解析器（独立包）
        ├── parseMarkdown.js         # 解析器主入口
        ├── blocks/                  # 块级解析器
        │   ├── heading.js
        │   ├── paragraph.js
        │   ├── list.js
        │   ├── blockquote.js
        │   ├── codeBlock.js
        │   ├── mathBlock.js
        │   ├── threeBlock.js        # Three.js 场景块解析
        │   └── table.js
        └── utils/
            ├── escape.js
            ├── code.js
            └── math.js
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
git clone https://github.com/your-username/markforge3d.git
cd markforge3d
pnpm install
```

### 配置 AI（可选）

在 `frontend/` 目录下创建 `.env.local` 文件：

```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_AI_MODEL=qwen-plus
```

> 不配置 AI Key 也可以正常使用编辑器，只是 AI 功能不可用。  
> 获取 API Key：[阿里云百炼平台](https://bailian.console.aliyun.com/)

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
# 先构建解析器
pnpm --filter markdown-three-parser build

# 再构建前端
pnpm build
```

---

## Three.js 场景语法

在 Markdown 中用 `:::three` 和 `:::` 包裹 3D 场景块：

```
:::three
cube(#64b5f6, 1.5)
sphere(tomato, 1)
cylinder(#2ed573, 1.2)
torus(gold, 0.8)
:::
```

### 支持的几何体

| 关键字 | 说明 |
|--------|------|
| `cube` | 立方体 |
| `sphere` | 球体 |
| `cylinder` | 圆柱 |
| `cone` | 圆锥 |
| `torus` | 环面 |
| `plane` | 平面 |
| `dodecahedron` | 十二面体 |
| `icosahedron` | 二十面体 |
| `octahedron` | 八面体 |

### 参数格式

```
几何体名称(颜色, 尺寸)
```

- **颜色**：支持 CSS 颜色名（`red`、`skyblue`）、十六进制（`#ff4757`）
- **尺寸**：数字，默认为 `1`

---

## Markdown 语法支持

除标准 Markdown 外，还支持以下扩展语法：

### 数学公式

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### 任务列表

```markdown
- [x] 已完成的任务
- [ ] 待完成的任务
```

点击 checkbox 可直接在预览区切换完成状态，并同步修改 Markdown 源文本。

### 链接内嵌

```markdown
[网页标题](https://example.com){embed}
```

带 `{embed}` 属性的链接会渲染为可内嵌的 iframe。

### 脚注

```markdown
这是一段文字[^1]，支持脚注引用。

[^1]: 这是脚注内容。
```

---

## AI Agent

点击界面右下角的 AI 助手图标打开面板，用自然语言描述操作即可：

```
帮我写一篇关于 Vue 3 响应式原理的文章大纲
在文档末尾追加一个总结章节
把第二段的标题改成"核心概念"
```

### Agent 工具列表

| 工具 | 说明 |
|------|------|
| `insert_at_cursor` | 在光标当前位置插入内容 |
| `append_to_document` | 在文档末尾追加内容 |
| `replace_document` | 用新内容完全替换整个文档 |
| `replace_line` | 替换指定行号的内容 |
| `clear_document` | 清空整个文档 |

AI 会根据指令自主选择合适的工具并执行，执行过程在面板中实时显示。

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl / ⌘ + B` | 插入粗体 |
| `Ctrl / ⌘ + I` | 插入斜体 |
| `Ctrl / ⌘ + U` | 插入下划线 |
| `Ctrl / ⌘ + Shift + S` | 插入删除线 |
| `Ctrl / ⌘ + Alt + C` | 插入代码块 |
| `Ctrl / ⌘ + 1 ~ 6` | 插入对应级别标题 |
| `Ctrl / ⌘ + S` | 保存版本快照 |
| `Ctrl / ⌘ + H` | 打开历史版本面板 |
| `Ctrl / ⌘ + E` | 导出 PDF |

---

## 架构设计

### 解析器设计

`markdown-three-parser` 采用逐行扫描的状态机架构：

- **工厂函数模式**：每次调用 `parseMarkdown()` 时为所有块级解析器创建独立实例，彻底避免多次解析间的状态污染
- **优先级调度**：代码块 → 数学块 → 3D 块 → 表格 → 引用 → 标题 → 列表 → 段落，先处理优先级高的块，防止互相干扰
- **内联保护顺序**：`protectCode` 必须在 `protectHTML` 之前执行，防止内联代码含 HTML 标签时占位符互相污染
- **data-line 注入**：每个块级元素携带源文件行号，供编辑器滚动同步使用

### AI Agent 执行链路

```
用户自然语言指令
      ↓
注入当前文档上下文到 System Prompt
      ↓
Qwen Function Calling（tool_choice: auto）
      ↓
解析 tool_calls 数组
      ↓
顺序执行各 tool → 直接修改 markdownInput ref
      ↓
Vue 响应式自动触发预览更新
```

### 导出管线

普通 html2canvas 截图无法捕获 WebGL canvas 内容，导出时采用以下方案：

1. 截图前调用所有 `<canvas>` 的 `toDataURL()` 预存像素快照
2. 克隆 DOM 节点，将克隆中的 `<canvas>` 替换为对应的 `<img>`
3. 将克隆节点挂载到离屏容器（`position:fixed; top:-99999px`）避免触发页面重排
4. 对克隆节点执行 html2canvas 截图
5. PDF 按 A4 高度切片分页

---

## 开发指南

### 运行测试

```bash
# 解析器单元测试
pnpm test

# 监听模式
pnpm --filter markdown-three-parser test:watch

# 生成覆盖率报告
pnpm --filter markdown-three-parser test:coverage
```

### 解析器开发

修改 `packages/markdown-three-parser/` 下的文件后，启动监听构建：

```bash
pnpm --filter markdown-three-parser dev
```

前端会通过 pnpm workspace 自动引用最新构建产物。

### 添加新的块级语法

1. 在 `packages/markdown-three-parser/blocks/` 下新建解析器文件
2. 用工厂函数模式导出：`export function createXxxParser() { ... }`
3. 在 `parseMarkdown.js` 中按优先级插入调用
4. 在 `parseMarkdown_test.js` 中添加对应测试用例

---

## License

MIT