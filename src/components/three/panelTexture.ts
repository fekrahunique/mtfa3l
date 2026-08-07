/**
 * Canvas 2D shapes Arabic correctly and honours `direction: rtl`, so scene
 * textures that must carry words are drawn here rather than with a 3D text mesh.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  lines.slice(0, maxLines).forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
}
