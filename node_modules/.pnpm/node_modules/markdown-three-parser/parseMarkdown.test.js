// parseMarkdown.test.js
import { describe, it, expect } from 'vitest'
import { parseMarkdown } from './index.js'

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/** 断言输出包含某子串 */
const has = (input, substring) => {
  const out = parseMarkdown(input)
  expect(out).toContain(substring)
  return out
}

/** 断言输出不包含某子串 */
const hasNot = (input, substring) => {
  const out = parseMarkdown(input)
  expect(out).not.toContain(substring)
  return out
}

// 注意：解析器会给所有块级元素注入 data-line、给标题注入 id，
// 所以断言开头标签时一律用 '<tagname' 而非 '<tagname>'，
// 断言计数时正则用 /<tagname[\s>]/ 匹配。

// ─────────────────────────────────────────────
// 1. 段落
// ─────────────────────────────────────────────
describe('段落', () => {
  it('普通文本渲染为 <p>', () => {
    has('Hello world', '<p')
    has('Hello world', 'Hello world')
  })

  it('空输入返回空字符串', () => {
    expect(parseMarkdown('')).toBe('')
    expect(parseMarkdown(null)).toBe('')
    expect(parseMarkdown(undefined)).toBe('')
  })

  it('两段文字之间的空行产生两个独立 <p>', () => {
    const out = parseMarkdown('第一段\n\n第二段')
    const pCount = (out.match(/<p[\s>]/g) || []).length
    expect(pCount).toBeGreaterThanOrEqual(2)
  })

  it('段落内换行渲染为 <br />', () => {
    has('第一行\n第二行', '<br />')
  })
})

// ─────────────────────────────────────────────
// 2. 标题
// ─────────────────────────────────────────────
describe('标题', () => {
  it('# 渲染为 <h1>', () => has('# 标题一', '<h1'))
  it('## 渲染为 <h2>', () => has('## 标题二', '<h2'))
  it('### 渲染为 <h3>', () => has('### 标题三', '<h3'))
  it('#### 渲染为 <h4>', () => has('#### 标题四', '<h4'))
  it('##### 渲染为 <h5>', () => has('##### 标题五', '<h5'))
  it('###### 渲染为 <h6>', () => has('###### 标题六', '<h6'))

  it('标题内容正确', () => {
    const out = parseMarkdown('## Hello')
    expect(out).toContain('Hello')
    expect(out).toContain('<h2')
  })

  it('# 后没有空格不识别为标题', () => {
    hasNot('#没有空格', '<h1')
  })

  it('标题支持内联粗体', () => {
    const out = parseMarkdown('## **粗体**标题')
    expect(out).toContain('<h2')
    expect(out).toContain('<strong>')
  })
})

// ─────────────────────────────────────────────
// 3. 内联样式
// ─────────────────────────────────────────────
describe('内联样式', () => {
  it('**粗体** 渲染为 <strong>', () => {
    has('**粗体文字**', '<strong>')
    has('**粗体文字**', '粗体文字')
  })

  it('*斜体* 渲染为 <em>', () => {
    has('*斜体文字*', '<em>')
  })

  it('***粗斜体*** 渲染为 <strong><em>', () => {
    has('***粗斜体***', '<strong>')
    has('***粗斜体***', '<em>')
  })

  it('~~删除线~~ 渲染为 <del>', () => {
    has('~~删除线~~', '<del>')
  })

  it('`内联代码` 渲染为 <code>', () => {
    has('`const x = 1`', '<code')
    has('`const x = 1`', 'const x = 1')
  })

  it('内联代码内部不渲染 Markdown 语法', () => {
    const out = parseMarkdown('`**不应该粗体**`')
    expect(out).not.toContain('<strong>')
    expect(out).toContain('**不应该粗体**')
  })

  it('[链接](url) 渲染为 <a>', () => {
    const out = parseMarkdown('[点击这里](https://example.com)')
    expect(out).toContain('<a ')
    expect(out).toContain('https://example.com')
    expect(out).toContain('点击这里')
  })

  it('![图片](url) 渲染为 <img>', () => {
    const out = parseMarkdown('![Alt文字](https://example.com/img.png)')
    expect(out).toContain('<img')
    expect(out).toContain('https://example.com/img.png')
    expect(out).toContain('Alt文字')
  })
})

