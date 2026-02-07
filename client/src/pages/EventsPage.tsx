import { useMemo } from "react";
import { campusStore } from "../store/campusStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function EventsPage() {
  const st = campusStore.get();
  const byTime = useMemo(() => {
    return [...st.eventsToday].sort((a, b) => a.time.localeCompare(b.time));
  }, [st.eventsToday]);

  const bMap = useMemo(() => new Map(st.buildings.map(b => [b.id, b.name])), [st.buildings]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Today’s Events — Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byTime.map(e => (
                <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{e.title}</div>
                    <Badge className={e.status === "live" ? "border-amber-400/30 bg-amber-500/10 text-amber-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}>
                      {e.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    {e.time} • {bMap.get(e.buildingId) ?? e.buildingId} • {e.type} • Audience ~{e.audience}
                  </div>
                </div>
              ))}
              {byTime.length === 0 && <div className="text-sm text-white/60">No events found.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
