import { useMemo, useState } from "react";
import { campusStore } from "../store/campusStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { buildPredictedAlerts } from "../lib/predictions";

export function AlertsPage() {
  const st = campusStore.get();
  const [ack, setAck] = useState<Record<string, boolean>>({});

  const alerts = useMemo(() => st.alerts.slice(0, 80), [st.alerts]);
  const predicted = useMemo(
    () => buildPredictedAlerts(st.buildings, st.eventsToday, st.summary?.nowTs ?? Date.now()).slice(0, 6),
    [st.buildings, st.eventsToday, st.summary?.nowTs]
  );
  const bMap = useMemo(() => new Map(st.buildings.map(b => [b.id, b.name])), [st.buildings]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predicted.map(p => (
                <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{p.message}</div>
                    <Badge className={p.severity === "danger" ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}>
                      AI prediction
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-white/75">
                    ETA: {p.etaMin} min | {bMap.get(p.buildingId) ?? p.buildingId}
                    {p.roomId ? ` | ${p.roomId}` : ""}
                  </div>
                </div>
              ))}
              {predicted.length === 0 && <div className="text-sm text-white/60">No predicted risks right now.</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map(a => {
                const isAck = ack[a.id] || a.ack;
                const sevClass =
                  a.severity === "critical"
                    ? "border-red-400/30 bg-red-500/10 text-red-200"
                    : a.severity === "high"
                    ? "border-orange-400/30 bg-orange-500/10 text-orange-200"
                    : a.severity === "medium"
                    ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                    : "border-white/10 bg-white/6 text-white/70";

                return (
                  <div key={a.id} className={cn("rounded-2xl border border-white/10 bg-white/[0.05] p-3", isAck && "opacity-60")}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{a.type.replace("_", " ")}</div>
                      <Badge className={sevClass}>{a.severity}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      {new Date(a.ts).toLocaleTimeString()} • {a.buildingId ? bMap.get(a.buildingId) ?? a.buildingId : "Campus"}
                      {a.roomId ? ` • ${a.roomId}` : ""}
                    </div>
                    <div className="mt-2 text-sm text-white/75">{a.message}</div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAck(x => ({ ...x, [a.id]: true }))}
                        disabled={isAck}
                      >
                        {isAck ? "Acknowledged" : "Acknowledge"}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {alerts.length === 0 && <div className="text-sm text-white/60">No alerts.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
