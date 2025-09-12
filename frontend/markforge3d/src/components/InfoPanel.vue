

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  type: { type: String, default: 'tutorial' }, // tutorial | shortcuts
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="info-panel" :class="{ open: open }">
    <div class="info-header">
      <h3 v-if="type === 'tutorial'">📖 使用教程</h3>
      <h3 v-else-if="type === 'shortcuts'">⌨ 常用快捷键</h3>
      <button class="close-btn" @click="emit('close')">✖</button>
    </div>

    <div class="info-content">
      <!-- 使用教程 -->
      <div v-if="type === 'tutorial'" class="tutorial">
        <p>欢迎使用 <b>MarkForge 3D</b>！这是一个支持 <b>Markdown</b> + <b>3D 语法</b> 的编辑器。</p>
        <br></br>
        <div class="heading">
          <h2>标题</h2><hr></hr>
          <div style="font-size: 40px;"># <span>一级标题</span></div>
          <div style="font-size: 35px;">## <span>二级标题</span></div>
          <div  style="font-size: 30px;">### <span>三级标题</span></div>
        </div><br></br>

        <div class="style">
          <h2>样式</h2><hr></hr>
          <div>***<span><strong><em>强调</em></strong></span>***</div>
          <div>**<span><strong>加粗</strong></span>**</div>
          <div>*<span><em>斜体</em></span>*</div>
          <div>~~<span><del>删除</del></span>~~</div>
          <div>><span>引用</span></div>
        </div><br></br>

        <div class="list">
          <h2>列表</h2><hr></hr>
          <div>- 无序列表</div>
          <div>* 无序列表</div>
          <div>1. 有序列表</div>
          <div>通过 空格缩进 实现嵌套（缩进两格或者四格）</div>
        </div><br></br>

        <div class="footnote">
          <h2>脚注</h2><hr></hr>
          <div>这是一个有内联脚注的句子<sup id="ref-1"><a href="#ref-1">[^(这是补充说明)]</a></sup></div>
          <div>这是一个引用<sup id="ref-1"><a  href="#ref-1">[^1]</a></sup></div>
          <div><sup id="ref-1"><a  href="#ref-1">[^1]</a></sup>: 这是脚注1的内容</div>
        </div><br></br>

        <div class="math">
          <h2>数学公式</h2><hr></hr>
          <div>$$</div>
          <div>数学公式</div>
          <div>$$</div>
        </div><br></br>

        <div class="footnote">
          <h2>链接</h2><hr></hr>
          <div>[链接](https://www.baidu.com) -> <a href="https://www.baidu.com" target="_blank">链接</a></div>
          <div>一张图片：![示例图](image.png)</div>
          <div>一张可以调整大小的图片：![示例图](image.png){width=50% class="float"}</div>
        </div><br></br>

        <div class="footnote">
          <h2>代码</h2><hr></hr>
          <div>\```[语言名]</div>
          <div><code>代码</code></div>
          <div>\```</div>
        </div><br></br>

        <div class="table">
          <h2>表格</h2><hr></hr>
          <div>| 左对齐 | 居中 | 右对齐 |</div>
          <div>|:------|:----:|-----:|</div>
          <div>| 内容 |  内容 | 内容 |</div>
          <div>| 内容 |  内容 | 内容 |</div>
          <div></div>
        </div><br></br>

        <div class="3d">
          <h2>🎨 插入 3D 图形</h2><hr></hr>
          <div><pre>
:::three
### cube (#007bff, 1.5)
### sphere (red, 1)
### cone (green, 2)
:::
        </pre>
        <p>支持图形：<b>cube</b> / <b>sphere</b> / <b>cone</b> / <b>cylinder</b></p>
        <p>颜色支持 HEX（如 <code>#ff0000</code>）或命名色（如 <code>red</code>）。</p></div>
        </div><br></br>       

      </div>

      <!-- 快捷键说明 -->
      <div v-else-if="type === 'shortcuts'" class="shortcuts">
        <table border="1" cellspacing="0" cellpadding="6">
          <thead>
            <tr><th>快捷键</th><th>功能</th></tr>
          </thead>
          <tbody>
            <tr><td><b>Ctrl + s</b></td><td>保存当前内容到历史记录</td></tr>
            <tr><td><b>Ctrl + h</b></td><td>切换历史记录面板显示/隐藏</td></tr>
            <tr><td><b>Ctrl + e</b></td><td>	导出为 PDF 文件</td></tr>
            <tr><td><b>Ctrl + b</b></td><td>	插入粗体文本</td></tr>
            <tr><td><b>Ctrl + i</b></td><td>	插入斜体文本</td></tr>
            <tr><td><b>Ctrl + u</b></td><td>	插入下划线</td></tr>
            <tr><td><b>Ctrl + Shift + s</b></td><td>	插入删除线</td></tr>
            <tr><td><b>Ctrl + Alt + c</b></td><td>	插入代码块</td></tr>
            <tr><td><b>Ctrl + 1 ~ Ctrl + 6</b></td><td>	插入标题</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-panel {
  position: fixed;
  top: 0;
  left: -380px;
  width: 380px;
  height: 100%;
  background: var(--bg-swiper-slide, #fff);
  box-shadow: -2px 0 6px rgba(0,0,0,0.2);
  transition: right 0.3s ease;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  font-size: 30px;
}
.info-panel.open {
  left: 0;
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ddd;
  background: var(--bg-toolbar, #f9f9f9);
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 15px;
  line-height: 1.6;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.tutorial {
  font-size: 20px;
}
.tutorial h2 {
  color: #dbc231;
}
.shortcuts {
  font-size: 20px;
}
</style>
