export type BuildingStatus = "open" | "closed" | "maintenance";
export type RoomStatus = "available" | "occupied" | "closed";

export type Room = {
  room_id: string;
  name: string;
  floor: number;
  type: "classroom" | "lab" | "office" | "auditorium" | "canteen" | "common";
  status: RoomStatus;
  current?: string;
};

export type Building = {
  id: string;
  name: string;
  kind: string;
  floors: number;
  occupancy_current: number;
  occupancy_capacity: number;
  energy_kw: number;
  status: BuildingStatus;
  rooms: Room[];
  pos: [number, number, number];
  size: [number, number, number];
};

export type CampusEvent = {
  id: string;
  title: string;
  buildingId: string;
  time: string;
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
  simulationSpeed: number;
  occupancyThreshold: number;
  energySpikeKw: number;
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
  health: { connected: boolean };
};

export type CampusDelta = {
  ts: number;
  buildings?: Array<{ id: string; occupancy_current: number; energy_kw: number; status: BuildingStatus }>;
  rooms?: Array<{ buildingId: string; room_id: string; status: RoomStatus; current?: string }>;
  events?: Array<{ id: string; status: CampusEvent["status"] }>;
};
