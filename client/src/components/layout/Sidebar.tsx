import React from "react";
import { LayoutDashboard, Box, DoorOpen, Calendar, Zap, AlertTriangle, Settings } from "lucide-react";
import type { RouteKey } from "../../App";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/Badge";

const items: Array<{ key: RouteKey; label: string; icon: React.ReactNode }> = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { key: "twin", label: "3D Twin", icon: <Box size={18} /> },
  { key: "rooms", label: "Rooms", icon: <DoorOpen size={18} /> },
  { key: "events", label: "Events", icon: <Calendar size={18} /> },
  { key: "energy", label: "Energy", icon: <Zap size={18} /> },
  { key: "alerts", label: "Alerts", icon: <AlertTriangle size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> }
];

export function Sidebar({ route, setRoute }: { route: RouteKey; setRoute: (r: RouteKey) => void }) {
  return (
    <aside className="h-full w-72 border-r border-slate-800 bg-slate-900/45">
      <div className="p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="text-xs text-white/55">CAMPUS DIGITAL TWIN</div>
          <div className="mt-1 text-base font-semibold tracking-wide text-white">TSSM BSCOER</div>
          <div className="mt-3 flex gap-2">
            <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">Live Sim</Badge>
            <Badge className="border-white/10 bg-white/6 text-white/70">v1</Badge>
          </div>
        </div>
      </div>

      <nav className="px-2">
        {items.map(it => {
          const active = it.key === route;
          return (
            <button
              key={it.key}
              onClick={() => setRoute(it.key)}
              className={cn(
                "group mb-1 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm transition",
                active
                  ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                  : "border-transparent text-white/75 hover:bg-white/6"
              )}
            >
              <span className={cn("text-white/70 group-hover:text-white", active && "text-cyan-200")}>{it.icon}</span>
              <span className={cn("group-hover:text-white", active ? "text-white" : "text-white/85")}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 px-4 text-xs text-white/45">Tip: hover a building for details, click to open drawer.</div>
    </aside>
  );
}