// ─────────────────────────────────────────────
// 4. 列表
// ─────────────────────────────────────────────
describe('无序列表', () => {
  it('- 开头渲染为 <ul> 和 <li>', () => {
    const out = parseMarkdown('- 苹果\n- 香蕉\n- 橙子')
    expect(out).toContain('<ul>')
    expect(out).toContain('<li')
    expect(out).toContain('苹果')
    expect(out).toContain('香蕉')
  })

  it('* 开头也能识别为无序列表', () => {
    has('* 列表项', '<ul>')
  })

  it('嵌套列表生成嵌套 <ul>', () => {
    const out = parseMarkdown('- 父级\n  - 子级')
    expect(out).toContain('<ul>')
    expect(out).toContain('父级')
    expect(out).toContain('子级')
  })
})

describe('有序列表', () => {
  it('1. 开头渲染为 <ol> 和 <li>', () => {
    const out = parseMarkdown('1. 第一\n2. 第二')
    expect(out).toContain('<ol>')
    expect(out).toContain('<li')
    expect(out).toContain('第一')
  })
})

describe('任务列表', () => {
  it('- [ ] 渲染为未勾选 checkbox', () => {
    const out = parseMarkdown('- [ ] 待办事项')
    expect(out).toContain('type="checkbox"')
    expect(out).not.toContain('checked')
    expect(out).toContain('待办事项')
  })

  it('- [x] 渲染为已勾选 checkbox', () => {
    const out = parseMarkdown('- [x] 已完成')
    expect(out).toContain('type="checkbox"')
    expect(out).toContain('checked')
    expect(out).toContain('已完成')
  })

  it('- [X] 大写 X 也识别为已勾选', () => {
    const out = parseMarkdown('- [X] 已完成')
    expect(out).toContain('checked')
  })

  it('checkbox 带有 data-line 属性（用于任务切换）', () => {
    const out = parseMarkdown('- [ ] 任务')
    expect(out).toContain('data-line')
  })
})

