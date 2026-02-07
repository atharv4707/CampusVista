import React from "react";
import type { RouteKey } from "../../App";
import { cn } from "../../lib/utils";
import { LayoutDashboard, Box, DoorOpen, Calendar, Zap, AlertTriangle, Settings } from "lucide-react";

const items: Array<{ key: RouteKey; icon: React.ReactNode }> = [
  { key: "overview", icon: <LayoutDashboard size={18} /> },
  { key: "twin", icon: <Box size={18} /> },
  { key: "rooms", icon: <DoorOpen size={18} /> },
  { key: "events", icon: <Calendar size={18} /> },
  { key: "energy", icon: <Zap size={18} /> },
  { key: "alerts", icon: <AlertTriangle size={18} /> },
  { key: "settings", icon: <Settings size={18} /> }
];

export function MobileNav({ route, setRoute }: { route: RouteKey; setRoute: (r: RouteKey) => void }) {
  return (
    <div className="border-t border-slate-800 bg-slate-900/60 px-2 py-2">
      <div className="grid grid-cols-7 gap-1">
        {items.map(it => {
          const active = it.key === route;
          return (
            <button
              key={it.key}
              onClick={() => setRoute(it.key)}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl border border-transparent transition",
                active ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200" : "text-white/70 hover:bg-white/6"
              )}
            >
              {it.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
