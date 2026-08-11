import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { WeekTheme } from "../../lib/weekTheme";
import { makeSchoolSignTexture } from "./schoolSignTexture";

/** واجهة مبنى المدرسة، تُرى من الأمام، وفوق مدخلها لوحة الاسم. */
function SchoolBuilding({ theme, schoolName }: { theme: WeekTheme; schoolName: string }) {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sign = useMemo(
    () =>
      makeSchoolSignTexture(schoolName, {
        banner: theme.banner,
        ink: theme.bannerInk,
        edge: theme.accentSoft,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schoolName, theme.banner, theme.bannerInk, theme.accentSoft, fontsReady]
  );
  useEffect(() => () => sign.dispose(), [sign]);

  const windows = useMemo(() => {
    const items: { x: number; y: number }[] = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 6; col++) {
        items.push({ x: -7.5 + col * 3, y: 4.6 + row * 3.4 });
      }
    }
    return items;
  }, []);

  return (
    <group position={[0, 0, -6]}>
      {/* الكتلة الرئيسية */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[20, 10, 8]} />
        <meshStandardMaterial color={theme.wall} roughness={0.9} />
      </mesh>
      {/* السقف */}
      <mesh position={[0, 10.4, 0]}>
        <boxGeometry args={[21, 1, 8.6]} />
        <meshStandardMaterial color={theme.roof} roughness={0.85} />
      </mesh>
      {/* الجناح الأمامي البارز حول المدخل */}
      <mesh position={[0, 4, 4.1]}>
        <boxGeometry args={[11, 8, 1.2]} />
        <meshStandardMaterial color={theme.wallTrim} roughness={0.9} />
      </mesh>

      {/* إطار فاتح خلف اللوحة يزيد التباين */}
      <mesh position={[0, 7.7, 4.72]}>
        <planeGeometry args={[10, 2.8]} />
        <meshBasicMaterial color={theme.bannerInk} toneMapped={false} />
      </mesh>
      {/* لوحة اسم المدرسة فوق المدخل، تواجه الكاميرا، بنسبة مطابقة للنسيج (4:1) */}
      <mesh position={[0, 7.7, 4.75]}>
        <planeGeometry args={[9.6, 2.4]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>

      {/* الباب */}
      <mesh position={[0, 2, 4.75]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial color={theme.roof} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2, 4.78]}>
        <planeGeometry args={[0.14, 3.6]} />
        <meshStandardMaterial color={theme.accentSoft} />
      </mesh>

      {/* النوافذ */}
      {windows.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, 4.06]}>
          <planeGeometry args={[1.5, 1.7]} />
          <meshStandardMaterial
            color={theme.window}
            roughness={0.15}
            metalness={0.5}
            emissive={theme.window}
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

/** نخلة بسيطة للمناسبة الوطنية. */
function Palm({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const fronds = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.22, 0.34, 4.8, 7]} />
        <meshStandardMaterial color="#8a6234" roughness={1} />
      </mesh>
      {fronds.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 0.7, 4.9, Math.sin(a) * 0.7]}
          rotation={[0, -a, 0.9]}
        >
          <boxGeometry args={[3, 0.12, 0.7]} />
          <meshStandardMaterial color={i % 2 ? "#2FBF78" : "#1E9E63"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** علم أخضر مجرّد على سارية — بلا نص، فقط لون ولمحة بيضاء. */
function Flag({ position, wind }: { position: [number, number, number]; wind: React.MutableRefObject<number> }) {
  const cloth = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(wind.current) * 0.18;
  });
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 6, 8]} />
        <meshStandardMaterial color="#c9c9cf" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh ref={cloth} position={[0.95, 5.1, 0]}>
        <planeGeometry args={[1.9, 1.2]} />
        <meshStandardMaterial color="#1E9E63" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.95, 5.1, 0.01]}>
        <planeGeometry args={[1.4, 0.12]} />
        <meshStandardMaterial color="#F4F1E8" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** شجرة كروية للتيمة المحايدة. */
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.27, 2, 6]} />
        <meshStandardMaterial color="#7a5638" roughness={1} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <sphereGeometry args={[1.3, 8, 6]} />
        <meshStandardMaterial color="#3f8f4d" roughness={0.95} />
      </mesh>
    </group>
  );
}

