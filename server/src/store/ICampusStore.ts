export type BuildingStatus = "open" | "closed" | "maintenance";
export type RoomStatus = "available" | "occupied" | "closed";

export type Room = {
  room_id: string;
  name: string;
  floor: number;
  type: "classroom" | "lab" | "office" | "auditorium" | "canteen" | "common";
  status: RoomStatus;
  current?: string; // class/event text
};

export type Building = {
  id: string;
  name: string;
  kind:
    | "admin"
    | "library"
    | "cse"
    | "mechanical"
    | "canteen"
    | "auditorium"
    | "hostel"
    | "parking"
    | "ece"
    | "workshop";
  floors: number;
  occupancy_current: number;
  occupancy_capacity: number;
  energy_kw: number;
  status: BuildingStatus;
  rooms: Room[];
  // 3D metadata
  pos: [number, number, number];
  size: [number, number, number];
};

export type CampusEvent = {
  id: string;
  title: string;
  buildingId: string;
  time: string; // "10:30"
  type: "lecture" | "workshop" | "sports" | "seminar" | "exam" | "cultural";
  audience: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
};

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type Alert = {
  id: string;
  ts: number;
  severity: AlertSeverity;
  type: "overcrowding" | "energy_spike" | "room_conflict" | "closed_room";
  message: string;
  buildingId?: string;
  roomId?: string;
  ack?: boolean;
};

export type Settings = {
  simulationSpeed: number; // 0.5 - 2.0 multiplier
  occupancyThreshold: number; // percentage e.g. 90
  energySpikeKw: number; // delta threshold
};

export type CampusState = {
  nowTs: number;
  lastTickTs: number;
  buildings: Building[];
  eventsToday: CampusEvent[];
  alerts: Alert[];
  settings: Settings;
};

export type CampusSummary = {
  nowTs: number;
  lastTickTs: number;
  totals: {
    occupancyCurrent: number;
    occupancyCapacity: number;
    energyKw: number;
    openRooms: number;
    activeEvents: number;
    alertCount: number;
  };
  health: {
    connected: boolean;
  };
};

export type CampusDelta = {
  ts: number;
  buildings?: Array<Pick<
    Building,
    "id" | "occupancy_current" | "energy_kw" | "status"
  >>;
  rooms?: Array<{ buildingId: string; room_id: string; status: RoomStatus; current?: string }>;
  events?: Array<Pick<CampusEvent, "id" | "status">>;
};

export interface ICampusStore {
  getState(): CampusState;
  setState(next: CampusState): void;

  getSummary(): CampusSummary;

  getBuildings(): Building[];
  getBuilding(id: string): Building | undefined;
  getRooms(buildingId?: string): Room[];
  getEventsToday(): CampusEvent[];
  getAlerts(): Alert[];

  updateSettings(patch: Partial<Settings>): Settings;

  pushAlert(a: Alert): void;
  replaceAlerts(next: Alert[]): void;
}
