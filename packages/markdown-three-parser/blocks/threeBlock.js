let inThreeJsBlock = false;
let threeJsObjects = [];

export function startOrEndThreeBlock(line, html) {
  const trimmed = line.trim();

  // 识别块的开始标记
  if (trimmed === ':::three') {
    inThreeJsBlock = true;
    threeJsObjects = []; // 每次开始新块时，清空对象列表
    return true;
  }

  // 识别块的结束标记
  if (trimmed === ':::' && inThreeJsBlock) {
    // 关键修改：生成一个带有数据的独立占位符
    html.push(
      `<div class="three-preview" data-objects='${JSON.stringify(threeJsObjects)}'></div>`
    );
    inThreeJsBlock = false;
    threeJsObjects = []; // 结束时清空
    return true;
  }

  return false;
}

export function handleThreeObject(line) {
  if (!inThreeJsBlock) return false;

  const trimmed = line.trim();
  const objectMatch = trimmed.match(
    /^(#{1,5})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i
  );

  if (objectMatch) {
    const type = objectMatch[2].toLowerCase();
    let color = objectMatch[3].trim();

    // 转换颜色格式
    if (!color.startsWith('0x') && color.startsWith('#')) {
      color = '0x' + color.substring(1);
    } else if (!color.startsWith('0x') && !isNaN(parseInt(color))) {
      color = '0x' + parseInt(color).toString(16);
    }

    const size = parseFloat(objectMatch[4]) || 1;

    threeJsObjects.push({ type, color, size });
  }
  return true;
}

export function isInThreeBlock() {
  return inThreeJsBlock;
}