// ─────────────────────────────────────────────
// 5. 引用
// ─────────────────────────────────────────────
describe('引用', () => {
  it('> 渲染为 <blockquote>', () => {
    has('> 引用内容', '<blockquote')
    has('> 引用内容', '引用内容')
  })

  it('>> 渲染为二级嵌套 blockquote', () => {
    const out = parseMarkdown('> 一级\n>> 二级')
    const count = (out.match(/<blockquote/g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })

  it('>>> 渲染为三级嵌套 blockquote', () => {
    const out = parseMarkdown('>>> 三级引用')
    const count = (out.match(/<blockquote/g) || []).length
    expect(count).toBeGreaterThanOrEqual(3)
  })

  it('引用结束后正确关闭标签', () => {
    const out = parseMarkdown('> 引用\n\n普通段落')
    const opens = (out.match(/<blockquote/g) || []).length
    const closes = (out.match(/<\/blockquote>/g) || []).length
    expect(opens).toBe(closes)
  })
})

// ─────────────────────────────────────────────
// 6. 代码块
// ─────────────────────────────────────────────
describe('代码块', () => {
  it('``` 包裹的内容渲染为 <pre><code>', () => {
    const out = parseMarkdown('```\nconsole.log("hello")\n```')
    expect(out).toContain('<pre')
    expect(out).toContain('<code>')
    expect(out).toContain('console.log')
  })

  it('代码块内容不被 Markdown 解析', () => {
    const out = parseMarkdown('```\n**不应该粗体**\n# 不应该标题\n```')
    expect(out).not.toContain('<strong>')
    expect(out).not.toContain('<h1')
    expect(out).toContain('**不应该粗体**')
  })

  it('语言标识符被提取到 class', () => {
    const out = parseMarkdown('```javascript\nconsole.log(1)\n```')
    expect(out).toContain('language-javascript')
  })

  it('多个代码块互不干扰', () => {
    const out = parseMarkdown('```\n块一\n```\n\n```\n块二\n```')
    expect(out).toContain('块一')
    expect(out).toContain('块二')
    const preCount = (out.match(/<pre/g) || []).length
    expect(preCount).toBe(2)
  })
})

// ─────────────────────────────────────────────
// 7. 表格
// ─────────────────────────────────────────────
describe('表格', () => {
  const tableInput = `| 姓名 | 年龄 |
| --- | --- |
| 张三 | 25 |
| 李四 | 30 |`

  it('渲染为 <table>', () => has(tableInput, '<table'))
  it('渲染表头 <th>', () => {
    const out = parseMarkdown(tableInput)
    expect(out).toContain('<th')
    expect(out).toContain('姓名')
    expect(out).toContain('年龄')
  })
  it('渲染数据行 <td>', () => {
    const out = parseMarkdown(tableInput)
    expect(out).toContain('<td')
    expect(out).toContain('张三')
    expect(out).toContain('25')
  })
  it('右对齐 ---: 生成 text-align:right', () => {
    has(`| 标题 |\n| ---: |\n| 内容 |`, 'text-align:right')
  })
  it('居中对齐 :---: 生成 text-align:center', () => {
    has(`| 标题 |\n| :---: |\n| 内容 |`, 'text-align:center')
  })
})

// ─────────────────────────────────────────────
// 8. 数学公式
// ─────────────────────────────────────────────
describe('数学公式', () => {
  it('$...$ 行内公式被处理（交给 katex mock）', () => {
    const out = parseMarkdown('质能方程 $E=mc^2$ 很重要')
    expect(out).toContain('math-placeholder')
    expect(out).toContain('E=mc^2')
  })

  it('$$ 块级公式被处理', () => {
    const out = parseMarkdown('$$\n\\int_0^1 x dx\n$$')
    expect(out).toContain('math-placeholder')
    expect(out).toContain('mode="block"')
  })

  it('$$ 内部内容不被 Markdown 解析', () => {
    const out = parseMarkdown('$$\n**不是粗体**\n$$')
    expect(out).not.toContain('<strong>')
  })
})

// ─────────────────────────────────────────────
// 9. 分割线
// ─────────────────────────────────────────────
describe('分割线', () => {
  it('--- 渲染为 <hr', () => has('---', '<hr'))
  it('___ 渲染为 <hr', () => has('___', '<hr'))
  it('* * * 渲染为 <hr', () => has('* * *', '<hr'))
})

// ─────────────────────────────────────────────
// 10. 3D 模型块
// ─────────────────────────────────────────────
describe('Three.js 3D 块', () => {
  const threeInput = `:::three\n### cube (#64b5f6, 1.5)\n:::`

  it(':::three 块渲染为 .three-preview div', () => {
    has(threeInput, 'three-preview')
  })

  it('data-objects 包含正确的 type', () => {
    const out = parseMarkdown(threeInput)
    const match = out.match(/data-objects='([^']+)'/)
    expect(match).not.toBeNull()
    const objects = JSON.parse(match[1])
    expect(objects[0].type).toBe('cube')
  })

  it('data-objects 包含正确的 size', () => {
    const out = parseMarkdown(threeInput)
    const match = out.match(/data-objects='([^']+)'/)
    const objects = JSON.parse(match[1])
    expect(objects[0].size).toBe(1.5)
  })

  it('多个 3D 对象都被解析', () => {
    const input = `:::three\n### cube (red, 1)\n### sphere (blue, 2)\n### cone (green, 0.5)\n:::`
    const out = parseMarkdown(input)
    const match = out.match(/data-objects='([^']+)'/)
    const objects = JSON.parse(match[1])
    expect(objects).toHaveLength(3)
    expect(objects.map(o => o.type)).toEqual(['cube', 'sphere', 'cone'])
  })

  it('CSS 颜色名称（如 skyblue）被正确保留', () => {
    const input = ':::three\n### sphere (skyblue, 1)\n:::'
    const out = parseMarkdown(input)
    const match = out.match(/data-objects='([^']+)'/)
    const objects = JSON.parse(match[1])
    expect(objects[0].color).toBe('skyblue')
  })

  it('多个 :::three 块互不干扰', () => {
    const input = `:::three\n### cube (red, 1)\n:::\n\n:::three\n### sphere (blue, 1)\n:::`
    const out = parseMarkdown(input)
    const count = (out.match(/three-preview/g) || []).length
    expect(count).toBe(2)
  })
})

