import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { STATION_Z, TRACK_START, TRACK_END } from "./runTrackConfig";


const LANE_COUNT = 6;
const LANE_WIDTH = 1.5;

const SHIRT = "#f4f1e8";
const TROUSERS = "#3f4a63";
const SKIN = "#e8b887";
const BAG = "#2bab9f";
const SHOE = "#2c2419";

/**
 * Voxel student, Minecraft style: every part is a box, arms pivot from the
 * shoulder, and the thobe is a single tall block down to the ankles.
 */
function Runner({ z }: { z: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  const HIP_Y = 0.62;
  const SHOULDER_Y = 1.26;
  const LIMB = 0.62;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const swing = Math.sin(t * 7);

    if (group.current) {
      group.current.position.z = z.current;
      group.current.position.y = Math.abs(Math.sin(t * 7)) * 0.055;
    }
    if (armL.current) armL.current.rotation.x = -swing * 0.85;
    if (armR.current) armR.current.rotation.x = swing * 0.85;
    if (legL.current) legL.current.rotation.x = swing * 0.8;
    if (legR.current) legR.current.rotation.x = -swing * 0.8;
  });

  return (
    <group ref={group}>
      {/* Torso */}
      <mesh position={[0, 0.96, 0]}>
        <boxGeometry args={[0.45, 0.68, 0.24]} />
        <meshStandardMaterial color={SHIRT} roughness={0.95} flatShading />
      </mesh>

      {/* Head, no face */}
      <mesh position={[0, 1.525, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 1.71, 0]}>
        <boxGeometry args={[0.47, 0.13, 0.47]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.95} flatShading />
      </mesh>

      {/* Arms pivot at the shoulders */}
      <group ref={armL} position={[-0.3, SHOULDER_Y, 0]}>
        <mesh position={[0, -LIMB / 2 + 0.08, 0]}>
          <boxGeometry args={[0.15, LIMB - 0.16, 0.15]} />
          <meshStandardMaterial color={SHIRT} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, -LIMB + 0.06, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.15]} />
          <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
        </mesh>
      </group>
      <group ref={armR} position={[0.3, SHOULDER_Y, 0]}>
        <mesh position={[0, -LIMB / 2 + 0.08, 0]}>
          <boxGeometry args={[0.15, LIMB - 0.16, 0.15]} />
          <meshStandardMaterial color={SHIRT} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, -LIMB + 0.06, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.15]} />
          <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* Legs pivot at the hips, shoes on the ends */}
      <group ref={legL} position={[-0.115, HIP_Y, 0]}>
        <mesh position={[0, -LIMB / 2, 0]}>
          <boxGeometry args={[0.19, LIMB, 0.19]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, -LIMB + 0.04, 0.04]}>
          <boxGeometry args={[0.2, 0.11, 0.28]} />
          <meshStandardMaterial color={SHOE} roughness={0.9} flatShading />
        </mesh>
      </group>
      <group ref={legR} position={[0.115, HIP_Y, 0]}>
        <mesh position={[0, -LIMB / 2, 0]}>
          <boxGeometry args={[0.19, LIMB, 0.19]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, -LIMB + 0.04, 0.04]}>
          <boxGeometry args={[0.2, 0.11, 0.28]} />
          <meshStandardMaterial color={SHOE} roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* Backpack on the back, facing the chase camera */}
      <mesh position={[0, 1.0, 0.22]}>
        <boxGeometry args={[0.38, 0.5, 0.2]} />
        <meshStandardMaterial color={BAG} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 1.04, 0.33]}>
        <boxGeometry args={[0.26, 0.17, 0.04]} />
        <meshStandardMaterial color="#1c8a80" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.15, 1.14, 0.0]}>
        <boxGeometry args={[0.07, 0.42, 0.04]} />
        <meshStandardMaterial color="#1c8a80" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.15, 1.14, 0.0]}>
        <boxGeometry args={[0.07, 0.42, 0.04]} />
        <meshStandardMaterial color="#1c8a80" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function makeNumberTexture(n: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#16302b";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#8fd8cf";
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, size - 32, size - 32);

  ctx.fillStyle = "#ffcf66";
  ctx.font = "700 150px 'Thmanyah Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(n), size / 2, size / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A numbered gate across the lanes. It carries no wording, so nothing in the
 * scene can collide with or obscure the copy, which lives in the DOM.
 */
function StationGate({ z, index }: { z: number; index: number }) {
  const texture = useMemo(() => makeNumberTexture(index + 1), [index]);
  useEffect(() => () => texture.dispose(), [texture]);

  const span = LANE_COUNT * LANE_WIDTH;

  return (
    <group position={[0, 0, z]}>
      <mesh position={[-span / 2 - 0.4, 2.2, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 4.4, 10]} />
        <meshStandardMaterial color="#cfc7b6" roughness={0.7} />
      </mesh>
      <mesh position={[span / 2 + 0.4, 2.2, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 4.4, 10]} />
        <meshStandardMaterial color="#cfc7b6" roughness={0.7} />
      </mesh>

      {/* Slim cross beam sits above the sight line to the horizon */}
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[span + 1.6, 0.5, 0.2]} />
        <meshStandardMaterial color="#16302b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={texture} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[span, 0.5]} />
        <meshBasicMaterial color="#f5f2ea" />
      </mesh>
    </group>
  );
}

function Track() {
  const span = LANE_COUNT * LANE_WIDTH;
  const length = TRACK_START - TRACK_END + 40;
  const mid = (TRACK_START + TRACK_END) / 2;

  const lines = useMemo(
    () => Array.from({ length: LANE_COUNT + 1 }, (_, i) => -span / 2 + i * LANE_WIDTH),
    [span]
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, mid]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#7cbd6e" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, mid]}>
        <planeGeometry args={[span, length]} />
        <meshStandardMaterial color="#b5533f" roughness={0.95} />
      </mesh>

      {lines.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, mid]}>
          <planeGeometry args={[0.09, length]} />
          <meshBasicMaterial color="#f2efe6" />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.9;
  const runnerZ = useRef(TRACK_START);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 68 : 54;
    cam.updateProjectionMatrix();
  }, [camera, portrait]);

  useFrame((state) => {
    const t = Math.min(Math.max(progress.get(), 0), 1);
    const z = TRACK_START + (TRACK_END - TRACK_START) * t;
    runnerZ.current = z;

    // Chase camera a few strides behind and above the runner.
    state.camera.position.set(0.9, 3.1, z + 8.5);
    state.camera.lookAt(0, 1.7, z - 6);
  });

  return (
    <>
      <Sky sunPosition={[50, 28, 30]} turbidity={2} rayleigh={3} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <fog attach="fog" args={["#bcd9ef", 70, 230]} />
      <hemisphereLight args={["#cfe8ff", "#8fbb7c", 1.4]} />
      <directionalLight position={[18, 26, 14]} intensity={2.3} color="#fff6e2" />
      <ambientLight intensity={0.5} />

      <Track />
      <Runner z={runnerZ} />
      {STATION_Z.map((z, i) => (
        <StationGate key={z} z={z} index={i} />
      ))}
    </>
  );
}

export function RunTrack({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0.9, 3.1, 16], fov: 54 }}
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
