import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";
import { EYE_HEIGHT } from "./driveConfig";
import { Road, OUR_LANE_X, ONCOMING_LANE_X } from "./Road";
import { Car } from "./Car";
import { TrafficLight } from "./TrafficLight";
import { Scenery } from "./Scenery";
import { CarInterior } from "./CarInterior";

const traffic = [
  // Ahead of us, same direction: we close on them slowly and stay well back.
  { key: "ahead-1", color: "#e8734a", lane: OUR_LANE_X, startZ: -150, relativeSpeed: 1.8, direction: "same" as const },
  { key: "ahead-2", color: "#5b8dd6", lane: OUR_LANE_X, startZ: -246, relativeSpeed: 1.2, direction: "same" as const },
  // Oncoming traffic closes fast on the far side of the centre line.
  { key: "on-1", color: "#e2c044", lane: ONCOMING_LANE_X, startZ: -96, relativeSpeed: 26, direction: "oncoming" as const },
  { key: "on-2", color: "#8f6fd0", lane: ONCOMING_LANE_X, startZ: -206, relativeSpeed: 24, direction: "oncoming" as const },
  { key: "on-3", color: "#e0e0e0", lane: ONCOMING_LANE_X, startZ: -262, relativeSpeed: 30, direction: "oncoming" as const },
];

function Rig() {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.9;

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.fov = portrait ? 78 : 62;
    cam.updateProjectionMatrix();
  }, [camera, portrait]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sway = Math.sin(t * 1.6) * 0.01;
    state.camera.position.x = sway;
    state.camera.position.y = EYE_HEIGHT + Math.sin(t * 3.4) * 0.012;
    state.camera.lookAt(sway * 6, EYE_HEIGHT - 0.06, -60);
  });

  return null;
}

export function DrivingScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, EYE_HEIGHT, 2.2], fov: 62 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, toneMappingExposure: 1.25 }}
        style={{ width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Sky sunPosition={[70, 32, -40]} turbidity={2} rayleigh={3.4} mieCoefficient={0.004} mieDirectionalG={0.8} />
        <fog attach="fog" args={["#a8cfe8", 80, 250]} />

        <hemisphereLight args={["#cfe8ff", "#7fae6d", 1.35]} />
        <directionalLight position={[20, 26, -18]} intensity={2.4} color="#fff6e2" />
        <ambientLight intensity={0.5} />

        <Rig />
        <Road />
        <Scenery />
        <TrafficLight position={[2.9, 0, -58]} />
        <TrafficLight position={[2.9, 0, -196]} />
        {traffic.map((car) => (
          <Car {...car} key={car.key} />
        ))}
        <CarInterior />
      </Canvas>
    </div>
  );
}
