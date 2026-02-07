import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Text, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Building } from "../../lib/types";
import { pct } from "../../lib/utils";
import { CameraPresets } from "./CameraPresets";

function Ground({ shadowEnabled }: { shadowEnabled: boolean }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow={shadowEnabled}>
        <planeGeometry args={[80, 80, 1, 1]} />
        <meshStandardMaterial color={"#0f172a"} />
      </mesh>
      <gridHelper args={[80, 40, "#0f2a40" as any, "#172033" as any]} position={[0, 0.01, 0]} />
    </group>
  );
}

function SoftPulseLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity = 1.05 + Math.sin(clock.getElapsedTime() * 0.7) * 0.2;
  });
  return <pointLight ref={ref} position={[0, 12, 0]} intensity={1.05} color={"#7dd3fc"} />;
}

function BuildingMesh({
  b,
  selected,
  onSelect
}: {
  b: Building;
  selected: boolean;
  onSelect: (id?: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const occP = pct(b.occupancy_current, b.occupancy_capacity);

  const color = useMemo(() => {
    if (occP > 90 || b.status === "closed") return new THREE.Color("#ef4444");
    if (occP >= 70 || b.status === "maintenance") return new THREE.Color("#f59e0b");
    return new THREE.Color("#22c55e");
  }, [b.status, occP]);

  const emissive = hover || selected ? new THREE.Color("#22d3ee") : new THREE.Color("#000000");

  return (
    <group position={b.pos}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(b.id);
        }}
      >
        <boxGeometry args={b.size} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hover || selected ? 0.55 : 0}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      <Text
        position={[0, b.size[1] / 2 + 0.7, 0]}
        fontSize={0.55}
        color={"rgba(255,255,255,0.88)" as any}
        outlineWidth={0.02}
        outlineColor={"rgba(0,0,0,0.55)" as any}
      >
        {b.name}
      </Text>

      {hover && (
        <Html center position={[0, b.size[1] / 2 + 1.7, 0]}>
          <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs shadow-sm">
            <div className="font-semibold text-white">{b.name}</div>
            <div className="mt-1 text-white/75">
              Occ: {occP}% | {b.occupancy_current}/{b.occupancy_capacity}
            </div>
            <div className="text-white/65">Energy: {b.energy_kw.toFixed(1)} kW</div>
            <div className="text-white/60">Status: {b.status}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Legend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-20">
      <div className="rounded-lg border border-slate-700 bg-slate-900/85 px-3 py-2 text-xs text-white/80">
        <div className="mb-1 font-semibold text-white">Legend</div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            0-70%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            70-90%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-400" />
            90-100%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            closed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            maintenance
          </span>
        </div>
      </div>
    </div>
  );
}

export function CampusScene({
  mode,
  shadowEnabled,
  adaptiveDpr,
  buildings,
  selectedBuildingId,
  onSelect,
  onModeChange
}: {
  mode: "map" | "explore";
  shadowEnabled: boolean;
  adaptiveDpr: boolean;
  buildings: Building[];
  selectedBuildingId?: string;
  onSelect: (id?: string) => void;
  onModeChange: (m: "map" | "explore") => void;
}) {
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className="h-full w-full">
      <Canvas
        shadows={shadowEnabled}
        dpr={adaptiveDpr ? dpr : 1.75}
        camera={{
          position: mode === "map" ? [0, 28, 0.01] : [18, 14, 18],
          fov: 52,
          near: 0.1,
          far: 200
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#0b1220"));
        }}
        onPointerMissed={() => onSelect(undefined)}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[15, 22, 10]}
          intensity={0.95}
          castShadow={shadowEnabled}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <SoftPulseLight />
        <Environment preset="night" />

        <Ground shadowEnabled={shadowEnabled} />

        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
          <planeGeometry args={[60, 3]} />
          <meshStandardMaterial color={"#1e293b"} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} rotation-z={Math.PI / 2}>
          <planeGeometry args={[60, 3]} />
          <meshStandardMaterial color={"#1e293b"} />
        </mesh>

        {buildings.map(b => (
          <BuildingMesh key={b.id} b={b} selected={b.id === selectedBuildingId} onSelect={onSelect} />
        ))}

        <OrbitControls
          enabled={mode === "explore"}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.45}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={10}
          maxDistance={60}
        />

        {mode === "map" && <MapModeController setDpr={adaptiveDpr ? setDpr : undefined} />}

        <CameraPresets mode={mode} onModeChange={onModeChange} />
      </Canvas>

      <Legend />
    </div>
  );
}

function MapModeController({ setDpr }: { setDpr?: (v: number) => void }) {
  useFrame(({ camera, pointer, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.12) * 0.6 + pointer.x * 0.8;
    camera.position.z = Math.cos(t * 0.12) * 0.6 + pointer.y * 0.8 + 0.01;
    camera.position.y = 28;
    camera.lookAt(0, 0, 0);

    if (setDpr) {
      setDpr(Math.min(1.8, Math.max(1.2, window.devicePixelRatio * 0.9)));
    }
  });
  return null;
}
