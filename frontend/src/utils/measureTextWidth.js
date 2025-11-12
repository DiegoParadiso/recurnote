let sharedCanvas;
let sharedCtx;

function getCtx() {
  if (typeof document === 'undefined') return null;
  if (!sharedCanvas) sharedCanvas = document.createElement('canvas');
  if (!sharedCtx) sharedCtx = sharedCanvas.getContext('2d');
  return sharedCtx;
}

export function getFontFromComputedStyle(cs) {
  if (!cs) return undefined;
  // Prefer the full font shorthand if available
  const shorthand = cs.font;
  if (shorthand && shorthand !== 'inherit' && shorthand !== 'normal') return shorthand;
  // Build a reasonable fallback
  const style = cs.fontStyle || 'normal';
  const variant = cs.fontVariant || 'normal';
  const weight = cs.fontWeight || '400';
  const size = cs.fontSize || '10px';
  const line = cs.lineHeight || 'normal';
  const family = cs.fontFamily || 'sans-serif';
  return `${style} ${variant} ${weight} ${size} / ${line} ${family}`;
}

export function measureTextWidth(text, font) {
  if (!text) return 0;
  const ctx = getCtx();
  if (ctx) {
    if (font) ctx.font = font;
    try {
      const metrics = ctx.measureText(text);
      return metrics && typeof metrics.width === 'number' ? metrics.width : text.length * 6;
    } catch (_) {
      return Math.max(100, text.length * 6);
    }
  }
  return Math.max(100, text.length * 6);
}

export function measureLongestLineWidth(lines, font) {
  if (!Array.isArray(lines) || lines.length === 0) return 0;
  let max = 0;
  for (const line of lines) {
    const w = measureTextWidth(line || '', font);
    if (w > max) max = w;
  }
  return Math.ceil(max);
}
