import * as THREE from "three";

/**
 * لوحة اسم المدرسة فوق المدخل. تواجه الكاميرا مباشرة وبنسبة مطابقة
 * لسطحها، فلا يتشوّه النص العربي — نفس أسلوب لافتات المشروع
 * (WoodenSign) مع ctx.direction = "rtl".
 */
export function makeSchoolSignTexture(name: string, theme: { banner: string; ink: string; edge: string }) {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = theme.banner;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = theme.edge;
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  ctx.strokeStyle = theme.edge;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.ink;

  const clean = (name || "نشاط").trim();
  let font = 96;
  ctx.font = `700 ${font}px 'Thmanyah Sans', sans-serif`;
  while (ctx.measureText(clean).width > width - 130 && font > 40) {
    font -= 6;
    ctx.font = `700 ${font}px 'Thmanyah Sans', sans-serif`;
  }
  ctx.fillText(clean, width / 2, height / 2 + 4, width - 110);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