/** مايكروفون على حامل — للتربية الإعلامية. */
function Microphone({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 5, 8]} />
        <meshStandardMaterial color="#3a2a5c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.5, 8]} />
        <meshStandardMaterial color="#4a3379" />
      </mesh>
      <mesh position={[0, 5.35, 0]}>
        <sphereGeometry args={[0.42, 14, 12]} />
        <meshStandardMaterial color="#c77dde" metalness={0.5} roughness={0.35} emissive="#a855c7" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

/** كاميرا على حامل بعدسة مضيئة (فلاش) — للتربية الإعلامية. */
function Camera({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 3.4, 8]} />
        <meshStandardMaterial color="#4a3379" />
      </mesh>
      <mesh position={[0, 3.7, 0]}>
        <boxGeometry args={[1.7, 1.2, 1.1]} />
        <meshStandardMaterial color="#2f2153" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.7, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 0.7, 16]} />
        <meshStandardMaterial color="#14101f" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.7, 0.98]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#f6f0ff" emissive="#c77dde" emissiveIntensity={0.9} />
      </mesh>
      {/* فلاش أعلى الجسم */}
      <mesh position={[0.55, 4.45, 0]}>
        <boxGeometry args={[0.45, 0.28, 0.5]} />
        <meshStandardMaterial color="#f6f0ff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/** درع مضيء — للأمن السيبراني. */
function Shield({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 2.2, 8]} />
        <meshStandardMaterial color="#0e2438" />
      </mesh>
      <mesh position={[0, 4.1, 0]}>
        <boxGeometry args={[1.7, 2, 0.35]} />
        <meshStandardMaterial color="#173a5e" emissive="#22b8d8" emissiveIntensity={0.3} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.75, 0]} rotation={[0, Math.PI / 4, Math.PI]}>
        <coneGeometry args={[1.15, 1.5, 4]} />
        <meshStandardMaterial color="#173a5e" emissive="#22b8d8" emissiveIntensity={0.3} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* علامة حماية مضيئة */}
      <mesh position={[0, 4.2, 0.19]}>
        <boxGeometry args={[0.55, 0.16, 0.05]} />
        <meshStandardMaterial color="#5fe3f7" emissive="#5fe3f7" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 3.9, 0.19]}>
        <boxGeometry args={[0.16, 0.7, 0.05]} />
        <meshStandardMaterial color="#5fe3f7" emissive="#5fe3f7" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

/** قفل رقمي مضيء — للأمن السيبراني. */
function Lock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 2.6, 8]} />
        <meshStandardMaterial color="#0e2438" />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[1.4, 1.2, 0.7]} />
        <meshStandardMaterial color="#0e2438" emissive="#22b8d8" emissiveIntensity={0.22} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.12, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#8fe3f2" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.55, 0.36]}>
        <circleGeometry args={[0.19, 12]} />
        <meshStandardMaterial color="#5fe3f7" emissive="#5fe3f7" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/** كوكب عائم — لأسبوع الفضاء. */
