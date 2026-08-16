import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { Room, Desks } from "./Classroom";
import { wrapText } from "./panelTexture";
import { useFontsReady } from "../../lib/useFontsReady";
import { useInView } from "../../lib/useInView";
import { PLANS, arDigits } from "../../data/plans";

/**
 * خلفية حيّة لقسم الباقات: فصل دافئ، طلاب يتفاعلون، وسبورة/شاشة عرض.
 * مع التمرير تعمل الكاميرا زوم على السبورة، ويتحوّل محتواها من تحدٍّ إلى
 * «خطط الاستثمار» مرسومةً على نفس السبورة — تمامًا كشاشة الأسئلة الشائعة.
 */

interface BoardItem { kind: string; title: string; points: string }

const CHALLENGES: BoardItem[] = [
  { kind: "تحدٍّ تفاعلي", title: "سباق الأسئلة", points: "١٢٠ نقطة" },
  { kind: "مغامرة", title: "خريطة الكنز", points: "كنز الفصل" },
  { kind: "تحدٍّ جماعي", title: "برج المعرفة", points: "٨ لبنات" },
  { kind: "كسر جليد", title: "بينغو التعارف", points: "أول خطّ يفوز" },
];

const SHIRTS = ["#e0556b", "#4a8fe0", "#e0a23c", "#3cb2a0", "#8a6fe0", "#5fb04a", "#e07a3c", "#d45fa8"];

const BOARD_SHORT: Record<string, string[]> = {
  starter: ["حصة أسبوعية جاهزة", "أسبوع تمهيدي حيّ", "نقاط وفائزون"],
  pro: ["١١٠+ مسابقة جاهزة", "خطة الشهر ومتابعة", "أنشطة كل المجالات"],
  premium: ["الألعاب الكبرى", "حزمة النخبة", "تقارير متقدّمة"],
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** شاشة العرض على تحدٍّ (منصة نشاط في الزاوية). */
function makeChallengeTexture(item: BoardItem): THREE.CanvasTexture {
  const width = 1400, height = 458;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#fdf7ec"); grad.addColorStop(1, "#f3e8d4");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
  ctx.direction = "rtl"; ctx.textBaseline = "middle";
  ctx.textAlign = "right"; ctx.fillStyle = "#4d1c9b"; ctx.font = "800 34px 'Thmanyah Sans', sans-serif";
  ctx.fillText("✦ منصة نشاط", width - 48, 52);
  ctx.textAlign = "left"; ctx.fillStyle = "#b06a00"; ctx.font = "700 30px 'Thmanyah Sans', sans-serif";
  ctx.fillText(`🏆 ${item.points}`, 48, 52);
  ctx.textAlign = "center"; ctx.fillStyle = "#6b4de6"; ctx.font = "700 30px 'Thmanyah Sans', sans-serif";
  ctx.fillText(`● ${item.kind} ●`, width / 2, 150);
  ctx.fillStyle = "#23203a"; ctx.font = "800 84px 'Thmanyah Sans', sans-serif";
  wrapText(ctx, item.title, width / 2, 258, width - 200, 92, 1);
  const bw = 340, bh = 74, bx = width / 2 - bw / 2, by = 340;
  ctx.fillStyle = "#f4b63a"; roundRect(ctx, bx, by, bw, bh, 38); ctx.fill();
  ctx.fillStyle = "#1a1204"; ctx.font = "800 36px 'Thmanyah Sans', sans-serif";
  ctx.fillText("ابدأ التحدي ▶", width / 2, by + bh / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4; texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** «خطط الاستثمار» — الباقات الثلاث مرسومةً على نفس السبورة. */
function makePlansTexture(): THREE.CanvasTexture {
  const width = 1400, height = 458;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#fdf9f0"); grad.addColorStop(1, "#efe2cc");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
  ctx.direction = "rtl"; ctx.textBaseline = "middle";

  // شريط علوي
  ctx.textAlign = "right"; ctx.fillStyle = "#4d1c9b"; ctx.font = "800 30px 'Thmanyah Sans', sans-serif";
  ctx.fillText("✦ منصة نشاط", width - 34, 38);
  ctx.textAlign = "left"; ctx.fillStyle = "#b06a00"; ctx.font = "700 26px 'Thmanyah Sans', sans-serif";
  ctx.fillText("للترم", 34, 38);
  ctx.textAlign = "center"; ctx.fillStyle = "#6b4de6"; ctx.font = "800 36px 'Thmanyah Sans', sans-serif";
  ctx.fillText("خطط الاستثمار في فصلك", width / 2, 84);

  const pad = 28;
  const cols = PLANS.length;
  const cw = (width - pad * (cols + 1)) / cols;
  PLANS.forEach((p, i) => {
    // من اليمين لليسار حسب ترتيب الباقات
    const x = width - pad - (i + 1) * cw - i * pad;
    const cx = x + cw / 2;
    if (p.featured) { ctx.fillStyle = "rgba(244,182,58,0.18)"; roundRect(ctx, x, 116, cw, 316, 18); ctx.fill(); ctx.strokeStyle = "#f4b63a"; ctx.lineWidth = 2; roundRect(ctx, x, 116, cw, 316, 18); ctx.stroke(); }

    let y = 150;
    if (p.badge) {
      ctx.font = "700 22px 'Thmanyah Sans', sans-serif";
      const bw = ctx.measureText(p.badge).width + 34;
      ctx.fillStyle = p.featured ? "#f4b63a" : "#e3d3b2";
      roundRect(ctx, cx - bw / 2, y - 18, bw, 36, 18); ctx.fill();
      ctx.fillStyle = p.featured ? "#1a1204" : "#5b4a2a"; ctx.textAlign = "center";
      ctx.fillText(p.badge, cx, y);
      y += 44;
    } else { y += 20; }

    ctx.fillStyle = "#23203a"; ctx.font = "800 40px 'Thmanyah Sans', sans-serif"; ctx.textAlign = "center";
    ctx.fillText(p.name, cx, y); y += 52;

    ctx.fillStyle = "#23203a"; ctx.font = "900 66px 'Thmanyah Sans', sans-serif";
    ctx.fillText(arDigits(p.term), cx, y); y += 44;
    ctx.fillStyle = "#8a7f6a"; ctx.font = "600 22px 'Thmanyah Sans', sans-serif";
    ctx.fillText("﷼ / الترم", cx, y); y += 40;

    (BOARD_SHORT[p.id] ?? []).forEach((f, k) => {
      ctx.fillStyle = "#5b5568"; ctx.font = "500 23px 'Thmanyah Sans', sans-serif";
      ctx.fillText(`✓ ${f}`, cx, y + k * 32);
    });
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4; texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Student({ position, shirt, phase }: { position: [number, number, number]; shirt: string; phase: number }) {
  const arm = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!arm.current) return;
    const raised = Math.sin(s.clock.elapsedTime * 0.7 + phase) > 0.55;
    arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, raised ? 2.5 : 0.1, 0.12);
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.16, 0]}><sphereGeometry args={[0.24, 16, 16]} /><meshStandardMaterial color="#e6b98f" roughness={0.9} /></mesh>
      <mesh position={[0, 0.66, 0]}><boxGeometry args={[0.58, 0.82, 0.4]} /><meshStandardMaterial color={shirt} roughness={0.85} /></mesh>
      <group ref={arm} position={[0.3, 0.92, 0]}>
        <mesh position={[0, -0.28, 0]}><capsuleGeometry args={[0.075, 0.5, 4, 8]} /><meshStandardMaterial color={shirt} roughness={0.85} /></mesh>
        <mesh position={[0, -0.56, 0]}><sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color="#e6b98f" roughness={0.9} /></mesh>
      </group>
    </group>
  );
}

function Students() {
  const seats = useMemo(() => {
    const list: { pos: [number, number, number]; shirt: string; phase: number }[] = [];
    const cols = 4, rows = 3;
    let n = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * 2.5;
      const z = 3.5 + r * 2.6 - 0.55;
      list.push({ pos: [x, 0, z], shirt: SHIRTS[n % SHIRTS.length], phase: n * 1.7 });
      n++;
    }
    return list;
  }, []);
  return <group>{seats.map((s, i) => <Student key={i} position={s.pos} shirt={s.shirt} phase={s.phase} />)}</group>;
}

