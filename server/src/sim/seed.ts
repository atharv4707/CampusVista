import { CampusEvent, CampusState, Building } from "../store/ICampusStore";
import { randInt, pick } from "../utils/rand";

const buildingsBase: Array<Omit<Building, "rooms" | "occupancy_current" | "energy_kw" | "status"> & {
  roomsCount: number;
}> = [
  { id: "b_admin", name: "Admin Block", kind: "admin", floors: 3, occupancy_capacity: 320, roomsCount: 10, pos: [-10, 0, -6], size: [6, 3, 5] },
  { id: "b_library", name: "Library", kind: "library", floors: 2, occupancy_capacity: 220, roomsCount: 6, pos: [-2, 0, -8], size: [6, 2.6, 5] },
  { id: "b_cse", name: "CSE Block", kind: "cse", floors: 4, occupancy_capacity: 520, roomsCount: 18, pos: [8, 0, -6], size: [8, 4, 6] },
  { id: "b_mech", name: "Mechanical Block", kind: "mechanical", floors: 3, occupancy_capacity: 420, roomsCount: 14, pos: [14, 0, 2], size: [7, 3.2, 6] },
  { id: "b_ece", name: "ECE Block", kind: "ece", floors: 3, occupancy_capacity: 380, roomsCount: 12, pos: [2, 0, 2], size: [7, 3.2, 5.5] },
  { id: "b_workshop", name: "Workshop", kind: "workshop", floors: 1, occupancy_capacity: 180, roomsCount: 4, pos: [18, 0, -6], size: [7, 2, 5] },
  { id: "b_canteen", name: "Canteen", kind: "canteen", floors: 1, occupancy_capacity: 260, roomsCount: 4, pos: [-12, 0, 4], size: [7, 2.1, 5] },
  { id: "b_audi", name: "Auditorium", kind: "auditorium", floors: 1, occupancy_capacity: 600, roomsCount: 2, pos: [-2, 0, 6], size: [10, 2.2, 7] },
  { id: "b_hostel", name: "Hostel", kind: "hostel", floors: 5, occupancy_capacity: 900, roomsCount: 20, pos: [10, 0, 10], size: [9, 5, 7] },
  { id: "b_parking", name: "Parking", kind: "parking", floors: 1, occupancy_capacity: 120, roomsCount: 1, pos: [-18, 0, 12], size: [10, 1.2, 7] }
];

function makeRooms(buildingId: string, floors: number, count: number) {
  const types = ["classroom", "lab", "office", "common"] as const;
  const rooms = Array.from({ length: count }, (_, i) => {
    const floor = floors === 1 ? 0 : randInt(0, floors - 1);
    const t = pick([...types]);
    return {
      room_id: `${buildingId}_r${i + 1}`,
      name: `${t.toUpperCase()} ${i + 1}`,
      floor,
      type: t,
      status: Math.random() < 0.7 ? "available" : "occupied",
      current: Math.random() < 0.35 ? "Regular Lecture" : undefined
    } as const;
  });

  return rooms.map(r => ({ ...r }));
}

function seedEvents(buildings: Building[]): CampusEvent[] {
  const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];
  const types: CampusEvent["type"][] = ["lecture", "workshop", "seminar", "sports", "exam", "cultural"];
  return Array.from({ length: 10 }, (_, i) => {
    const b = pick(buildings.filter(x => x.kind !== "parking"));
    const time = times[i % times.length];
    return {
      id: `e_${i + 1}`,
      title: pick([
        "AI Seminar",
        "DBMS Revision",
        "Placement Talk",
        "Hackathon Briefing",
        "Guest Lecture",
        "Cultural Practice",
        "Project Review"
      ]),
      buildingId: b.id,
      time,
      type: pick(types),
      audience: randInt(40, 240),
      status: "scheduled"
    };
  });
}

export function seedState(): CampusState {
  const buildings: Building[] = buildingsBase.map(b => {
    const rooms = makeRooms(b.id, b.floors, b.roomsCount);
    const occ = randInt(Math.floor(b.occupancy_capacity * 0.2), Math.floor(b.occupancy_capacity * 0.65));
    return {
      id: b.id,
      name: b.name,
      kind: b.kind,
      floors: b.floors,
      occupancy_capacity: b.occupancy_capacity,
      occupancy_current: occ,
      energy_kw: randInt(25, 120),
      status: "open",
      rooms,
      pos: b.pos,
      size: b.size
    };
  });

  const eventsToday = seedEvents(buildings);

  return {
    nowTs: Date.now(),
    lastTickTs: Date.now(),
    buildings,
    eventsToday,
    alerts: [],
    settings: {
      simulationSpeed: 1,
      occupancyThreshold: 90,
      energySpikeKw: 35
    }
  };
}
