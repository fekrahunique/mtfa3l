import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { wrapText } from "./panelTexture";
import { useFontsReady } from "../../lib/useFontsReady";
import { backToSchoolSeason } from "../../lib/backToSchool";
import { makeBackToSchoolTexture } from "./backToSchoolTexture";

export interface Faq {
  q: string;
  a: string;
}

const WALL = "#e6dcc6";
const FLOOR = "#b9a284";
const DESK = "#c69463";
const BOARD_FRAME = "#6b4a2f";

/**
 * Draws one question and answer as chalk on a slate texture. The canvas aspect
 * matches the board mesh exactly, otherwise the Arabic stretches horizontally.
 */
function makeBoardTexture(index: number, total: number, faq: Faq) {
  const width = 1400;
  const height = 458;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#22443c";
  ctx.fillRect(0, 0, width, height);

  // Faint chalk smudges
  ctx.strokeStyle = "#3a6157";
  ctx.lineWidth = 22;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(60 + i * 110, 90 + ((i * 53) % 200));
    ctx.lineTo(240 + i * 150, 140 + ((i * 91) % 210));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#8fd8cf";
  ctx.font = "700 30px 'Thmanyah Sans', sans-serif";
  ctx.fillText(`سؤال ${index + 1} من ${total}`, width / 2, 48);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 52px 'Thmanyah Sans', sans-serif";
  wrapText(ctx, faq.q, width / 2, 124, width - 160, 64, 2);

  ctx.strokeStyle = "#5c8d81";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 232);
  ctx.lineTo(width - 180, 232);
  ctx.stroke();

  ctx.fillStyle = "#dceee9";
  ctx.font = "400 34px 'Thmanyah Sans', sans-serif";
  wrapText(ctx, faq.a, width / 2, 292, width - 180, 46, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function Desks() {
  const rows = 4;
  const cols = 4;
  const desks = useMemo(() => {
    const list: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push([(c - (cols - 1) / 2) * 2.5, 3.5 + r * 2.6]);
      }
    }
    return list;
  }, []);

  return (
    <group>
      {desks.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[1.5, 0.09, 0.72]} />
            <meshStandardMaterial color={DESK} roughness={0.85} />
          </mesh>
          {[
            [-0.62, -0.28],
            [0.62, -0.28],
            [-0.62, 0.28],
            [0.62, 0.28],
          ].map(([lx, lz], j) => (
            <mesh key={j} position={[lx, 0.36, lz]}>
              <cylinderGeometry args={[0.045, 0.045, 0.72, 6]} />
              <meshStandardMaterial color="#8a8a90" roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 0.46, 0.62]}>
            <boxGeometry args={[1.2, 0.08, 0.44]} />
            <meshStandardMaterial color="#2bab9f" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.9, 0.84]}>
            <boxGeometry args={[1.2, 0.78, 0.08]} />
            <meshStandardMaterial color="#2bab9f" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]}>
        <planeGeometry args={[16, 34]} />
        <meshStandardMaterial color={FLOOR} roughness={0.95} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.2, 6]}>
        <planeGeometry args={[16, 34]} />
        <meshStandardMaterial color="#f2ece0" roughness={0.95} />
      </mesh>

      {/* Front wall behind the board */}
      <mesh position={[0, 2.1, -5]}>
        <planeGeometry args={[16, 4.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      {/* Side walls with daylight windows */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-8, 2.1, 6]}>
        <planeGeometry args={[34, 4.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[8, 2.1, 6]}>
        <planeGeometry args={[34, 4.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} rotation={[0, Math.PI / 2, 0]} position={[-7.94, 2.5, 1 + i * 5]}>
          <planeGeometry args={[3, 1.9]} />
          <meshBasicMaterial color="#cfe8ff" />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ progress, faqs }: { progress: MotionValue<number>; faqs: Faq[] }) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.9;
  const fontsReady = useFontsReady();
  const board = useRef<THREE.MeshStandardMaterial>(null);
  const activeIndex = useRef(-1);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 72 : 58;
    cam.updateProjectionMatrix();
  }, [camera, portrait]);

  const textures = useMemo(
    () => faqs.map((faq, i) => makeBoardTexture(i, faqs.length, faq)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faqs, fontsReady]
  );

  useEffect(
    () => () => {
      textures.forEach((t) => t.dispose());
    },
    [textures]
  );

  // بوستر «العودة للدراسة» الموسمي على جدار الفصل
  const btsSeason = backToSchoolSeason();
  const btsTexture = useMemo(
    () => (btsSeason ? makeBackToSchoolTexture(1) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [btsSeason, fontsReady]
  );
  useEffect(() => () => btsTexture?.dispose(), [btsTexture]);

  useFrame((state) => {
    const t = Math.min(Math.max(progress.get(), 0), 0.999);
    const index = Math.min(Math.floor(t * faqs.length), faqs.length - 1);

    if (index !== activeIndex.current && board.current) {
      activeIndex.current = index;
      board.current.map = textures[index];
      board.current.needsUpdate = true;
    }

    // Slow push toward the board as the questions advance.
    const z = 6.5 - t * 4.5;
    state.camera.position.set(0, 1.85, z);
    state.camera.lookAt(0, 2.15, -5);
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#a08c6e", 1.5]} />
      <directionalLight position={[-8, 8, 6]} intensity={1.5} color="#fff4de" />
      <ambientLight intensity={0.7} />

      <Room />
      <Desks />

      {/* Chalkboard */}
      <group position={[0, 2.15, -4.92]}>
        <mesh>
          <boxGeometry args={[10.3, 3.7, 0.14]} />
          <meshStandardMaterial color={BOARD_FRAME} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[9.8, 3.2]} />
          <meshStandardMaterial ref={board} map={textures[0]} roughness={0.9} />
        </mesh>
        <mesh position={[0, -1.95, 0.16]}>
          <boxGeometry args={[10.3, 0.14, 0.3]} />
          <meshStandardMaterial color={BOARD_FRAME} roughness={0.9} />
        </mesh>
      </group>

      {/* بوستر العودة للدراسة الموسمي — معلّق على الجدار الأمامي بجانب السبورة */}
      {btsTexture && (
        <group position={[6.4, 2.5, -4.9]}>
          <mesh><boxGeometry args={[2.9, 1.95, 0.1]} /><meshStandardMaterial color="#2f2153" roughness={0.8} /></mesh>
          <mesh position={[0, 0, 0.07]}><planeGeometry args={[2.6, 1.65]} /><meshStandardMaterial map={btsTexture} roughness={0.6} /></mesh>
        </group>
      )}
    </>
  );
}

export function Classroom({
  progress,
  faqs,
  className,
}: {
  progress: MotionValue<number>;
  faqs: Faq[];
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.85, 6.5], fov: 58 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, toneMappingExposure: 1.15 }}
        style={{ width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Scene progress={progress} faqs={faqs} />
      </Canvas>
    </div>
  );
}
