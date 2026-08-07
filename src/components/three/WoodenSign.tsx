import { useEffect, useMemo, useState } from "react";
import { makeSignTexture } from "./signTexture";

export function WoodenSign({
  position,
  rotationY,
  title,
  body,
  step,
}: {
  position: [number, number, number];
  rotationY: number;
  title: string;
  body: string;
  step: string;
}) {
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

  const texture = useMemo(
    () => makeSignTexture(step, title, body),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, title, body, fontsReady]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[-2.1, 1.5, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 3, 8]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.95} />
      </mesh>
      <mesh position={[2.1, 1.5, 0]}>
        <cylinderGeometry args={[0.16, 0.19, 3, 8]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.95} />
      </mesh>

      <mesh position={[0, 4.05, 0]}>
        <boxGeometry args={[7.8, 3.5, 0.24]} />
        <meshStandardMaterial color="#8a5f3c" roughness={0.92} />
      </mesh>

      <mesh position={[0, 4.05, 0.13]}>
        <planeGeometry args={[7.3, 3.1]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </group>
  );
}
