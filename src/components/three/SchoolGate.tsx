import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { CAM_START, CAM_TRAVEL, MARKER_Z } from "./schoolGateConfig";

const WALL = "#e3d6bd";
const WALL_DARK = "#cdbb9c";
const ROOF = "#b8613f";
const ACCENT = "#2bab9f";

function makeNumberTexture(n: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f4f1e8";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 12;
  ctx.strokeRect(14, 14, size - 28, size - 28);

  ctx.fillStyle = "#1c8a80";
  ctx.font = "700 150px 'Thmanyah Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(n), size / 2, size / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A numbered pylon: a landmark you drive past. All wording lives in the DOM. */
function StepMarker({ index, x, z }: { index: number; x: number; z: number }) {
  const texture = useMemo(() => makeNumberTexture(index + 1), [index]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color={WALL_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.5, 4, 1.5]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[1.8, 0.4, 1.8]} />
        <meshStandardMaterial color={ACCENT} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.9, 0.76]}>
        <planeGeometry args={[1.15, 1.15]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </group>
  );
}

function SchoolBuilding() {
  return (
    <group position={[0, 0, -24]}>
      <mesh position={[-11, 4, 0]}>
        <boxGeometry args={[14, 8, 12]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[11, 4, 0]}>
        <boxGeometry args={[14, 8, 12]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[0, 9.4, 0]}>
        <boxGeometry args={[36, 1.1, 13]} />
        <meshStandardMaterial color={ROOF} roughness={0.85} />
      </mesh>
      <mesh position={[0, 8.4, 0]}>
        <boxGeometry args={[10, 2.4, 12.4]} />
        <meshStandardMaterial color={WALL_DARK} roughness={0.9} />
      </mesh>

      <mesh position={[-4.6, 3.4, 6.2]}>
        <boxGeometry args={[1.2, 6.8, 1.2]} />
        <meshStandardMaterial color={WALL_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[4.6, 3.4, 6.2]}>
        <boxGeometry args={[1.2, 6.8, 1.2]} />
        <meshStandardMaterial color={WALL_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[0, 7.2, 6.2]}>
        <boxGeometry args={[10.4, 0.9, 1]} />
        <meshStandardMaterial color={ROOF} roughness={0.85} />
      </mesh>

      {Array.from({ length: 8 }, (_, i) => {
        const side = i < 4 ? -1 : 1;
        const idx = i % 4;
        return (
          <mesh key={i} position={[side * (6.2 + idx * 3.1), 4.4, 6.05]}>
            <boxGeometry args={[1.8, 1.5, 0.12]} />
            <meshStandardMaterial color="#8ec6e8" roughness={0.2} metalness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Wings, planting and a flagpole so the yard feels enclosed. */
function Courtyard() {
  const trees = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const idx = Math.floor(i / 2);
        return { x: side * 6.6, z: -36 - idx * 18, scale: 0.85 + ((i * 13) % 5) / 12 };
      }),
    []
  );

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 13, 3.6, -75]}>
            <boxGeometry args={[10, 7.2, 96]} />
            <meshStandardMaterial color={WALL} roughness={0.9} />
          </mesh>
          <mesh position={[side * 13, 7.5, -75]}>
            <boxGeometry args={[11, 0.9, 97]} />
            <meshStandardMaterial color={ROOF} roughness={0.85} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[side * 7.95, 3.9, -34 - i * 10]}>
              <boxGeometry args={[0.12, 1.6, 2.2]} />
              <meshStandardMaterial color="#8ec6e8" roughness={0.2} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {trees.map((tree, i) => (
        <group key={i} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.2, 0.27, 2, 6]} />
            <meshStandardMaterial color="#7a5638" roughness={1} />
          </mesh>
          <mesh position={[0, 2.7, 0]}>
            <sphereGeometry args={[1.2, 8, 6]} />
            <meshStandardMaterial color={i % 2 ? "#4aa259" : "#3f8f4d"} roughness={0.95} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 5, -118]}>
        <cylinderGeometry args={[0.1, 0.12, 10, 10]} />
        <meshStandardMaterial color="#c9c9cf" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[1.15, 8.6, -118]}>
        <planeGeometry args={[2.2, 1.4]} />
        <meshStandardMaterial color={ACCENT} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -100]}>
        <ringGeometry args={[4.6, 4.8, 48]} />
        <meshBasicMaterial color="#e8e2d4" />
      </mesh>
    </group>
  );
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.9;
  const look = useRef(new THREE.Vector3());

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 70 : 56;
    cam.updateProjectionMatrix();
  }, [camera, portrait]);

  useFrame((state) => {
    const t = Math.min(Math.max(progress.get(), 0), 1);
    const z = CAM_START - t * CAM_TRAVEL;
    state.camera.position.set(0, 2.3, z);
    state.camera.lookAt(look.current.set(0, 2.5, z - 14));
  });

  return (
    <>
      <Sky sunPosition={[60, 30, -20]} turbidity={2} rayleigh={3.2} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <fog attach="fog" args={["#b7d8ee", 60, 200]} />
      <hemisphereLight args={["#cfe8ff", "#9aa87a", 1.35]} />
      <directionalLight position={[24, 30, 10]} intensity={2.3} color="#fff6e2" />
      <ambientLight intensity={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -60]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#8ec278" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -70]}>
        <planeGeometry args={[16, 130]} />
        <meshStandardMaterial color="#c9c3b4" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[9, 60]} />
        <meshStandardMaterial color="#3f3e48" roughness={0.96} />
      </mesh>

      <SchoolBuilding />
      <Courtyard />

      {MARKER_Z.map((z, i) => (
        <StepMarker key={z} index={i} x={i % 2 === 0 ? 3.6 : -3.6} z={z} />
      ))}
    </>
  );
}

export function SchoolGate({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 2.3, CAM_START], fov: 56 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
        style={{ width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Scene progress={progress} />
      </Canvas>
    </div>
  );
}
