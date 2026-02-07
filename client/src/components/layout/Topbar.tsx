import { useMemo, useState } from "react";
import type { RouteKey } from "../../App";
import { Search, UserCircle2 } from "lucide-react";
import { campusStore } from "../../store/campusStore";
import { fmtTime } from "../../lib/utils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function Topbar({ setRoute }: { setRoute: (r: RouteKey) => void }) {
  const st = campusStore.get();
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const buildingHits = st.buildings
      .filter(b => b.name.toLowerCase().includes(query))
      .slice(0, 6)
      .map(b => ({ type: "building" as const, id: b.id, label: b.name }));
    const roomHits = st.buildings
      .flatMap(b => b.rooms.map(r => ({ b, r })))
      .filter(x => x.r.name.toLowerCase().includes(query))
      .slice(0, 6)
      .map(x => ({
        type: "room" as const,
        id: x.r.room_id,
        buildingId: x.b.id,
        label: `${x.r.name} - ${x.b.name}`
      }));
    return [...buildingHits, ...roomHits].slice(0, 8);
  }, [q, st.buildings]);

  const now = st.summary?.nowTs ?? Date.now();
  const last = st.lastUpdateTs || st.summary?.lastTickTs || 0;

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 p-4">
      <div className="relative w-full max-w-xl">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          <Search size={16} />
        </div>
        <Input
          id="global-search"
          name="globalSearch"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search buildings / rooms..."
          className="pl-9"
        />
        {matches.length > 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-sm">
            {matches.map(m => (
              <button
                key={m.id}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/6"
                onClick={() => {
                  if (m.type === "building") {
                    campusStore.setSelectedBuilding(m.id);
                    setRoute("twin");
                  } else {
                    campusStore.setSelectedBuilding(m.buildingId);
                    setRoute("rooms");
                  }
                  setQ("");
                }}
              >
                <span className="text-white/90">{m.label}</span>
                <span className="text-xs text-white/45">{m.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <Badge className={st.connected ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}>
          <span className={st.connected ? "h-2 w-2 rounded-full bg-emerald-300" : "h-2 w-2 rounded-full bg-red-300"} />
          {st.connected ? "Connected" : "Offline"}
        </Badge>
        <div className="text-xs text-white/60">
          <div>
            Time: <span className="text-white/85">{fmtTime(now)}</span>
          </div>
          <div>
            Last update: <span className="text-white/85">{last ? fmtTime(last) : "-"}</span>
          </div>
        </div>

        <Button variant="outline" onClick={() => alert("Profile dropdown (demo)")} className="gap-2">
          <UserCircle2 size={18} /> <span className="hidden lg:inline">Athuu</span>
        </Button>
      </div>
    </header>
  );
}
