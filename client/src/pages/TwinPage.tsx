import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { campusStore } from "../store/campusStore";
import { CampusScene } from "../components/three/CampusScene";
import { BuildingDrawer } from "../components/dashboard/BuildingDrawer";
import { Button } from "../components/ui/Button";
import { Slider } from "../components/ui/Slider";
import type { Building } from "../lib/types";

function hashSeed(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h << 5) - h + value.charCodeAt(i);
  return Math.abs(h);
}

function simulatedBuildings(buildings: Building[], slot: 0 | 1 | 2) {
  const factors: Record<0 | 1 | 2, number> = { 0: 0.68, 1: 0.92, 2: 0.8 };
  const factor = factors[slot];
  return buildings.map((b) => {
    const seed = hashSeed(b.id) % 11;
    const spread = (seed - 5) * 0.02;
    const ratio = Math.min(1, Math.max(0.2, factor + spread));
    const nextCurrent = Math.min(b.occupancy_capacity, Math.round(b.occupancy_capacity * ratio));
    return { ...b, occupancy_current: nextCurrent };
  });
}

export function TwinPage() {
  const st = campusStore.get();
  const [timeSlot, setTimeSlot] = useState<0 | 1 | 2>(1);
  const hasSelection = !!st.selectedBuildingId;
  const navTarget = st.navigationTarget;
  const targetBuilding = navTarget ? st.buildings.find(b => b.id === navTarget.buildingId) : undefined;
  const targetRoom = targetBuilding?.rooms.find(r => r.room_id === navTarget?.roomId);
  const slotLabel = timeSlot === 0 ? "Morning" : timeSlot === 1 ? "Afternoon" : "Evening";
  const displayBuildings = useMemo(() => simulatedBuildings(st.buildings, timeSlot), [st.buildings, timeSlot]);

  return (
    <div className="h-full">
      <div className={`grid h-full grid-cols-1 gap-4 ${hasSelection ? "md:grid-cols-[minmax(0,1fr)_380px]" : "md:grid-cols-1"}`}>
        <motion.div
          className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute left-3 top-3 z-20 flex max-w-sm flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/85 p-2">
            <Button size="sm" onClick={() => campusStore.findNearestFreeRoom()}>
              Find Free Room
            </Button>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-2">
              <div className="mb-1 text-xs font-semibold text-white">See occupancy at different times</div>
              <Slider
                id="twin-time-slot"
                name="twinTimeSlot"
                value={timeSlot}
                min={0}
                max={2}
                step={1}
                onChange={(v) => setTimeSlot(v as 0 | 1 | 2)}
              />
              <div className="text-xs text-amber-200">{slotLabel}</div>
            </div>
            {navTarget && targetBuilding && targetRoom && (
              <div className="text-xs text-white/80">
                Nearest available: <span className="text-cyan-200">{targetRoom.name}</span> in {targetBuilding.name}
              </div>
            )}
          </div>

          <CampusScene
            mode={st.mode}
            shadowEnabled={st.shadowEnabled}
            adaptiveDpr={st.adaptiveDpr}
            buildings={displayBuildings}
            selectedBuildingId={st.selectedBuildingId}
            onSelect={(id) => campusStore.setSelectedBuilding(id)}
            onModeChange={(m) => campusStore.setMode(m)}
          />
        </motion.div>

        <motion.div
          className={hasSelection ? "hidden overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm md:block" : "hidden md:block"}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: hasSelection ? 1 : 0, x: hasSelection ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          {hasSelection && <BuildingDrawer buildings={displayBuildings} simulatedLabel={slotLabel} />}
        </motion.div>

        {hasSelection && (
          <div className="md:hidden">
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
              <BuildingDrawer mobile buildings={displayBuildings} simulatedLabel={slotLabel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
