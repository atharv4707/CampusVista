import { useMemo } from "react";
import { campusStore } from "../store/campusStore";
import { OverviewCards } from "../components/dashboard/OverviewCards";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { buildPredictedAlerts } from "../lib/predictions";

function minutesFromTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function OverviewPage() {
  const st = campusStore.get();
  const buildingMap = useMemo(() => new Map(st.buildings.map(b => [b.id, b.name])), [st.buildings]);

  const topAlerts = useMemo(() => st.alerts.slice(0, 5), [st.alerts]);
  const predicted = useMemo(
    () => buildPredictedAlerts(st.buildings, st.eventsToday, st.summary?.nowTs ?? Date.now()).slice(0, 3),
    [st.buildings, st.eventsToday, st.summary?.nowTs]
  );
  const nextEvents = useMemo(() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const sorted = [...st.eventsToday].sort((a, b) => minutesFromTime(a.time) - minutesFromTime(b.time));
    const upcoming = sorted.filter(e => minutesFromTime(e.time) >= nowMin);
    return (upcoming.length > 0 ? upcoming : sorted).slice(0, 5);
  }, [st.eventsToday]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-sm font-medium tracking-wide text-cyan-200">
            CampusVista
          </p>
          <p className="text-sm text-white/75">
            Real-time monitoring and predictive insights
          </p>
        </div>

        <OverviewCards />
        <p className="px-1 text-xs tracking-wide text-white/55">
          Simulated real-time data for demonstration
        </p>

        <Card>
          <CardContent className="pt-4 text-sm text-white/80">
            Our system not only shows current data but predicts possible issues.
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-white">Alerts (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {predicted.map(p => (
                <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{p.message}</div>
                    <Badge className={p.severity === "danger" ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}>
                      Predicted
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    ETA: {p.etaMin} min | {buildingMap.get(p.buildingId) ?? p.buildingId}
                  </div>
                </div>
              ))}
              {topAlerts.map(a => {
                const sevClass =
                  a.severity === "critical"
                    ? "border-red-400/30 bg-red-500/10 text-red-200"
                    : a.severity === "high"
                    ? "border-red-400/30 bg-red-500/10 text-red-200"
                    : a.severity === "medium"
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
                return (
                  <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white">{a.message}</div>
                      <Badge className={sevClass}>{a.severity}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {a.buildingId ? buildingMap.get(a.buildingId) ?? a.buildingId : "Campus"} | {new Date(a.ts).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
              {topAlerts.length === 0 && <div className="text-sm text-white/60">No active alerts.</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-white">Today&apos;s Schedule (Next 5)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nextEvents.map(e => (
                <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{e.title}</div>
                    <Badge className={e.status === "live" ? "border-amber-400/30 bg-amber-500/10 text-amber-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}>
                      {e.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {e.time} | {buildingMap.get(e.buildingId) ?? e.buildingId}
                  </div>
                </div>
              ))}
              {nextEvents.length === 0 && <div className="text-sm text-white/60">No upcoming events.</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
