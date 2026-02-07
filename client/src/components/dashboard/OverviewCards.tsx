import React from "react";
import { Users, CalendarClock, DoorOpen, AlertTriangle } from "lucide-react";
import { campusStore } from "../../store/campusStore";
import { pct } from "../../lib/utils";
import { Card, CardContent } from "../ui/Card";

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="transition hover:bg-slate-900/70">
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">{icon}</div>
          <div>
            <div className="text-sm text-white/70">{label}</div>
            <div className="text-2xl font-semibold text-white">{value}</div>
            {sub && <div className="text-xs text-white/55">{sub}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewCards() {
  const st = campusStore.get();
  const s = st.summary;
  const occPct = s ? pct(s.totals.occupancyCurrent, s.totals.occupancyCapacity) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat
        icon={<Users size={18} className="text-emerald-300" />}
        label="Total Occupancy"
        value={s ? `${s.totals.occupancyCurrent} / ${s.totals.occupancyCapacity}` : "..."}
        sub={s ? `${occPct}%` : undefined}
      />
      <Stat
        icon={<DoorOpen size={18} className="text-emerald-300" />}
        label="Open Rooms"
        value={s ? String(s.totals.openRooms) : "..."}
      />
      <Stat
        icon={<CalendarClock size={18} className="text-amber-300" />}
        label="Events Now"
        value={s ? String(s.totals.activeEvents) : "..."}
      />
      <Stat
        icon={<AlertTriangle size={18} className="text-red-300" />}
        label="Active Alerts"
        value={s ? String(s.totals.alertCount) : "..."}
      />
    </div>
  );
}
