import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Room, Desks } from "./Classroom";
import { wrapText } from "./panelTexture";
import { useFontsReady } from "../../lib/useFontsReady";
import { useInView } from "../../lib/useInView";

/**
 * خلفية حيّة لقسم الباقات: فصل دافئ، طلاب يرفعون أيديهم بتفاعل،
 * وشاشة عرض مضيئة تُظهر تحديات ومسابقات نشاط بالتناوب.
 */

interface BoardItem { kind: string; title: string; points: string }

const CHALLENGES: BoardItem[] = [
  { kind: "تحدٍّ تفاعلي", title: "سباق الأسئلة", points: "١٢٠ نقطة" },
  { kind: "مغامرة", title: "خريطة الكنز", points: "كنز الفصل" },
  { kind: "تحدٍّ جماعي", title: "برج المعرفة", points: "٨ لبنات" },
  { kind: "كسر جليد", title: "بينغو التعارف", points: "أول خطّ يفوز" },
  { kind: "ذاكرة وحماس", title: "صدى الإيقاع", points: "٨ حركات" },
  { kind: "مسابقة", title: "مبارزة الأزرار", points: "الأسرع يفوز" },
];

const SHIRTS = ["#e0556b", "#4a8fe0", "#e0a23c", "#3cb2a0", "#8a6fe0", "#5fb04a", "#e07a3c", "#d45fa8"];

/** شاشة عرض مضيئة تحاكي واجهة نشاط مفتوحة على تحدٍّ. */
function makeScreenTexture(item: BoardItem): THREE.CanvasTexture {
  const width = 1400;
  const height = 458;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // خلفية الشاشة كريمية فاتحة
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#fdf7ec");
  grad.addColorStop(1, "#f3e8d4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.direction = "rtl";
  ctx.textBaseline = "middle";

  // الشريط العلوي: منصة نشاط + النقاط
  ctx.textAlign = "right";
  ctx.fillStyle = "#4d1c9b";
  ctx.font = "800 34px 'Thmanyah Sans', sans-serif";
  ctx.fillText("✦ منصة نشاط", width - 48, 52);
  ctx.textAlign = "left";
  ctx.fillStyle = "#b06a00";
  ctx.font = "700 30px 'Thmanyah Sans', sans-serif";
  ctx.fillText(`🏆 ${item.points}`, 48, 52);

  // شارة نوع التحدي
  ctx.textAlign = "center";
  ctx.fillStyle = "#6b4de6";
  ctx.font = "700 30px 'Thmanyah Sans', sans-serif";
  ctx.fillText(`● ${item.kind} ●`, width / 2, 138);

  // عنوان التحدي الكبير
  ctx.fillStyle = "#23203a";
  ctx.font = "800 82px 'Thmanyah Sans', sans-serif";
  wrapText(ctx, item.title, width / 2, 242, width - 200, 92, 1);

  // زر ابدأ التحدي
  const bw = 360, bh = 78, bx = width / 2 - bw / 2, by = 336;
  ctx.fillStyle = "#f4b63a";
  ctx.beginPath();
  const r = 40;
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1204";
  ctx.font = "800 38px 'Thmanyah Sans', sans-serif";
  ctx.fillText("ابدأ التحدي ▶", width / 2, by + bh / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** طالب يجلس عند مقعده ويرفع يده بين الحين والآخر. */
function Student({ position, shirt, phase }: { position: [number, number, number]; shirt: string; phase: number }) {
  const arm = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!arm.current) return;
    const raised = Math.sin(s.clock.elapsedTime * 0.7 + phase) > 0.55;
    arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, raised ? 2.5 : 0.1, 0.12);
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.16, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color="#e6b98f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[0.58, 0.82, 0.4]} />
        <meshStandardMaterial color={shirt} roughness={0.85} />
      </mesh>
      {/* الذراع اليمنى تُرفع */}
      <group ref={arm} position={[0.3, 0.92, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.075, 0.5, 4, 8]} />
          <meshStandardMaterial color={shirt} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.56, 0]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#e6b98f" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Students() {
  const seats = useMemo(() => {
    const list: { pos: [number, number, number]; shirt: string; phase: number }[] = [];
    const cols = 4, rows = 3;
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * 2.5;
        const z = 3.5 + r * 2.6 - 0.55; // خلف سطح المقعد مباشرة
        list.push({ pos: [x, 0, z], shirt: SHIRTS[n % SHIRTS.length], phase: n * 1.7 });
        n++;
      }
    }
    return list;
  }, []);
  return (
    <group>
      {seats.map((s, i) => (
        <Student key={i} position={s.pos} shirt={s.shirt} phase={s.phase} />
      ))}
    </group>
  );
}

function Scene() {
  const fontsReady = useFontsReady();
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const idx = useRef(-1);
  const textures = useMemo(
    () => CHALLENGES.map(makeScreenTexture),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontsReady]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // تبديل التحدي كل ٣ ثوانٍ
    const i = Math.floor(t / 3) % CHALLENGES.length;
    if (i !== idx.current && screen.current) {
      idx.current = i;
      screen.current.map = textures[i];
      screen.current.needsUpdate = true;
    }
    // تمايل لطيف للكاميرا
    state.camera.position.set(Math.sin(t * 0.18) * 0.5, 3.5 + Math.sin(t * 0.24) * 0.08, 11.4);
    state.camera.lookAt(0, 2.25, -5);
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#a08c6e", 1.55]} />
      <directionalLight position={[-8, 9, 6]} intensity={1.6} color="#fff4de" />
      <ambientLight intensity={0.75} />

      <Room />
      <Desks />
      <Students />

      {/* شاشة العرض المضيئة */}
      <group position={[0, 2.2, -4.9]}>
        <mesh>
          <boxGeometry args={[10.4, 3.9, 0.16]} />
          <meshStandardMaterial color="#2b2140" roughness={0.7} />
        </mesh>
        {/* توهّج خفيف خلف الشاشة */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[10.1, 3.6]} />
          <meshBasicMaterial color="#f4b63a" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[9.8, 3.3]} />
          <meshBasicMaterial ref={screen} map={textures[0]} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

export function ClassroomBackdrop({ className }: { className?: string }) {
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
        <Scene />
      </Canvas>
    </div>
  );
}
