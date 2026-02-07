import { useMemo } from "react";
import { campusStore } from "../store/campusStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export function EnergyPage() {
  const st = campusStore.get();

  const data = useMemo(() => {
    return st.buildings
      .map(b => ({ name: b.name.replace(" Block", ""), kw: Number(b.energy_kw.toFixed(1)) }))
      .sort((a, b) => b.kw - a.kw);
  }, [st.buildings]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Energy — Building-wise (kW)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,16,32,0.92)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12
                    }}
                  />
                  <Bar dataKey="kw" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-white/55">
              Trend line can be added by storing last N ticks in the client store (see “Optional enhancements”).
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
