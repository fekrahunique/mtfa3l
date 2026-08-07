import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROAD_SPEED, WRAP_BEHIND, WRAP_SPAN } from "./driveConfig";

const ROAD_LENGTH = 620;

/**
 * Real lane geometry: 3.6 m lanes. The camera drives down the middle of the
 * right-hand lane at x = 0, so the centre line sits at -1.8 and the oncoming
 * lane runs from -1.8 to -5.4.
 */
export const OUR_LANE_X = 0;
export const ONCOMING_LANE_X = -3.6;

const LANE_WIDTH = 3.6;
const CENTRE_X = -LANE_WIDTH / 2;
const RIGHT_EDGE_X = LANE_WIDTH / 2;
const LEFT_EDGE_X = CENTRE_X - LANE_WIDTH;
const SHOULDER = 0.7;

const LINE_W = 0.12;
const LINE_Y = 0.015;

const DASH_LENGTH = 3;
const DASH_GAP = 6;
const DASH_SPACING = DASH_LENGTH + DASH_GAP;
const DASH_COUNT = Math.ceil(WRAP_SPAN / DASH_SPACING) + 1;

/** Centre-line dashes recycle individually so the road never visibly loops. */
function CentreDashes() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const zs = useRef(
    new Float32Array(Array.from({ length: DASH_COUNT }, (_, i) => WRAP_BEHIND - i * DASH_SPACING))
  );

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const quat = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((_, delta) => {
    const step = ROAD_SPEED * delta;
    for (let i = 0; i < DASH_COUNT; i++) {
      let z = zs.current[i] + step;
      if (z > WRAP_BEHIND) z -= WRAP_SPAN;
      zs.current[i] = z;
      pos.set(CENTRE_X, LINE_Y, z);
      matrix.compose(pos, quat, one);
      mesh.current?.setMatrixAt(i, matrix);
    }
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DASH_COUNT]} frustumCulled={false}>
      <planeGeometry args={[LINE_W, DASH_LENGTH]} />
      <meshBasicMaterial color="#f2efe6" />
    </instancedMesh>
  );
}

function EdgeLine({ x }: { x: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, LINE_Y, -ROAD_LENGTH / 2 + 60]}>
      <planeGeometry args={[LINE_W, ROAD_LENGTH]} />
      <meshBasicMaterial color="#f2efe6" />
    </mesh>
  );
}

export function Road() {
  const centreZ = -ROAD_LENGTH / 2 + 60;
  const asphaltLeft = LEFT_EDGE_X - SHOULDER;
  const asphaltRight = RIGHT_EDGE_X + SHOULDER;
  const asphaltWidth = asphaltRight - asphaltLeft;
  const asphaltMid = (asphaltRight + asphaltLeft) / 2;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[asphaltMid, 0, centreZ]}>
        <planeGeometry args={[asphaltWidth, ROAD_LENGTH]} />
        <meshStandardMaterial color="#3f3e48" roughness={0.96} />
      </mesh>

      <CentreDashes />
      <EdgeLine x={RIGHT_EDGE_X} />
      <EdgeLine x={LEFT_EDGE_X} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[asphaltMid, -0.04, centreZ]}>
        <planeGeometry args={[300, ROAD_LENGTH]} />
        <meshStandardMaterial color="#7cbd6e" roughness={1} />
      </mesh>
    </group>
  );
}