function Planet({
  position,
  color,
  ring = false,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  ring?: boolean;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1.3, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {ring && (
        <mesh rotation={[1.3, 0, 0.35]}>
          <torusGeometry args={[2, 0.14, 12, 40]} />
          <meshStandardMaterial color="#c9c0ff" emissive="#8b7fff" emissiveIntensity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/** صاروخ على الأرض — لأسبوع الفضاء. */
function Rocket({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 3, 16]} />
        <meshStandardMaterial color="#e9e9f7" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 6, 0]}>
        <coneGeometry args={[0.6, 1.4, 16]} />
        <meshStandardMaterial color="#f0a5c0" />
      </mesh>
      <mesh position={[0, 4.3, 0.6]}>
        <circleGeometry args={[0.34, 16]} />
        <meshStandardMaterial color="#8b7fff" emissive="#8b7fff" emissiveIntensity={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.6, 2.7, 0]} rotation={[0, 0, s * 0.35]}>
          <boxGeometry args={[0.3, 1.3, 0.6]} />
          <meshStandardMaterial color="#f0a5c0" />
        </mesh>
      ))}
      <mesh position={[0, 2.0, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.42, 1, 12]} />
        <meshStandardMaterial color="#ffb84d" emissive="#ff9d3d" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

/** طائر مبسّط بجناحين يرفرفان ويعبر السماء ثم يلتفّ. */
const BIRD_COUNT = 7;
function Birds({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const birds = useMemo(
    () =>
      Array.from({ length: BIRD_COUNT }, (_, i) => ({
        y: 14 + ((i * 7) % 6),
        z: -14 - ((i * 5) % 16),
        speed: 1.6 + ((i * 13) % 7) / 5,
        flap: 5 + (i % 4),
        phase: (i / BIRD_COUNT) * Math.PI * 2,
        span: 44,
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = animate ? state.clock.elapsedTime : 0;
    group.current.children.forEach((child, i) => {
      const b = birds[i];
      const x = (((t * b.speed + b.phase * 6) % b.span) + b.span) % b.span - b.span / 2;
      child.position.set(x, b.y + Math.sin(t * 0.6 + b.phase) * 0.6, b.z);
      const flap = Math.sin(t * b.flap + b.phase) * 0.5;
      // الجناحان مجموعتان تدوران حول مركز الطائر فيبقيان متصلين.
      const left = child.children[0] as THREE.Group;
      const right = child.children[1] as THREE.Group;
      if (left) left.rotation.z = 0.35 + flap;
      if (right) right.rotation.z = -0.35 - flap;
    });
  });

  return (
    <group ref={group}>
      {birds.map((_, i) => (
        <group key={i}>
          {/* الجناح الأيسر: يمتدّ يسارًا من المركز ويدور حوله */}
          <group>
            <mesh position={[-0.45, 0, 0]}>
              <boxGeometry args={[0.9, 0.05, 0.26]} />
              <meshStandardMaterial color="#2a3d38" roughness={1} />
            </mesh>
          </group>
          {/* الجناح الأيمن */}
          <group>
            <mesh position={[0.45, 0, 0]}>
              <boxGeometry args={[0.9, 0.05, 0.26]} />
              <meshStandardMaterial color="#2a3d38" roughness={1} />
            </mesh>
          </group>
          {/* جسم صغير يربط الجناحين في المنتصف */}
          <mesh>
            <boxGeometry args={[0.18, 0.13, 0.34]} />
            <meshStandardMaterial color="#212f2b" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({
  theme,
  schoolName,
  animate,
  scroll,
}: {
  theme: WeekTheme;
  schoolName: string;
  animate: boolean;
  scroll?: MotionValue<number>;
}) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.85;
  const wind = useRef(0);
  const baseZ = portrait ? 30 : 23;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 62 : 46;
    cam.position.set(0, 6, baseZ);
    cam.updateProjectionMatrix();
  }, [camera, portrait, baseZ]);

  useFrame((state) => {
    wind.current += 0.03;
    const t = animate ? state.clock.elapsedTime : 0;
    // السحب للأسفل يرفع الكاميرا ويبعدها تدريجيًا فيعطي إحساس دخول للمحتوى.
    const s = scroll ? Math.min(Math.max(scroll.get(), 0), 1) : 0;
    camera.position.x = Math.sin(t * 0.12) * 1.1;
    camera.position.y = 6 + s * 5 + Math.sin(t * 0.16) * 0.22;
    camera.position.z = baseZ + s * 9;
    camera.lookAt(0, 6.8 - s * 2, -6);
  });

  return (
    <>
      <Sky sunPosition={theme.sunPosition} turbidity={2.4} rayleigh={2.6} mieCoefficient={0.005} mieDirectionalG={0.85} />
      <fog attach="fog" args={[theme.skyBottom, 70, 170]} />
      <hemisphereLight args={[theme.skyTop, theme.ground, 1.4]} />
      <directionalLight position={theme.sunPosition} intensity={2.1} color="#fff6e2" />
      <ambientLight intensity={0.55} />

      {/* الأرض */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={theme.ground} roughness={1} />
      </mesh>
      {/* ممر المدخل */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8]}>
        <planeGeometry args={[6, 30]} />
        <meshStandardMaterial color={theme.path} roughness={0.95} />
      </mesh>

      <SchoolBuilding theme={theme} schoolName={schoolName} />

      {/* زينة توحي بموضوع الأسبوع */}
      {theme.decor === "national" && (
        <>
          <Palm position={[-13, 0, 2]} scale={1.05} />
          <Palm position={[13, 0, 2]} scale={0.95} />
          <Palm position={[-16, 0, -8]} scale={1.15} />
          <Palm position={[16, 0, -8]} scale={1.1} />
          <Flag position={[-6.5, 0, 6]} wind={wind} />
          <Flag position={[6.5, 0, 6]} wind={wind} />
        </>
      )}
      {theme.decor === "media" && (
        <>
          <Camera position={[-13, 0, 3]} scale={1.05} />
          <Camera position={[15, 0, -8]} scale={1.1} />
          <Microphone position={[13, 0, 3]} scale={1} />
          <Microphone position={[-15, 0, -8]} scale={1.1} />
          <Microphone position={[-6.5, 0, 6]} scale={0.9} />
          <Camera position={[6.5, 0, 6]} scale={0.85} />
        </>
      )}
      {theme.decor === "cyber" && (
        <>
          <Shield position={[-13, 0, 3]} scale={1.05} />
          <Shield position={[15, 0, -8]} scale={1.1} />
          <Lock position={[13, 0, 3]} scale={1} />
          <Lock position={[-15, 0, -8]} scale={1.1} />
          <Shield position={[-6.5, 0, 6]} scale={0.85} />
          <Lock position={[6.5, 0, 6]} scale={0.85} />
        </>
      )}
      {theme.decor === "space" && (
        <>
          <Planet position={[-14, 10, -8]} color="#b3a8ff" scale={1.2} />
          <Planet position={[15, 12, -12]} color="#f0a5c0" ring scale={1.5} />
          <Planet position={[9, 8, -4]} color="#8b7fff" scale={0.75} />
          <Rocket position={[-13, 0, 3]} scale={1.1} />
          <Rocket position={[14, 0, 2]} scale={0.9} />
        </>
      )}
      {theme.decor === "generic" && (
        <>
          <Tree position={[-13, 0, 2]} scale={1.1} />
          <Tree position={[13, 0, 2]} scale={1} />
          <Tree position={[-16, 0, -8]} scale={1.2} />
          <Tree position={[16, 0, -8]} scale={1.15} />
        </>
      )}

      <Birds animate={animate} />
    </>
  );
}

export function DashboardScene({
  theme,
  schoolName,
  animate,
  scroll,
  className,
}: {
  theme: WeekTheme;
  schoolName: string;
  animate: boolean;
  scroll?: MotionValue<number>;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.25]}
        gl={{ antialias: true, toneMappingExposure: 1.15 }}
        style={{ width: "100%", height: "100%" }}
        frameloop={animate ? "always" : "demand"}
        resize={{ debounce: 0 }}
      >
        <Scene theme={theme} schoolName={schoolName} animate={animate} scroll={scroll} />
      </Canvas>
    </div>
  );
}
