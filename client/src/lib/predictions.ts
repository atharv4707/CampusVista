import type { Building, CampusEvent } from "./types";
import { pct } from "./utils";

export type PredictedAlert = {
  id: string;
  kind: "room_full_soon" | "high_occupancy_expected";
  severity: "warning" | "danger";
  message: string;
  buildingId: string;
  roomId?: string;
  etaMin: number;
  score: number;
};

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function eventsPressure(buildingId: string, events: CampusEvent[], nowMin: number) {
  let live = 0;
  let soon = 0;
  for (const e of events) {
    if (e.buildingId !== buildingId) continue;
    if (e.status === "live") live += 1;
    if (e.status === "scheduled") {
      const diff = toMinutes(e.time) - nowMin;
      if (diff >= 0 && diff <= 30) soon += 1;
    }
  }
  return { live, soon };
}

export function buildPredictedAlerts(
  buildings: Building[],
  events: CampusEvent[],
  nowTs = Date.now()
) {
  const now = new Date(nowTs);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out: PredictedAlert[] = [];

  for (const b of buildings) {
    if (b.status === "closed") continue;

    const occP = pct(b.occupancy_current, b.occupancy_capacity);
    const pressure = eventsPressure(b.id, events, nowMin);
    const trend = occP + pressure.live * 8 + pressure.soon * 5;

    if (trend >= 85) {
      out.push({
        id: `pred-high-${b.id}`,
        kind: "high_occupancy_expected",
        severity: trend > 92 ? "danger" : "warning",
        message: `High occupancy expected in ${b.name} (${Math.min(100, Math.round(trend))}% trend).`,
        buildingId: b.id,
        etaMin: pressure.live > 0 ? 5 : 15,
        score: trend
      });
    }

    const candidateRoom = b.rooms.find(r => r.status !== "closed");
    const roomTrend = occP + 12 + pressure.live * 6 + pressure.soon * 4;
    if (candidateRoom && roomTrend >= 90) {
      out.push({
        id: `pred-room-${b.id}-${candidateRoom.room_id}`,
        kind: "room_full_soon",
        severity: roomTrend > 96 ? "danger" : "warning",
        message: `${candidateRoom.name} likely to become full in 10 minutes.`,
        buildingId: b.id,
        roomId: candidateRoom.room_id,
        etaMin: 10,
        score: roomTrend
      });
    }
  }

  return out.sort((a, b) => b.score - a.score);
}
