import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useInView } from "../../lib/useInView";
import { BtsWordmark, BtsBunting } from "./BtsSigns";

/**
 * مشهد تسجيل ثلاثي الأبعاد حقيقي، على الأرض بأجواء صباح مدرسي:
 * شمس تُشرق، طيور، فرش خزامى حقيقي يمتدّ نحو مبنى «المربّون رواد ورائدات النشاط المتميّزون».
 * المستخدم يمشي نحو المبنى (الكاميرا تتقدّم مع كل خطوة) بتمايل مشي واقعي.
 */

const WALL = "#e7dcc4";
const WALL_DARK = "#cdbb9c";
const ROOF = "#b8613f";
const ACCENT = "#2bab9f";
const LAVENDER = "#b57edc";

/** نسيج لافتة المبنى بالعبارة. */
function makeSignTexture(): THREE.CanvasTexture {
  const w = 1024, h = 256;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f4f1e8"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = ACCENT; ctx.lineWidth = 14; ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.fillStyle = "#1c8a80"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.font = "800 66px 'Thmanyah Sans', sans-serif";
  ctx.fillText("المربّون رواد ورائدات", w / 2, h / 2 - 40);
  ctx.fillText("النشاط المتميّزون", w / 2, h / 2 + 44);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** نسيج فرش الخزامى — يبدو كسجّاد حقيقي بحدود وخيوط. */
function makeCarpetTexture(): THREE.CanvasTexture {
  const w = 256, h = 1024;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = LAVENDER; ctx.fillRect(0, 0, w, h);
  // خيوط عمودية ناعمة
  for (let x = 0; x < w; x += 4) {
    ctx.fillStyle = x % 8 === 0 ? "rgba(255,255,255,0.06)" : "rgba(90,40,120,0.06)";
    ctx.fillRect(x, 0, 2, h);
  }
  // خطوط عرضية (وبر السجاد)
  for (let y = 0; y < h; y += 6) {
    ctx.fillStyle = "rgba(70,30,100,0.05)";
    ctx.fillRect(0, y, w, 1);
  }
  // حدود ذهبية
  ctx.strokeStyle = "#e9c56b"; ctx.lineWidth = 14;
  ctx.strokeRect(18, 8, w - 36, h - 16);
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 3;
  ctx.strokeRect(30, 14, w - 60, h - 28);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 6);
  return t;
}

function SchoolBuilding() {
  const sign = useMemo(makeSignTexture, []);
  useEffect(() => () => sign.dispose(), [sign]);
  return (
    <group position={[0, 0, -26]}>
      {/* جناحان */}
      <mesh position={[-11, 4, 0]}><boxGeometry args={[14, 8, 12]} /><meshStandardMaterial color={WALL} roughness={0.9} /></mesh>
      <mesh position={[11, 4, 0]}><boxGeometry args={[14, 8, 12]} /><meshStandardMaterial color={WALL} roughness={0.9} /></mesh>
      {/* السقف */}
      <mesh position={[0, 9.4, 0]}><boxGeometry args={[36, 1.1, 13]} /><meshStandardMaterial color={ROOF} roughness={0.85} /></mesh>
      {/* المدخل الأوسط */}
      <mesh position={[0, 8.4, 0]}><boxGeometry args={[11, 2.6, 12.4]} /><meshStandardMaterial color={WALL_DARK} roughness={0.9} /></mesh>
      {/* لوحة اسم المدرسة — بارزة أمام الواجهة، غير محجوبة بالسقف، بخلفية داكنة وإضاءة للوضوح */}
      <mesh position={[0, 7.1, 6.7]}><boxGeometry args={[10.8, 3, 0.25]} /><meshStandardMaterial color="#241640" roughness={0.8} /></mesh>
      <mesh position={[0, 7.1, 6.84]}><planeGeometry args={[10.2, 2.5]} /><meshStandardMaterial map={sign} emissive="#ffffff" emissiveMap={sign} emissiveIntensity={0.28} roughness={0.6} /></mesh>
      {/* أعمدة المدخل */}
      <mesh position={[-4.8, 3.4, 6.2]}><boxGeometry args={[1.2, 6.8, 1.2]} /><meshStandardMaterial color={WALL_DARK} roughness={0.9} /></mesh>
      <mesh position={[4.8, 3.4, 6.2]}><boxGeometry args={[1.2, 6.8, 1.2]} /><meshStandardMaterial color={WALL_DARK} roughness={0.9} /></mesh>
      {/* الباب */}
      <mesh position={[0, 2.6, 6.3]}><boxGeometry args={[3.4, 5.2, 0.3]} /><meshStandardMaterial color="#8a5a2a" roughness={0.7} /></mesh>
      {/* نوافذ */}
      {Array.from({ length: 8 }, (_, i) => {
        const side = i < 4 ? -1 : 1; const idx = i % 4;
        return <mesh key={i} position={[side * (6.2 + idx * 3.1), 4.6, 6.05]}><boxGeometry args={[1.8, 1.6, 0.12]} /><meshStandardMaterial color="#8ec6e8" roughness={0.2} metalness={0.4} /></mesh>;
      })}
    </group>
  );
}

