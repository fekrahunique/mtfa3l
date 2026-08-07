import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function Sun() {
  const group = useRef<THREE.Group>(null);
  const rays = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);

  useFrame((state) => {
    if (start.current === null) start.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - start.current;
    const t = Math.min(elapsed / 2.4, 1);
    const eased = easeOutCubic(t);

    if (group.current) {
      group.current.position.y = -3.2 + eased * 3.2;
      group.current.scale.setScalar(0.7 + eased * 0.3);
    }
    if (rays.current) {
      rays.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  const rayMeshes = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, -0.2]} rotation={[0, 0, angle]}>
            <planeGeometry args={[0.05, 0.5]} />
            <meshBasicMaterial color="#ffcf66" transparent opacity={0.35} />
          </mesh>
        );
      }),
    []
  );

  return (
    <group ref={group}>
      <group ref={rays}>{rayMeshes}</group>
      <mesh>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshBasicMaterial color="#ffb84d" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.45, 32, 32]} />
        <meshBasicMaterial color="#ff9d3d" transparent opacity={0.25} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial color="#ff7a3d" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function SunScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <Sun />
      </Canvas>
    </div>
  );
}
