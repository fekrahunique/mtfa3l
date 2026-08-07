import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WRAP_BEHIND, WRAP_SPAN } from "./driveConfig";

export type CarDirection = "same" | "oncoming";

/**
 * `relativeSpeed` is closing speed toward the camera. Traffic in our own lane
 * drifts back slowly; oncoming traffic closes fast. Cars only recycle once they
 * are fully behind the camera, so nothing ever blinks out mid-view.
 */
export function Car({
  color,
  lane,
  startZ,
  relativeSpeed,
  direction,
}: {
  color: string;
  lane: number;
  startZ: number;
  relativeSpeed: number;
  direction: CarDirection;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    let z = ref.current.position.z + relativeSpeed * delta;
    if (z > WRAP_BEHIND) z -= WRAP_SPAN;
    ref.current.position.z = z;
  });

  const facingUs = direction === "oncoming";

  return (
    <group ref={ref} position={[lane, 0, startZ]} rotation={[0, facingUs ? Math.PI : 0, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.86, 0.66, 4.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.12, -0.2]}>
        <boxGeometry args={[1.66, 0.6, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Rear window and tail lights face us when the car is travelling our way. */}
      <mesh position={[0, 1.12, 0.92]}>
        <boxGeometry args={[1.5, 0.44, 0.05]} />
        <meshStandardMaterial color="#8fc7ee" roughness={0.15} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.12, -1.32]}>
        <boxGeometry args={[1.5, 0.44, 0.05]} />
        <meshStandardMaterial color="#8fc7ee" roughness={0.15} metalness={0.5} />
      </mesh>

      <mesh position={[-0.6, 0.66, 2.11]}>
        <boxGeometry args={[0.44, 0.16, 0.05]} />
        <meshBasicMaterial color="#ff5f6d" />
      </mesh>
      <mesh position={[0.6, 0.66, 2.11]}>
        <boxGeometry args={[0.44, 0.16, 0.05]} />
        <meshBasicMaterial color="#ff5f6d" />
      </mesh>

      <mesh position={[-0.6, 0.66, -2.11]}>
        <boxGeometry args={[0.42, 0.16, 0.05]} />
        <meshBasicMaterial color="#fff3d0" />
      </mesh>
      <mesh position={[0.6, 0.66, -2.11]}>
        <boxGeometry args={[0.42, 0.16, 0.05]} />
        <meshBasicMaterial color="#fff3d0" />
      </mesh>

      {[
        [-0.96, -1.35],
        [0.96, -1.35],
        [-0.96, 1.35],
        [0.96, 1.35],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.2, 12]} />
          <meshStandardMaterial color="#1f1f1f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