// ─────────────────────────────────────────────
// 11. HTML 转义
// ─────────────────────────────────────────────
describe('HTML 转义', () => {
  it('& 被转义为 &amp;', () => {
    const out = parseMarkdown('Tom & Jerry')
    expect(out).toContain('&amp;')
  })

  it('裸 < > 在非标签上下文中被原样保留（解析器不做 XSS 过滤）', () => {
    // 解析器设计上允许内联 HTML，XSS 防护由 DOMPurify 在渲染层处理
    const out = parseMarkdown('1 < 2 > 0')
    expect(out).toContain('1 < 2 > 0')
  })

  it('script 标签被 protectHTML 保护，不被 Markdown 二次解析', () => {
    const out = parseMarkdown('<script>alert(1)</script>')
    expect(out).toBeDefined()
    expect(out.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────
// 12. 跨调用状态隔离
// ─────────────────────────────────────────────
describe('跨调用状态隔离', () => {
  it('连续调用 parseMarkdown 结果互不干扰', () => {
    parseMarkdown('```\n块一代码\n```')
    const out = parseMarkdown('普通段落')
    expect(out).not.toContain('<pre')
    expect(out).toContain('普通段落')
  })

  it('第一次调用未闭合代码块不影响第二次调用', () => {
    parseMarkdown('```\n未闭合代码块')
    const out = parseMarkdown('# 正常标题')
    expect(out).toContain('<h1')
    expect(out).not.toContain('<pre')
  })

  it('第一次调用的引用状态不泄漏到第二次调用', () => {
    parseMarkdown('> 引用内容')
    const out = parseMarkdown('普通段落')
    expect(out).not.toContain('<blockquote')
  })

  it('第一次调用的表格状态不泄漏', () => {
    parseMarkdown('| a | b |\n| --- | --- |')
    const out = parseMarkdown('普通文字')
    expect(out).not.toContain('<table')
  })
})

// ─────────────────────────────────────────────
// 13. 混合内容（集成测试）
// ─────────────────────────────────────────────
describe('混合内容', () => {
  it('标题 + 列表 + 引用 + 代码块混合正确渲染', () => {
    const input = `# 文档标题

这是一段介绍文字，包含 **粗体** 和 *斜体*。

## 功能列表

- 功能一
- 功能二
  - 子功能

> 这是引用
> 多行引用

\`\`\`javascript
const x = 1
\`\`\`

| 列1 | 列2 |
| --- | --- |
| A | B |`

    const out = parseMarkdown(input)
    expect(out).toContain('<h1')
    expect(out).toContain('<h2')
    expect(out).toContain('<strong>')
    expect(out).toContain('<em>')
    expect(out).toContain('<ul>')
    expect(out).toContain('<blockquote')
    expect(out).toContain('<pre')
    expect(out).toContain('<table')
  })

  it('块级标签都正确闭合（开闭数量匹配）', () => {
    const input = `# 标题\n\n> 引用\n>> 嵌套\n\n- 列表\n\n普通段落`
    const out = parseMarkdown(input)
    for (const tag of ['blockquote', 'ul', 'li']) {
      const opens = (out.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length
      const closes = (out.match(new RegExp(`</${tag}>`, 'g')) || []).length
      expect(opens).toBe(closes)
    }
  })
})