import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROAD_SPEED, WRAP_BEHIND, WRAP_SPAN } from "./driveConfig";
import { makeBackToSchoolTexture } from "./backToSchoolTexture";

/**
 * لوحات إعلانية «العودة للدراسة» على جانبي الطريق — تُعاد تدويرها مثل بقية
 * المشهد (z-wrap) فتظهر تباعًا كإعلانات الطرق. موسمية: تُعرض في العودة للدراسة فقط.
 */
function Billboard({ side, index, texture }: { side: 1 | -1; index: number; texture: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const zRef = useRef(WRAP_BEHIND - index * (WRAP_SPAN / 4));
  const x = side * (24 + (index % 2) * 3);

  useFrame((_, delta) => {
    let z = zRef.current + ROAD_SPEED * delta;
    if (z > WRAP_BEHIND) z -= WRAP_SPAN;
    zRef.current = z;
    if (group.current) group.current.position.z = z;
  });

  return (
    <group ref={group} position={[x, 0, zRef.current]} rotation={[0, side === 1 ? -0.5 : 0.5, 0]}>
      {/* قائمان */}
      <mesh position={[-3.2, 4, 0]}><cylinderGeometry args={[0.22, 0.26, 8, 8]} /><meshStandardMaterial color="#4a4a55" roughness={0.9} /></mesh>
      <mesh position={[3.2, 4, 0]}><cylinderGeometry args={[0.22, 0.26, 8, 8]} /><meshStandardMaterial color="#4a4a55" roughness={0.9} /></mesh>
      {/* إطار اللوحة */}
      <mesh position={[0, 8.4, 0]}><boxGeometry args={[8.4, 5.4, 0.3]} /><meshStandardMaterial color="#2f2153" roughness={0.8} /></mesh>
      {/* وجه اللوحة بالهوية */}
      <mesh position={[0, 8.4, 0.18]}><planeGeometry args={[7.9, 4.9]} /><meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={0.18} roughness={0.6} /></mesh>
    </group>
  );
}

export function Billboards() {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled) setFontsReady(true); });
    return () => { cancelled = true; };
  }, []);

  const textures = useMemo(
    () => [0, 1, 2, 3].map((v) => makeBackToSchoolTexture(v)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontsReady]
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  // لوحتان على كل جانب تظهران بالتناوب على طول الطريق
  const items = useMemo(
    () => [
      { side: 1 as const, index: 0 }, { side: -1 as const, index: 1 },
      { side: 1 as const, index: 2 }, { side: -1 as const, index: 3 },
    ],
    []
  );

  return (
    <group>
      {items.map((it, i) => (
        <Billboard key={i} side={it.side} index={it.index} texture={textures[i % textures.length]} />
      ))}
    </group>
  );
}
