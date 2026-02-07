import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function CameraPresets({
  mode,
  onModeChange
}: {
  mode: "map" | "explore";
  onModeChange: (m: "map" | "explore") => void;
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const host = gl.domElement.parentElement;
    if (!host) return;

    const el = document.createElement("div");
    el.className = "absolute right-3 top-3 z-20 flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/80 p-2";

    const mkBtn = (label: string, onClick: () => void) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.className =
        "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.08]";
      b.onclick = onClick;
      return b;
    };

    const animateTo = (pos: THREE.Vector3, lookAt = new THREE.Vector3(0, 0, 0)) => {
      const start = camera.position.clone();
      const t0 = performance.now();
      const dur = 380;

      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const ease = 1 - Math.pow(1 - k, 3);
        camera.position.lerpVectors(start, pos, ease);
        camera.lookAt(lookAt);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const modeBtn = mkBtn(mode === "map" ? "Mode: Map" : "Mode: Explore", () =>
      onModeChange(mode === "map" ? "explore" : "map")
    );
    modeBtn.className += " border-white/20 text-white";

    el.appendChild(modeBtn);
    el.appendChild(
      mkBtn("Front", () => animateTo(new THREE.Vector3(0, mode === "map" ? 28 : 10, mode === "map" ? 0.01 : 28)))
    );
    el.appendChild(mkBtn("Top", () => animateTo(new THREE.Vector3(0, 28, 0.01))));
    el.appendChild(mkBtn("Walk", () => animateTo(new THREE.Vector3(20, 4.5, 2.5), new THREE.Vector3(10, 2, 0))));
    el.appendChild(
      mkBtn("Reset", () =>
        animateTo(mode === "map" ? new THREE.Vector3(0, 28, 0.01) : new THREE.Vector3(18, 14, 18))
      )
    );

    host.appendChild(el);
    return () => {
      host.removeChild(el);
    };
  }, [camera, gl.domElement, mode, onModeChange]);

  return null;
}
