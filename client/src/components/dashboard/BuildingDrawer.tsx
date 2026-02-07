import { useEffect, useMemo, useState } from "react";
import type { Building } from "../../lib/types";
import { campusStore } from "../../store/campusStore";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { occupancyBandClass, pct } from "../../lib/utils";

export function BuildingDrawer({
  mobile,
  buildings,
  simulatedLabel
}: {
  mobile?: boolean;
  buildings?: Building[];
  simulatedLabel?: string;
}) {
  const st = campusStore.get();
  const [tab, setTab] = useState<"summary" | "rooms">("summary");
  const source = buildings ?? st.buildings;
  const selected = source.find(b => b.id === st.selectedBuildingId);
  const targetRoomId = selected && st.navigationTarget?.buildingId === selected.id ? st.navigationTarget.roomId : undefined;

  const rooms = useMemo(() => {
    if (!selected) return [];
    return [...selected.rooms].slice(0, mobile ? 10 : 14);
  }, [selected, mobile]);

  if (!selected) {
    return (
      <div className="p-4 text-sm text-white/65">
        Select a building in the 3D scene to open details.
      </div>
    );
  }

  const occP = pct(selected.occupancy_current, selected.occupancy_capacity);
  const statusClass =
    selected.status === "open"
      ? "bg-emerald-400"
      : selected.status === "maintenance"
      ? "bg-amber-400"
      : "bg-red-400";

  useEffect(() => {
    if (targetRoomId) {
      setTab("rooms");
    }
  }, [targetRoomId]);

  return (
    <div className="h-full overflow-auto p-2">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base text-white">{selected.name}</CardTitle>
              <div className="mt-1 text-xs text-white/60">
                Floors: {selected.floors} | Kind: {selected.kind}
              </div>
              {simulatedLabel && (
                <div className="mt-1 text-xs text-amber-200">Simulated view: {simulatedLabel}</div>
              )}
            </div>
            <Badge className={occupancyBandClass(occP)}>{occP}%</Badge>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusClass}`} />
              {selected.status}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant={tab === "summary" ? "default" : "outline"}
              onClick={() => setTab("summary")}
            >
              Summary
            </Button>
            <Button
              size="sm"
              variant={tab === "rooms" ? "default" : "outline"}
              onClick={() => setTab("rooms")}
            >
              Rooms
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {tab === "summary" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs text-white/60">Occupancy</div>
                  <div className="text-lg font-semibold text-white">
                    {selected.occupancy_current} / {selected.occupancy_capacity}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs text-white/60">Energy</div>
                  <div className="text-lg font-semibold text-white">{selected.energy_kw.toFixed(1)} kW</div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => campusStore.setSelectedBuilding(undefined)}>
                Close Drawer
              </Button>
            </div>
          )}

          {tab === "rooms" && (
            <div className="space-y-2">
              {rooms.map(r => {
                const roomClass =
                  r.status === "available"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : r.status === "occupied"
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
                    : "border-red-400/30 bg-red-500/10 text-red-200";

                return (
                  <div key={r.room_id} className={`rounded-xl border bg-white/[0.03] p-3 ${targetRoomId === r.room_id ? "border-cyan-400/35" : "border-white/10"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white">{r.name}</div>
                      <div className="flex items-center gap-2">
                        {targetRoomId === r.room_id && (
                          <Badge className="border-cyan-400/35 bg-cyan-500/10 text-cyan-200">Nearest</Badge>
                        )}
                        <Badge className={roomClass}>{r.status}</Badge>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Floor {r.floor} | {r.type}
                    </div>
                    {r.current && <div className="mt-2 text-xs text-white/70">Now: {r.current}</div>}
                  </div>
                );
              })}
              {rooms.length === 0 && <div className="text-sm text-white/60">No rooms found.</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
