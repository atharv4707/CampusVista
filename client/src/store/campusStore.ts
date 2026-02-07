import type { Alert, Building, CampusDelta, CampusEvent, CampusSummary, Settings } from "../lib/types";
import { api } from "../lib/api";

type Listener = () => void;

type CampusStoreState = {
  connected: boolean;
  lastUpdateTs: number;
  summary?: CampusSummary;
  buildings: Building[];
  eventsToday: CampusEvent[];
  alerts: Alert[];
  settings?: Settings;
  selectedBuildingId?: string;
  navigationTarget?: {
    buildingId: string;
    roomId: string;
    distance: number;
  };
  mode: "map" | "explore";
  shadowEnabled: boolean;
  adaptiveDpr: boolean;
};

const state: CampusStoreState = {
  connected: false,
  lastUpdateTs: 0,
  buildings: [],
  eventsToday: [],
  alerts: [],
  mode: "explore",
  shadowEnabled: false,
  adaptiveDpr: true
};

const listeners = new Set<Listener>();
function emit() { for (const l of listeners) l(); }

function uniqueAlerts(alerts: Alert[]) {
  const seen = new Set<string>();
  const out: Alert[] = [];
  for (const a of alerts) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    out.push(a);
    if (out.length >= 200) break;
  }
  return out;
}

export const campusStore = {
  get: () => state,
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },

  setSelectedBuilding: (id?: string) => {
    state.selectedBuildingId = id;
    if (!id || state.navigationTarget?.buildingId !== id) {
      state.navigationTarget = undefined;
    }
    emit();
  },

  findNearestFreeRoom: () => {
    const originBuilding = state.buildings.find(b => b.id === state.selectedBuildingId);
    const anchor = originBuilding?.pos ?? ([0, 0, 0] as const);

    const candidates = state.buildings
      .filter(b => b.status !== "closed")
      .flatMap(b =>
        b.rooms
          .filter(r => r.status === "available")
          .map(r => {
            const dx = b.pos[0] - anchor[0];
            const dz = b.pos[2] - anchor[2];
            const distance = Math.sqrt(dx * dx + dz * dz);
            return { buildingId: b.id, roomId: r.room_id, distance };
          })
      )
      .sort((a, b) => a.distance - b.distance);

    const target = candidates[0];
    if (!target) {
      state.navigationTarget = undefined;
      emit();
      return undefined;
    }

    state.selectedBuildingId = target.buildingId;
    state.navigationTarget = target;
    emit();
    return target;
  },

  setMode: (m: "map" | "explore") => {
    state.mode = m;
    emit();
  },

  setGraphics: (patch: Partial<Pick<CampusStoreState, "shadowEnabled" | "adaptiveDpr">>) => {
    Object.assign(state, patch);
    emit();
  },

  async bootstrap() {
    const [summary, buildings, eventsToday, alerts] = await Promise.all([
      api.summary(),
      api.buildings(),
      api.eventsToday(),
      api.alerts()
    ]);
    state.summary = summary;
    state.buildings = buildings;
    state.eventsToday = eventsToday;
    state.alerts = uniqueAlerts(alerts);
    state.lastUpdateTs = summary.lastTickTs;

    emit();
  },

  applyDelta(d: CampusDelta) {
    state.lastUpdateTs = d.ts;

    if (d.buildings?.length) {
      const map = new Map(d.buildings.map(x => [x.id, x]));
      state.buildings = state.buildings.map(b => {
        const u = map.get(b.id);
        return u ? { ...b, occupancy_current: u.occupancy_current, energy_kw: u.energy_kw, status: u.status } : b;
      });
    }

    if (d.rooms?.length) {
      const byB = new Map<string, Map<string, { status: any; current?: string }>>();
      for (const r of d.rooms) {
        if (!byB.has(r.buildingId)) byB.set(r.buildingId, new Map());
        byB.get(r.buildingId)!.set(r.room_id, { status: r.status, current: r.current });
      }
      state.buildings = state.buildings.map(b => {
        const m = byB.get(b.id);
        if (!m) return b;
        const rooms = b.rooms.map(r => {
          const u = m.get(r.room_id);
          return u ? { ...r, status: u.status, current: u.current } : r;
        });
        return { ...b, rooms };
      });
    }

    if (d.events?.length) {
      const map = new Map(d.events.map(x => [x.id, x.status]));
      state.eventsToday = state.eventsToday.map(e => (map.has(e.id) ? { ...e, status: map.get(e.id)! } : e));
    }

    emit();
  },

  pushAlert(a: Alert) {
    state.alerts = uniqueAlerts([a, ...state.alerts]);
    emit();
  },

  setConnected(v: boolean) {
    state.connected = v;
    emit();
  },

  async pollOnce() {
    // lightweight polling when offline: pull summary+alerts (buildings already updating from deltas normally)
    const [summary, alerts] = await Promise.all([api.summary(), api.alerts()]);
    state.summary = summary;
    state.alerts = uniqueAlerts(alerts);
    state.lastUpdateTs = summary.lastTickTs;
    emit();
  },

  async updateSettings(patch: Partial<Settings>) {
    const next = await api.settings(patch);
    state.settings = next;
    emit();
  }
};
