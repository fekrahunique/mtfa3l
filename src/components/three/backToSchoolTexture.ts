import * as THREE from "three";
import { BTS } from "../../lib/backToSchool";

/**
 * لوحة إعلان «العودة للدراسة» بالهوية الرسمية — بنفسجي خلفية،
 * «العودة» أخضر و«للدراسة» سماوي، وسطر Back to School.
 * variant يغيّر الرسالة قليلًا حتى تتنوّع اللوحات على الطريق.
 */
export function makeBackToSchoolTexture(variant = 0) {
  const width = 1024;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // خلفية بنفسجية بتدرّج خفيف
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#5a26ad");
  grad.addColorStop(1, BTS.purple);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // إطار أبيض
  ctx.strokeStyle = BTS.white;
  ctx.lineWidth = 14;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";

  const taglines = ["نتعلّم · نلعب · نبدع", "جاهزون للعام الجديد", "مرحبًا بعودتكم", "معًا نصنع الأثر"];

  // العودة (أخضر)
  ctx.fillStyle = BTS.green;
  ctx.font = "800 150px 'Arsenica Arabic', 'Thmanyah Sans', sans-serif";
  ctx.fillText("العودة", width / 2, 180);
  // للدراسة (سماوي)
  ctx.fillStyle = BTS.sky;
  ctx.font = "800 150px 'Arsenica Arabic', 'Thmanyah Sans', sans-serif";
  ctx.fillText("للدراسة", width / 2, 340);

  // Back to School
  ctx.fillStyle = BTS.white;
  ctx.font = "700 52px 'Thmanyah Sans', sans-serif";
  ctx.fillText("Back to School", width / 2, 450);

  // شريط سفلي بالتاجلاين
  ctx.fillStyle = BTS.green;
  ctx.fillRect(26, height - 118, width - 52, 66);
  ctx.fillStyle = BTS.purple;
  ctx.font = "700 44px 'Thmanyah Sans', sans-serif";
  ctx.fillText(taglines[variant % taglines.length], width / 2, height - 82);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * الشعار اللفظي الرسمي «العودة للدراسة» على خلفية شفافة — لمدخل الفناء.
 * «العودة» أخضر و«للدراسة» سماوي، بحدّ بنفسجي، وسطر Back to School.
 */
export function makeBackToSchoolWordmark() {
  const width = 1600;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.lineJoin = "round";

  const drawWord = (text: string, y: number, fill: string) => {
    ctx.font = "800 220px 'Arsenica Arabic', 'Thmanyah Sans', sans-serif";
    ctx.lineWidth = 26;
    ctx.strokeStyle = BTS.purple;
    ctx.strokeText(text, width / 2, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, width / 2, y);
  };

  drawWord("العودة", 200, BTS.green);
  drawWord("للدراسة", 410, BTS.sky);

  ctx.font = "700 74px 'Thmanyah Sans', sans-serif";
  ctx.lineWidth = 12;
  ctx.strokeStyle = BTS.white;
  ctx.strokeText("Back to School", width / 2, 570);
  ctx.fillStyle = BTS.purple;
  ctx.fillText("Back to School", width / 2, 570);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * بانر عريض أفقي «العودة للدراسة» — لبوابات الحلبة ومدخل المدرسة.
 */
export function makeBackToSchoolBanner(variant = 0) {
  const width = 2048;
  const height = 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, BTS.purple);
  grad.addColorStop(0.5, "#5a26ad");
  grad.addColorStop(1, BTS.purple);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // شريطان علوي وسفلي بالأخضر والسماوي
  ctx.fillStyle = BTS.green;
  ctx.fillRect(0, 0, width, 20);
  ctx.fillStyle = BTS.sky;
  ctx.fillRect(0, height - 20, width, 20);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";

  const msgs = ["أهلًا بعودتكم", "عام دراسي جديد", "جاهزون للعام الجديد", "نتعلّم · نلعب · نبدع"];

  // «العودة للدراسة» في المنتصف بلونيها
  ctx.font = "800 150px 'Arsenica Arabic', 'Thmanyah Sans', sans-serif";
  ctx.fillStyle = BTS.green;
  ctx.fillText("العودة", width / 2 - 300, height / 2);
  ctx.fillStyle = BTS.sky;
  ctx.fillText("للدراسة", width / 2 + 300, height / 2);

  // رسالة على الطرفين
  ctx.fillStyle = BTS.white;
  ctx.font = "700 66px 'Thmanyah Sans', sans-serif";
  ctx.fillText(msgs[variant % msgs.length], width / 2 - 800, height / 2);
  ctx.fillText(msgs[(variant + 1) % msgs.length], width / 2 + 800, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
