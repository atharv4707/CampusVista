import { campusStore } from "../store/campusStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Slider } from "../components/ui/Slider";
import { Switch } from "../components/ui/Switch";
import { Badge } from "../components/ui/Badge";

export function SettingsPage() {
  const st = campusStore.get();
  const settings = st.settings;

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="text-sm font-semibold">Default 3D Mode</div>
                <div className="mt-2 flex gap-2">
                  <Button variant={st.mode === "map" ? "default" : "outline"} onClick={() => campusStore.setMode("map")}>
                    Map Mode
                  </Button>
                  <Button variant={st.mode === "explore" ? "default" : "outline"} onClick={() => campusStore.setMode("explore")}>
                    Explore Mode
                  </Button>
                </div>
                <div className="mt-2 text-xs text-white/55">Map Mode is top-down and fast; Explore Mode is orbit-based.</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="text-sm font-semibold">Graphics</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-white/70">Shadows</div>
                  <Switch checked={st.shadowEnabled} onCheckedChange={(v) => campusStore.setGraphics({ shadowEnabled: v })} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-white/70">Adaptive DPR</div>
                  <Switch checked={st.adaptiveDpr} onCheckedChange={(v) => campusStore.setGraphics({ adaptiveDpr: v })} />
                </div>
                <div className="mt-2 text-xs text-white/55">Adaptive DPR reduces GPU load on weaker devices.</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Simulation Controls (Server)</div>
                    <div className="text-xs text-white/55">Applied on backend (POST /api/settings)</div>
                  </div>
                  <Badge className={st.connected ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}>
                    {st.connected ? "Live" : "Offline (will apply when back)"}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-white/75">Speed</div>
                    <Slider
                      id="settings-simulation-speed"
                      name="simulationSpeed"
                      value={settings?.simulationSpeed ?? 1}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onChange={(v) => campusStore.updateSettings({ simulationSpeed: v }).catch(() => {})}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-white/75">Occupancy Threshold (%)</div>
                    <Slider
                      id="settings-occupancy-threshold"
                      name="occupancyThreshold"
                      value={settings?.occupancyThreshold ?? 90}
                      min={50}
                      max={99}
                      step={1}
                      onChange={(v) => campusStore.updateSettings({ occupancyThreshold: v }).catch(() => {})}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-white/75">Energy Spike Threshold (kW)</div>
                    <Slider
                      id="settings-energy-spike-threshold"
                      name="energySpikeThreshold"
                      value={settings?.energySpikeKw ?? 35}
                      min={5}
                      max={120}
                      step={1}
                      onChange={(v) => campusStore.updateSettings({ energySpikeKw: v }).catch(() => {})}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline" onClick={() => campusStore.bootstrap().catch(() => {})}>
                    Refresh snapshot
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
