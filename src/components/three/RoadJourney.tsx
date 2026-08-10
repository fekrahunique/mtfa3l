import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { WoodenSign } from "./WoodenSign";
import { BtsBillboard } from "./BtsSigns";
import { backToSchoolSeason } from "../../lib/backToSchool";

const ROAD_HALF_WIDTH = 4.5;

// Short legs and tight bends: a new turn arrives every few seconds of scroll.
const waypoints: [number, number][] = [
  [0, 8],
  [0, -14],
  [15, -36],
  [15, -58],
  [-5, -80],
  [-5, -102],
  [16, -124],
  [16, -146],
  [-4, -168],
  [-4, -190],
  [17, -212],
  [17, -234],
];

const SIGN_T = [0.125, 0.3, 0.49, 0.675, 0.86];

/** Full attention while a sign sits 12–30 units ahead, easing off as it passes. */
function fade(distance: number) {
  if (distance > 42 || distance < 5) return 0;
  if (distance > 30) return (42 - distance) / 12;
  if (distance > 12) return 1;
  return (distance - 5) / 7;
}

export interface SignContent {
  title: string;
  body: string;
  step: string;
}

function useRoadCurve() {
  return useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        waypoints.map(([x, z]) => new THREE.Vector3(x, 0, z)),
        false,
        "catmullrom",
        0.35
      ),
    []
  );
}

function RoadSurface({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const { geometry, dashes } = useMemo(() => {
    const samples = 400;
    const points = curve.getSpacedPoints(samples);
    const positions: number[] = [];
    const indices: number[] = [];
    const dashList: { pos: [number, number, number]; rotY: number }[] = [];

    points.forEach((point, i) => {
      const t = i / samples;
      const tangent = curve.getTangentAt(Math.min(t, 0.999)).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = point.clone().addScaledVector(side, -ROAD_HALF_WIDTH);
      const right = point.clone().addScaledVector(side, ROAD_HALF_WIDTH);
      positions.push(left.x, 0, left.z, right.x, 0, right.z);

      if (i < samples) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }

      if (i % 10 === 0) {
        dashList.push({
          pos: [point.x, 0.02, point.z],
          rotY: Math.atan2(tangent.x, tangent.z),
        });
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return { geometry: geo, dashes: dashList };
  }, [curve]);

  const dashRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const euler = new THREE.Euler();
    const quat = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    dashes.forEach((dash, i) => {
      quat.setFromEuler(euler.set(-Math.PI / 2, 0, -dash.rotY));
      matrix.compose(new THREE.Vector3(...dash.pos), quat, one);
      dashRef.current?.setMatrixAt(i, matrix);
    });
    if (dashRef.current) dashRef.current.instanceMatrix.needsUpdate = true;
  }, [dashes]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#43414d" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]}>
        <planeGeometry args={[0.22, 2.4]} />
        <meshBasicMaterial color="#ffe9b3" />
      </instancedMesh>
    </group>
  );
}

/** Trees are drawn as two instanced meshes so the whole forest costs 2 draw calls. */
function Trees({ curve, count }: { curve: THREE.CatmullRomCurve3; count: number }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const canopies = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => {
    const list: { pos: THREE.Vector3; scale: number; hue: THREE.Color }[] = [];
    const greens = ["#3f8f4d", "#4aa259", "#357f43"].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const t = Math.min((i % 45) / 45, 0.999);
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const dir = i % 2 === 0 ? -1 : 1;
      const offset = ROAD_HALF_WIDTH + 3 + ((i * 37) % 9);
      const pos = point.clone().addScaledVector(side, dir * offset);
      list.push({
        pos,
        scale: 0.8 + (((i * 17) % 10) / 10) * 0.7,
        hue: greens[i % greens.length],
      });
    }
    return list;
  }, [curve, count]);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    trees.forEach((tree, i) => {
      const s = tree.scale;
      matrix.compose(
        new THREE.Vector3(tree.pos.x, s, tree.pos.z),
        new THREE.Quaternion(),
        new THREE.Vector3(s, s, s)
      );
      trunks.current?.setMatrixAt(i, matrix);

      matrix.compose(
        new THREE.Vector3(tree.pos.x, 2.8 * s, tree.pos.z),
        new THREE.Quaternion(),
        new THREE.Vector3(s, s, s)
      );
      canopies.current?.setMatrixAt(i, matrix);
      canopies.current?.setColorAt(i, tree.hue);
    });
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (canopies.current) {
      canopies.current.instanceMatrix.needsUpdate = true;
      if (canopies.current.instanceColor) canopies.current.instanceColor.needsUpdate = true;
    }
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[0.2, 0.28, 2, 6]} />
        <meshStandardMaterial color="#7a5638" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[undefined, undefined, trees.length]}>
        <sphereGeometry args={[1.45, 8, 6]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
    </group>
  );
}

