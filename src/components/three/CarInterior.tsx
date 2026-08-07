import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EYE_HEIGHT } from "./driveConfig";

const TRIM = "#3d3227";
const TRIM_SOFT = "#514132";
const PLASTIC = "#15120e";

/**
 * Sedan cabin sized around a driver's eye at EYE_HEIGHT. The dash sits low in
 * frame, the wheel rises into the bottom third, and the pillars run off the top
 * of the screen so the sky stays open for the headline.
 */
export function CarInterior() {
  const wheel = useRef<THREE.Group>(null);
  const needle = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (wheel.current) wheel.current.rotation.z = Math.sin(t * 0.55) * 0.12;
    if (needle.current) needle.current.rotation.z = -0.5 + Math.sin(t * 0.9) * 0.14;
  });

  const dashTop = EYE_HEIGHT - 0.68;

  return (
    <group>
      {/* Dash top surface and front face */}
      <mesh position={[0, dashTop - 0.45, 0.2]}>
        <boxGeometry args={[4.4, 0.9, 1.3]} />
        <meshStandardMaterial color={TRIM} roughness={0.92} />
      </mesh>
      <mesh position={[0, dashTop - 0.03, -0.35]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[4.4, 0.32, 0.06]} />
        <meshStandardMaterial color={TRIM_SOFT} roughness={0.75} />
      </mesh>

      {/* Instrument cluster tucked behind the wheel */}
      <mesh position={[-0.06, dashTop + 0.05, 1.32]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[0.62, 0.22, 0.05]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, dashTop + 0.06, 1.35]} rotation={[-0.42, 0, 0]}>
        <ringGeometry args={[0.055, 0.07, 20]} />
        <meshBasicMaterial color="#ffb84d" />
      </mesh>
      <mesh position={[0.08, dashTop + 0.06, 1.35]} rotation={[-0.42, 0, 0]}>
        <ringGeometry args={[0.055, 0.07, 20]} />
        <meshBasicMaterial color="#8fd8cf" />
      </mesh>
      <mesh ref={needle} position={[-0.2, dashTop + 0.06, 1.36]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[0.06, 0.012]} />
        <meshBasicMaterial color="#ff7a3d" />
      </mesh>

      {/* Centre screen angled toward the driver */}
      <mesh position={[0.52, dashTop - 0.12, 0.95]} rotation={[-0.34, -0.24, 0]}>
        <boxGeometry args={[0.44, 0.26, 0.04]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.4} />
      </mesh>
      <mesh position={[0.52, dashTop - 0.12, 0.97]} rotation={[-0.34, -0.24, 0]}>
        <planeGeometry args={[0.37, 0.2]} />
        <meshBasicMaterial color="#2c4a52" />
      </mesh>

      {/* Steering wheel */}
      <group ref={wheel} position={[-0.06, EYE_HEIGHT - 0.42, 1.3]} rotation={[-0.42, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.19, 0.028, 12, 32]} />
          <meshStandardMaterial color="#141414" roughness={0.45} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.028, 0.37, 0.02]} />
          <meshStandardMaterial color="#141414" roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.095, 0]}>
          <boxGeometry args={[0.028, 0.19, 0.02]} />
          <meshStandardMaterial color="#141414" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <circleGeometry args={[0.055, 20]} />
          <meshStandardMaterial color="#ffb84d" roughness={0.45} />
        </mesh>
      </group>

      {/* Gear selector on the console */}
      <mesh position={[0.3, dashTop - 0.5, 1.55]} rotation={[-0.22, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.032, 0.24, 10]} />
        <meshStandardMaterial color="#141414" roughness={0.5} />
      </mesh>
      <mesh position={[0.3, dashTop - 0.38, 1.53]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#2a2117" roughness={0.35} />
      </mesh>

      {/* A-pillars run off the top of frame, so the sky stays clear */}
      <mesh position={[-1.16, EYE_HEIGHT + 0.9, 0.95]} rotation={[0, 0, 0.13]}>
        <boxGeometry args={[0.1, 2.6, 0.09]} />
        <meshStandardMaterial color={TRIM} roughness={0.9} />
      </mesh>
      <mesh position={[1.16, EYE_HEIGHT + 0.9, 0.95]} rotation={[0, 0, -0.13]}>
        <boxGeometry args={[0.1, 2.6, 0.09]} />
        <meshStandardMaterial color={TRIM} roughness={0.9} />
      </mesh>
    </group>
  );
}
