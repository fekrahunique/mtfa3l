import * as THREE from "three";

const WOOD = "#c08a52";
const WOOD_DARK = "#a9743f";
const INK = "#33200f";
const INK_SOFT = "#5c3c20";

export function makeSignTexture(step: string, title: string, body: string) {
  const width = 1024;
  const height = 448;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = WOOD;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 2;
  for (let y = 14; y < height; y += 26) {
    ctx.globalAlpha = 0.25 + ((y * 7) % 10) / 40;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.3) * 3);
    ctx.lineTo(width, y + Math.cos(y * 0.22) * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 8;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = INK_SOFT;
  ctx.font = "700 34px 'Thmanyah Sans', sans-serif";
  ctx.fillText(step, width / 2, 84);

  ctx.fillStyle = INK;
  ctx.font = "700 62px 'Thmanyah Sans', sans-serif";
  ctx.fillText(title, width / 2, 168, width - 120);

  ctx.fillStyle = INK_SOFT;
  ctx.font = "400 34px 'Thmanyah Sans', sans-serif";
  wrapText(ctx, body, width / 2, 250, width - 140, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
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

  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
}