function Scene({ progress }: { progress?: MotionValue<number> }) {
  const fontsReady = useFontsReady();
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const state = useRef<number>(-99);
  const challengeTex = useMemo(() => CHALLENGES.map(makeChallengeTexture), [fontsReady]);
  const plansTex = useMemo(() => makePlansTexture(), [fontsReady]);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    const p = progress ? Math.min(Math.max(progress.get(), 0), 1) : 0.06;

    // محتوى السبورة: تحديات ثم خطط الاستثمار عند الزوم (يتحدّث فورًا عند تبديل شهري/سنوي)
    if (p > 0.4) {
      if (screen.current && screen.current.map !== plansTex) { state.current = -1; screen.current.map = plansTex; screen.current.needsUpdate = true; }
    } else {
      const i = Math.floor(t / 3) % CHALLENGES.length;
      if (i !== state.current && screen.current) { state.current = i; screen.current.map = challengeTex[i]; screen.current.needsUpdate = true; }
    }

    const z = smoothstep(0.1, 0.55, p);
    const sway = 1 - z;
    st.camera.position.set(Math.sin(t * 0.18) * 0.5 * sway, lerp(3.5, 2.35, z) + Math.sin(t * 0.24) * 0.08 * sway, lerp(11.4, 2.4, z));
    st.camera.lookAt(0, lerp(2.25, 2.2, z), -5);
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#a08c6e", 1.55]} />
      <directionalLight position={[-8, 9, 6]} intensity={1.6} color="#fff4de" />
      <ambientLight intensity={0.75} />
      <Room />
      <Desks />
      <Students />
      {/* السبورة/الشاشة */}
      <group position={[0, 2.2, -4.9]}>
        <mesh><boxGeometry args={[10.4, 3.9, 0.16]} /><meshStandardMaterial color="#5a3f28" roughness={0.85} /></mesh>
        <mesh position={[0, 0, 0.1]}><planeGeometry args={[9.8, 3.3]} /><meshBasicMaterial ref={screen} map={challengeTex[0]} toneMapped={false} /></mesh>
      </group>
    </>
  );
}

export function ClassroomBackdrop({ className, progress }: { className?: string; progress?: MotionValue<number> }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 3.5, 11.4], fov: 55 }}
        dpr={[1, 1.25]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, toneMappingExposure: 1.15 }}
        style={{ width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Scene progress={progress} />
      </Canvas>
    </div>
  );
}
