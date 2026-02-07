import type { Alert, Building, CampusEvent, CampusSummary, Room, Settings } from "./types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  summary: () => j<CampusSummary>("/api/campus/summary"),
  buildings: () => j<Building[]>("/api/buildings"),
  building: (id: string) => j<Building>(`/api/buildings/${id}`),
  rooms: (buildingId?: string) => j<Room[]>(`/api/rooms${buildingId ? `?buildingId=${encodeURIComponent(buildingId)}` : ""}`),
  eventsToday: () => j<CampusEvent[]>("/api/events/today"),
  alerts: () => j<Alert[]>("/api/alerts"),
  settings: (patch: Partial<Settings>) => j<Settings>("/api/settings", { method: "POST", body: JSON.stringify(patch) }),
  assistantQuery: (question: string) =>
    j<{ answer: string; source: "gemini" | "fallback" }>("/api/assistant/query", {
      method: "POST",
      body: JSON.stringify({ question })
    })
};