function Journey({
  progress,
  signs,
}: {
  progress: MotionValue<number>;
  signs: SignContent[];
}) {
  const curve = useRoadCurve();
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.9;

  const lookTarget = useRef(new THREE.Vector3());
  const toSign = useRef(new THREE.Vector3());
  const fwd = useRef(new THREE.Vector3());

  const signPlacements = useMemo(
    () =>
      signs.map((sign, i) => {
        const t = SIGN_T[i] ?? 0.9;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        const dir = i % 2 === 0 ? 1 : -1;
        const pos = point.clone().addScaledVector(side, dir * (ROAD_HALF_WIDTH + 1.8));

        // Aim the board straight at the spot on the road where the driver reads it.
        const readFrom = curve.getPointAt(Math.max(t - 0.045, 0));
        const rotationY = Math.atan2(readFrom.x - pos.x, readFrom.z - pos.z);

        return {
          sign,
          anchor: new THREE.Vector3(pos.x, 4.05, pos.z),
          position: [pos.x, 0, pos.z] as [number, number, number],
          rotationY,
        };
      }),
    [curve, signs]
  );

  // لوحات «العودة للدراسة» موسمية: على الجانب المقابل للافتات الخشبية بين محطاتها.
  const btsBillboards = useMemo(() => {
    if (!backToSchoolSeason()) return [];
    return [0.21, 0.58, 0.79].map((t, i) => {
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const dir = i % 2 === 0 ? -1 : 1; // مقابل جهة اللافتات
      const pos = point.clone().addScaledVector(side, dir * (ROAD_HALF_WIDTH + 3.2));
      const readFrom = curve.getPointAt(Math.max(t - 0.045, 0));
      const rotationY = Math.atan2(readFrom.x - pos.x, readFrom.z - pos.z);
      return { position: [pos.x, 0, pos.z] as [number, number, number], rotationY, variant: i };
    });
  }, [curve]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 64 : 58;
    cam.updateProjectionMatrix();
  }, [camera, portrait]);

  useFrame((state) => {
    const t = Math.min(Math.max(progress.get(), 0), 0.985);
    const point = curve.getPointAt(t);
    const ahead = curve.getPointAt(Math.min(t + 0.04, 0.999));

    state.camera.position.set(point.x, 3.1, point.z);

    const target = lookTarget.current.set(ahead.x, 3.45, ahead.z);
    const camPos = state.camera.position;

    // Turn toward the nearest sign as it comes up, then release once passed.
    let bestWeight = 0;
    let bestAnchor: THREE.Vector3 | null = null;
    for (const placement of signPlacements) {
      const dist = placement.anchor.distanceTo(camPos);
      const forwardDot = toSign.current.copy(placement.anchor).sub(camPos).normalize()
        .dot(fwd.current.copy(target).sub(camPos).normalize());
      if (forwardDot <= 0.1) continue;
      const weight = fade(dist);
      if (weight > bestWeight) {
        bestWeight = weight;
        bestAnchor = placement.anchor;
      }
    }

    if (bestAnchor) target.lerp(bestAnchor, bestWeight * (portrait ? 0.9 : 0.62));

    state.camera.lookAt(target);
  });

  return (
    <>
      <Sky sunPosition={[70, 34, -30]} turbidity={2} rayleigh={3.4} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <fog attach="fog" args={["#a8cfe8", 90, 280]} />
      <hemisphereLight args={["#cfe8ff", "#7fae6d", 1.35]} />
      <directionalLight position={[26, 32, -18]} intensity={2.4} color="#fff6e2" />
      <ambientLight intensity={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, -150]}>
        <planeGeometry args={[400, 500]} />
        <meshStandardMaterial color="#7cbd6e" roughness={1} />
      </mesh>

      <RoadSurface curve={curve} />
      <Trees curve={curve} count={portrait ? 54 : 90} />

      {signPlacements.map((placement) => (
        <WoodenSign
          key={placement.sign.title}
          position={placement.position}
          rotationY={placement.rotationY}
          title={placement.sign.title}
          body={placement.sign.body}
          step={placement.sign.step}
        />
      ))}

      {btsBillboards.map((b, i) => (
        <BtsBillboard key={i} position={b.position} rotationY={b.rotationY} variant={b.variant} />
      ))}
    </>
  );
}

export function RoadJourney({
  progress,
  signs,
  className,
}: {
  progress: MotionValue<number>;
  signs: SignContent[];
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 3.1, 10], fov: 58 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, toneMappingExposure: 1.25 }}
        style={{ width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Journey progress={progress} signs={signs} />
      </Canvas>
    </div>
  );
}
