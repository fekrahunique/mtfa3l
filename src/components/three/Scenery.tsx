import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROAD_SPEED, WRAP_BEHIND, WRAP_SPAN } from "./driveConfig";

const buildingColors = ["#d9c9a8", "#cbb894", "#e0d3b8", "#c2ad8b", "#cfc0a0"];
const greens = ["#3f8f4d", "#4aa259", "#357f43", "#458f52"];

/**
 * Roadside dressing for the hero. Every tree and building recycles individually
 * once it slips behind the camera, so the street keeps arriving instead of
 * snapping back to a repeating loop.
 */
export function Scenery() {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const canopies = useRef<THREE.InstancedMesh>(null);
  const blocks = useRef<THREE.InstancedMesh>(null);

  const { trees, buildings } = useMemo(() => {
    const treeList: { x: number; z: number; scale: number; hue: THREE.Color }[] = [];
    const buildingList: { x: number; z: number; size: THREE.Vector3; color: THREE.Color }[] = [];

    // Spread across the full corridor so nothing pops into an empty gap.
    for (let i = 0; i < 34; i++) {
      const z = WRAP_BEHIND - i * (WRAP_SPAN / 34);
      const jitter = ((i * 37) % 10) / 10;
      treeList.push({
        x: -19 - jitter * 5,
        z,
        scale: 0.85 + jitter * 0.55,
        hue: new THREE.Color(greens[i % greens.length]),
      });
      treeList.push({
        x: 19 + ((i * 53) % 10) / 2,
        z: z - 4.5,
        scale: 0.9 + (((i * 17) % 10) / 10) * 0.55,
        hue: new THREE.Color(greens[(i + 2) % greens.length]),
      });
    }

    for (let i = 0; i < 16; i++) {
      const z = WRAP_BEHIND - i * (WRAP_SPAN / 16);
      const h = 6 + ((i * 29) % 8);
      const w = 5 + ((i * 13) % 4);
      buildingList.push({
        x: -34 - ((i * 7) % 8),
        z,
        size: new THREE.Vector3(w, h, w),
        color: new THREE.Color(buildingColors[i % buildingColors.length]),
      });
      buildingList.push({
        x: 34 + ((i * 11) % 8),
        z: z - 8,
        size: new THREE.Vector3(w + 1, h + 3, w),
        color: new THREE.Color(buildingColors[(i + 2) % buildingColors.length]),
      });
    }

    return { trees: treeList, buildings: buildingList };
  }, []);

  const treeZ = useRef(new Float32Array(trees.map((t) => t.z)));
  const buildingZ = useRef(new Float32Array(buildings.map((b) => b.z)));

  useLayoutEffect(() => {
    trees.forEach((tree, i) => canopies.current?.setColorAt(i, tree.hue));
    buildings.forEach((building, i) => blocks.current?.setColorAt(i, building.color));
    if (canopies.current?.instanceColor) canopies.current.instanceColor.needsUpdate = true;
    if (blocks.current?.instanceColor) blocks.current.instanceColor.needsUpdate = true;
  }, [trees, buildings]);

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const step = ROAD_SPEED * delta;

    for (let i = 0; i < trees.length; i++) {
      let z = treeZ.current[i] + step;
      if (z > WRAP_BEHIND) z -= WRAP_SPAN;
      treeZ.current[i] = z;

      const tree = trees[i];
      const s = tree.scale;
      scale.set(s, s, s);

      pos.set(tree.x, s, z);
      matrix.compose(pos, quat, scale);
      trunks.current?.setMatrixAt(i, matrix);

      pos.set(tree.x, 2.9 * s, z);
      matrix.compose(pos, quat, scale);
      canopies.current?.setMatrixAt(i, matrix);
    }

    for (let i = 0; i < buildings.length; i++) {
      let z = buildingZ.current[i] + step;
      if (z > WRAP_BEHIND) z -= WRAP_SPAN;
      buildingZ.current[i] = z;

      const building = buildings[i];
      pos.set(building.x, building.size.y / 2, z);
      matrix.compose(pos, quat, building.size);
      blocks.current?.setMatrixAt(i, matrix);
    }

    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (canopies.current) canopies.current.instanceMatrix.needsUpdate = true;
    if (blocks.current) blocks.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.22, 0.3, 2, 6]} />
        <meshStandardMaterial color="#7a5638" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={blocks} args={[undefined, undefined, buildings.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
    </group>
  );
}