function Yard() {
  const trees = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1; const idx = Math.floor(i / 2);
    return { x: side * (7 + (i % 3)), z: -34 - idx * 14, s: 0.85 + ((i * 13) % 5) / 12 };
  }), []);
  return (
    <group>
      {/* أسوار جانبية */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 14, 3, -60]}><boxGeometry args={[1, 6, 90]} /><meshStandardMaterial color={WALL} roughness={0.9} /></mesh>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.2, 0.27, 2, 6]} /><meshStandardMaterial color="#7a5638" roughness={1} /></mesh>
          <mesh position={[0, 2.7, 0]}><sphereGeometry args={[1.2, 8, 6]} /><meshStandardMaterial color={i % 2 ? "#4aa259" : "#3f8f4d"} roughness={0.95} /></mesh>
        </group>
      ))}
      {/* سارية العلم */}
      <mesh position={[8, 5, -20]}><cylinderGeometry args={[0.1, 0.12, 10, 10]} /><meshStandardMaterial color="#c9c9cf" roughness={0.5} metalness={0.5} /></mesh>
      <mesh position={[8.9, 8.6, -20]}><planeGeometry args={[2, 1.3]} /><meshStandardMaterial color="#0b7a3b" roughness={0.8} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

/** طيور تعبر السماء صباحًا. */
function Birds() {
  const ref = useRef<THREE.Group>(null);
  const birds = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    x0: 20 + i * 6, y: 14 + (i % 3) * 3, z: -30 - (i % 4) * 8, sp: 1.4 + (i % 3) * 0.4, ph: i * 1.1,
  })), []);
  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime;
    ref.current.children.forEach((g, i) => {
      const b = birds[i];
      let x = b.x0 - ((t * b.sp + b.ph) % 44);
      g.position.set(x, b.y + Math.sin(t * 2 + b.ph) * 0.5, b.z);
      const flap = Math.sin(t * 8 + b.ph) * 0.5;
      const [l, r] = g.children as unknown as THREE.Mesh[];
      if (l && r) { l.rotation.z = 0.5 + flap; r.rotation.z = -0.5 - flap; }
    });
  });
  return (
    <group ref={ref}>
      {birds.map((_, i) => (
        <group key={i}>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.6]}><boxGeometry args={[0.7, 0.06, 0.14]} /><meshStandardMaterial color="#2f2b3a" /></mesh>
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.6]}><boxGeometry args={[0.7, 0.06, 0.14]} /><meshStandardMaterial color="#2f2b3a" /></mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({ step, total }: { step: number; total: number }) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.9;
  const prog = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;
  const look = useRef(new THREE.Vector3());

  const carpet = useMemo(makeCarpetTexture, []);
  useEffect(() => () => carpet.dispose(), [carpet]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 72 : 58; cam.updateProjectionMatrix();
  }, [camera, portrait]);

  useFrame((state, delta) => {
    const target = total > 1 ? stepRef.current / (total - 1) : 0;
    const prev = prog.current;
    prog.current = THREE.MathUtils.damp(prog.current, target, 2.6, delta);
    const moving = Math.abs(prog.current - prev) > 0.0006 ? 1 : 0.28; // شدّة تمايل المشي
    const t = prog.current;
    const z = 9 - t * 15; // يتقدّم نحو المبنى
    const bob = Math.sin(state.clock.elapsedTime * 6.5) * 0.06 * moving;
    const sway = Math.sin(state.clock.elapsedTime * 3.2) * 0.05 * moving;
    state.camera.position.set(sway, 2.35 + bob, z);
    state.camera.lookAt(look.current.set(sway * 0.5, 2.7, z - 14));
  });

  return (
    <>
      {/* سماء الصباح والشمس المنخفضة الدافئة */}
      <Sky sunPosition={[12, 4, -30]} turbidity={4} rayleigh={2.4} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={["#e9d3b0", 46, 150]} />
      <hemisphereLight args={["#ffe6c0", "#9aa87a", 1.25]} />
      <directionalLight position={[14, 10, -20]} intensity={2.4} color="#ffdca6" castShadow={false} />
      <ambientLight intensity={0.55} />

      {/* قرص الشمس المرئي عند الأفق */}
      <mesh position={[10, 4.5, -46]}><sphereGeometry args={[3.4, 24, 24]} /><meshBasicMaterial color="#fff2cf" toneMapped={false} /></mesh>

      {/* الأرض (عشب) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -40]}><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#8ec278" roughness={1} /></mesh>
      {/* ممر إسمنتي */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}><planeGeometry args={[10, 80]} /><meshStandardMaterial color="#cfc7b6" roughness={0.96} /></mesh>
      {/* فرش الخزامى الحقيقي فوق الممر نحو الباب */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -8]}><planeGeometry args={[4.4, 40]} /><meshStandardMaterial map={carpet} roughness={0.85} /></mesh>

      <SchoolBuilding />
      <Yard />
      <Birds />

      {/* هوية العودة للمدارس المعتمدة (لفظية بألوان الحملة) فوق المدخل */}
      <BtsWordmark position={[0, 12.2, -19]} width={10} height={4} />
      <BtsBunting position={[0, 6.6, -12]} count={16} spacing={1.5} />
      {/* رايتان بلون الهوية على جانبي الفرش */}
      <mesh position={[-3, 5.4, -10]}><cylinderGeometry args={[0.08, 0.09, 5, 8]} /><meshStandardMaterial color="#c9c9cf" metalness={0.4} roughness={0.5} /></mesh>
      <mesh position={[-2.1, 6.8, -10]}><planeGeometry args={[1.6, 1.05]} /><meshStandardMaterial color="#7BD84A" side={THREE.DoubleSide} roughness={0.8} /></mesh>
      <mesh position={[3, 5.4, -10]}><cylinderGeometry args={[0.08, 0.09, 5, 8]} /><meshStandardMaterial color="#c9c9cf" metalness={0.4} roughness={0.5} /></mesh>
      <mesh position={[2.1, 6.8, -10]}><planeGeometry args={[1.6, 1.05]} /><meshStandardMaterial color="#61BBFF" side={THREE.DoubleSide} roughness={0.8} /></mesh>
    </>
  );
}

export function RegisterScene3D({ step, total, className }: { step: number; total: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 2.35, 9], fov: 58 }}
        dpr={[1, 1.25]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, toneMappingExposure: 1.15 }}
        style={{ width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Scene step={step} total={total} />
      </Canvas>
    </div>
  );
}
