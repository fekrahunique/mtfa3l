import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { makeBackToSchoolTexture, makeBackToSchoolBanner, makeBackToSchoolWordmark } from "./backToSchoolTexture";
import { BTS } from "../../lib/backToSchool";

function useFonts() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let c = false;
    document.fonts.ready.then(() => { if (!c) setReady(true); });
    return () => { c = true; };
  }, []);
  return ready;
}

/** لوحة إعلانية كبيرة «العودة للدراسة» على قائمين — بارزة على جانب الطريق. */
export function BtsBillboard({ position, rotationY = 0, variant = 0, scale = 1 }: { position: [number, number, number]; rotationY?: number; variant?: number; scale?: number }) {
  const ready = useFonts();
  const texture = useMemo(() => makeBackToSchoolTexture(variant), [variant, ready]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[-2.6, 3, 0]}><cylinderGeometry args={[0.2, 0.24, 6, 8]} /><meshStandardMaterial color="#4a4a55" roughness={0.9} /></mesh>
      <mesh position={[2.6, 3, 0]}><cylinderGeometry args={[0.2, 0.24, 6, 8]} /><meshStandardMaterial color="#4a4a55" roughness={0.9} /></mesh>
      <mesh position={[0, 6.6, -0.05]}><boxGeometry args={[6.6, 4.4, 0.28]} /><meshStandardMaterial color="#2f2153" roughness={0.8} /></mesh>
      <mesh position={[0, 6.6, 0.12]}><planeGeometry args={[6.1, 3.9]} /><meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={0.16} roughness={0.55} /></mesh>
    </group>
  );
}

/** بانر عريض «العودة للدراسة» — يُعلّق على عارضة أفقية (بوابة/مدخل). */
export function BtsArchBanner({ position, width = 9, height = 1.7, variant = 0, rotationY = 0 }: { position: [number, number, number]; width?: number; height?: number; variant?: number; rotationY?: number }) {
  const ready = useFonts();
  const texture = useMemo(() => makeBackToSchoolBanner(variant), [variant, ready]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.04]}><boxGeometry args={[width + 0.4, height + 0.3, 0.12]} /><meshStandardMaterial color={BTS.purple} roughness={0.8} /></mesh>
      <mesh><planeGeometry args={[width, height]} /><meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={0.2} roughness={0.5} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

/** الشعار اللفظي «العودة للدراسة» بخلفية شفافة — معلّق عند مدخل الفناء. */
export function BtsWordmark({ position, width = 8, height = 3.2, rotationY = 0 }: { position: [number, number, number]; width?: number; height?: number; rotationY?: number }) {
  const ready = useFonts();
  const texture = useMemo(() => makeBackToSchoolWordmark(), [ready]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.02} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/** رايات مثلثة بألوان الهوية على حبل — بهجة موسمية. */
export function BtsBunting({ position, count = 10, spacing = 1.1, rotationY = 0 }: { position: [number, number, number]; count?: number; spacing?: number; rotationY?: number }) {
  const colors = [BTS.green, BTS.sky, BTS.lightYellow, BTS.lightPink, BTS.white];
  const flags = useMemo(() => Array.from({ length: count }, (_, i) => ({ x: (i - (count - 1) / 2) * spacing, c: colors[i % colors.length] })), [count, spacing]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[count * spacing, 0.04, 0.04]} /><meshStandardMaterial color="#333" /></mesh>
      {flags.map((f, i) => (
        <mesh key={i} position={[f.x, -0.32, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.24, 0.55, 3]} />
          <meshStandardMaterial color={f.c} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
