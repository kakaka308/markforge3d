let inThreeJsBlock = false;
let threeJsObjects = [];

export function startOrEndThreeBlock(line, html) {
  const trimmed = line.trim();

  if (trimmed === ':::three') {
    inThreeJsBlock = true;
    threeJsObjects = [];
    return true;
  }

  if (trimmed === ':::' && inThreeJsBlock) {
    html.push(
      `<div class="three-js-container" data-objects='${JSON.stringify(threeJsObjects)}'></div>`
    );
    inThreeJsBlock = false;
    threeJsObjects = [];
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
