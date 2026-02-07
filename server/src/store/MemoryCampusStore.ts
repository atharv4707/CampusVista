import {
  Alert,
  Building,
  CampusEvent,
  CampusState,
  CampusSummary,
  ICampusStore,
  Room,
  Settings
} from "./ICampusStore";

export class MemoryCampusStore implements ICampusStore {
  private state: CampusState;

  constructor(initial: CampusState) {
    this.state = initial;
  }

  getState(): CampusState {
    return this.state;
  }

  setState(next: CampusState) {
    this.state = next;
  }

  getSummary(): CampusSummary {
    const s = this.state;
    const occupancyCurrent = s.buildings.reduce((a, b) => a + b.occupancy_current, 0);
    const occupancyCapacity = s.buildings.reduce((a, b) => a + b.occupancy_capacity, 0);
    const energyKw = s.buildings.reduce((a, b) => a + b.energy_kw, 0);
    const openRooms = s.buildings.reduce(
      (a, b) => a + b.rooms.filter(r => r.status === "available").length,
      0
    );
    const activeEvents = s.eventsToday.filter(e => e.status === "live").length;

    return {
      nowTs: s.nowTs,
      lastTickTs: s.lastTickTs,
      totals: {
        occupancyCurrent,
        occupancyCapacity,
        energyKw,
        openRooms,
        activeEvents,
        alertCount: s.alerts.filter(a => !a.ack).length
      },
      health: { connected: true }
    };
  }

  getBuildings(): Building[] {
    return this.state.buildings;
  }

  getBuilding(id: string) {
    return this.state.buildings.find(b => b.id === id);
  }

  getRooms(buildingId?: string): Room[] {
    if (!buildingId) return this.state.buildings.flatMap(b => b.rooms);
    return this.getBuilding(buildingId)?.rooms ?? [];
  }

  getEventsToday(): CampusEvent[] {
    return this.state.eventsToday;
  }

  getAlerts(): Alert[] {
    // newest first
    return [...this.state.alerts].sort((a, b) => b.ts - a.ts);
  }

  updateSettings(patch: Partial<Settings>) {
    this.state = { ...this.state, settings: { ...this.state.settings, ...patch } };
    return this.state.settings;
  }

  pushAlert(a: Alert) {
    this.state = { ...this.state, alerts: [a, ...this.state.alerts].slice(0, 200) };
  }

  replaceAlerts(next: Alert[]) {
    this.state = { ...this.state, alerts: next.slice(0, 200) };
  }
}
