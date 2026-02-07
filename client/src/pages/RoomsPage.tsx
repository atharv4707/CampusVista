import { useMemo, useState } from "react";
import { campusStore } from "../store/campusStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/utils";

function getRoomHits(buildings: ReturnType<typeof campusStore.get>["buildings"]) {
  return buildings.flatMap(b => b.rooms.map(r => ({ b, r })));
}

export function RoomsPage() {
  const st = campusStore.get();
  const [buildingId, setBuildingId] = useState<string | "all">(st.selectedBuildingId ?? "all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [q, setQ] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();

  const rooms = useMemo(() => {
    const buildings = buildingId === "all" ? st.buildings : st.buildings.filter(b => b.id === buildingId);
    const list = getRoomHits(buildings);
    const query = q.trim().toLowerCase();
    return list
      .filter(x => (onlyAvailable ? x.r.status === "available" : true))
      .filter(x => (!query ? true : `${x.r.name} ${x.b.name}`.toLowerCase().includes(query)))
      .slice(0, 250);
  }, [st.buildings, buildingId, onlyAvailable, q]);

  const selected = useMemo(() => rooms.find(x => x.r.room_id === selectedRoomId) ?? rooms[0], [rooms, selectedRoomId]);

  const statusClass = (status: string) => {
    if (status === "available") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
    if (status === "occupied") return "border-amber-400/30 bg-amber-500/10 text-amber-200";
    return "border-red-400/30 bg-red-500/10 text-red-200";
  };

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <select
                id="rooms-building-filter"
                name="buildingFilter"
                value={buildingId}
                onChange={e => setBuildingId(e.target.value as any)}
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
              >
                <option value="all">All buildings</option>
                {st.buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-white/75">
                <input
                  id="rooms-only-available"
                  name="onlyAvailable"
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                />
                Only available
              </label>

              <div className="flex-1">
                <Input
                  id="rooms-search"
                  name="roomsSearch"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search rooms..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {rooms.map(({ b, r }) => (
                  <button
                    key={r.room_id}
                    onClick={() => setSelectedRoomId(r.room_id)}
                    className={cn(
                      "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition",
                      "hover:bg-white/[0.07]",
                      selectedRoomId === r.room_id && "border-cyan-400/35"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">{r.name}</div>
                      <Badge className={statusClass(r.status)}>{r.status}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {b.name} | Floor {r.floor}
                    </div>
                  </button>
                ))}
                {rooms.length === 0 && <div className="text-sm text-white/60">No rooms match filters.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-white">Room Status</CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">{selected.r.name}</div>
                  <Badge className={statusClass(selected.r.status)}>{selected.r.status}</Badge>
                  <div className="text-sm text-white/70">{selected.b.name}</div>
                  <div className="text-sm text-white/70">
                    Floor {selected.r.floor} | Type: {selected.r.type}
                  </div>
                  {selected.r.current && <div className="text-sm text-white/75">Now: {selected.r.current}</div>}
                </div>
              ) : (
                <div className="text-sm text-white/60">Select a room to view status.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
