import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

export function TrafficLight({ position }: { position: [number, number, number] }) {
  const green = useRef<Mesh>(null);

  useFrame((state) => {
    if (!green.current) return;
    const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.4;
    (green.current.material as { opacity: number }).opacity = pulse;
  });

  return (
    <group position={position}>
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 5.2, 10]} />
        <meshStandardMaterial color="#4a4a52" roughness={0.7} metalness={0.4} />
      </mesh>

      <mesh position={[0, 5.4, 0]}>
        <boxGeometry args={[0.62, 1.6, 0.5]} />
        <meshStandardMaterial color="#2c2c33" roughness={0.8} />
      </mesh>

      <mesh position={[0, 5.92, 0.28]}>
        <circleGeometry args={[0.16, 20]} />
        <meshBasicMaterial color="#ff5f6d" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 5.4, 0.28]}>
        <circleGeometry args={[0.16, 20]} />
        <meshBasicMaterial color="#ffcf66" transparent opacity={0.25} />
      </mesh>
      <mesh ref={green} position={[0, 4.88, 0.28]}>
        <circleGeometry args={[0.16, 20]} />
        <meshBasicMaterial color="#45c9bb" transparent opacity={1} />
      </mesh>
    </group>
  );
}
