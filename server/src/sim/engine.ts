import { ICampusStore, CampusDelta, Alert, RoomStatus } from "../store/ICampusStore";
import { clamp, randFloat, randInt, pick } from "../utils/rand";
import { getDayPhase, targetOccupancyMultiplier, baseEnergyMultiplier } from "./patterns";

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function tickSimulation(store: ICampusStore): { delta: CampusDelta; newAlerts: Alert[] } {
  const state = store.getState();
  const phase = getDayPhase(new Date());
  const speed = clamp(state.settings.simulationSpeed, 0.5, 2);
  const nowTs = Date.now();

  const buildingUpdates: CampusDelta["buildings"] = [];
  const roomUpdates: NonNullable<CampusDelta["rooms"]> = [];
  const eventUpdates: NonNullable<CampusDelta["events"]> = [];
  const newAlerts: Alert[] = [];

  // Update events statuses based on time window (simple)
  const hhmmToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  for (const e of state.eventsToday) {
    const start = hhmmToMinutes(e.time);
    const end = start + 70;
    const prev = e.status;
    let next = prev;
    if (nowMins >= start && nowMins < end) next = "live";
    else if (nowMins >= end) next = "completed";
    else next = "scheduled";

    if (next !== prev) {
      e.status = next;
      eventUpdates.push({ id: e.id, status: next });
    }
  }

  for (const b of state.buildings) {
    const targetMult = targetOccupancyMultiplier(b.kind, phase);
    const targetOcc = Math.floor(b.occupancy_capacity * targetMult);

    // random-walk towards target
    const diff = targetOcc - b.occupancy_current;
    const step = clamp(Math.round(diff * randFloat(0.05, 0.16) * speed), -45, 45);
    const noise = randInt(-10, 10);
    let nextOcc = clamp(b.occupancy_current + step + noise, 0, b.occupancy_capacity);

    // building status occasionally changes
    let nextStatus = b.status;
    if (Math.random() < 0.012 * speed) nextStatus = pick(["open", "open", "open", "maintenance", "closed"]);

    // energy follows occupancy + phase
    const base = 18 + (b.occupancy_capacity / 25);
    const occFactor = 0.12 * (nextOcc / Math.max(1, b.occupancy_capacity)) * b.occupancy_capacity;
    let nextEnergy = baseEnergyMultiplier(b.kind, phase) * (base + occFactor) + randFloat(-6, 6);

    nextEnergy = clamp(nextEnergy, 5, 260);

    // Apply
    const prevEnergy = b.energy_kw;
    b.occupancy_current = nextOcc;
    b.energy_kw = Number(nextEnergy.toFixed(1));
    b.status = nextStatus;

    buildingUpdates.push({
      id: b.id,
      occupancy_current: b.occupancy_current,
      energy_kw: b.energy_kw,
      status: b.status
    });

    // Rooms: a few flips per tick
    const flips = randInt(1, Math.max(2, Math.floor(b.rooms.length / 6)));
    for (let i = 0; i < flips; i++) {
      const r = b.rooms[randInt(0, b.rooms.length - 1)];
      const prev = r.status;
      const roll = Math.random();
      let next: RoomStatus = prev;

      if (b.status !== "open") {
        next = "closed";
      } else {
        if (roll < 0.60) next = "available";
        else if (roll < 0.96) next = "occupied";
        else next = "closed";
      }

      if (next !== prev) {
        r.status = next;
        r.current =
          next === "occupied"
            ? pick(["Lecture", "Lab Session", "Project Work", "Seminar Prep"]) + ` — ${pick(["FY", "SY", "TY", "Final"])}`
            : undefined;

        roomUpdates.push({ buildingId: b.id, room_id: r.room_id, status: r.status, current: r.current });
      }
    }

    // Alerts: overcrowding
    const occPct = (b.occupancy_current / Math.max(1, b.occupancy_capacity)) * 100;
    if (occPct > state.settings.occupancyThreshold && Math.random() < 0.35) {
      newAlerts.push({
        id: mkId("a_occ"),
        ts: nowTs,
        severity: occPct > 97 ? "critical" : "high",
        type: "overcrowding",
        buildingId: b.id,
        message: `${b.name} overcrowding: ${occPct.toFixed(0)}% occupancy`
      });
    }

    // Alerts: energy spike (delta)
    const deltaE = b.energy_kw - prevEnergy;
    if (deltaE > state.settings.energySpikeKw && Math.random() < 0.55) {
      newAlerts.push({
        id: mkId("a_energy"),
        ts: nowTs,
        severity: deltaE > state.settings.energySpikeKw * 1.5 ? "critical" : "high",
        type: "energy_spike",
        buildingId: b.id,
        message: `${b.name} energy spike: +${deltaE.toFixed(1)} kW`
      });
    }

    // Alerts: room conflict (rare)
    if (Math.random() < 0.02 * speed) {
      const rr = b.rooms.find(x => x.status === "occupied");
      if (rr) {
        newAlerts.push({
          id: mkId("a_conf"),
          ts: nowTs,
          severity: "medium",
          type: "room_conflict",
          buildingId: b.id,
          roomId: rr.room_id,
          message: `Room conflict detected: ${b.name} / ${rr.name}`
        });
      }
    }
  }

  // Persist alerts
  for (const a of newAlerts) store.pushAlert(a);

  // Update timestamps in state
  state.nowTs = nowTs;
  state.lastTickTs = nowTs;
  store.setState(state);

  const delta: CampusDelta = {
    ts: nowTs,
    buildings: buildingUpdates,
    rooms: roomUpdates.length ? roomUpdates : undefined,
    events: eventUpdates.length ? eventUpdates : undefined
  };

  return { delta, newAlerts };
}
