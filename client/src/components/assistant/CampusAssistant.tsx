import { useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { RouteKey } from "../../App";
import { campusStore } from "../../store/campusStore";
import { pct } from "../../lib/utils";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

function minutesFromTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function findBuildingName(input: string, buildingNames: string[]) {
  const q = input.toLowerCase();
  return buildingNames.find(name => q.includes(name.toLowerCase()));
}

function answerQuery(input: string, setRoute: (r: RouteKey) => void) {
  const ASK_AI = "__ASK_AI__";
  const st = campusStore.get();
  const q = input.toLowerCase().trim();
  const buildingMap = new Map(st.buildings.map(b => [b.id, b.name]));

  if (!q) return "Type a question. Example: Show free rooms now.";

  if (q.includes("help") || q.includes("how to use") || q.includes("what can you do")) {
    return "I can help with: free rooms, occupancy >90%, active alerts, next event, Twin usage, color meaning, and location lookups.";
  }

  if (q.includes("how do i check free rooms") || q.includes("show free rooms")) {
    const freeRooms = st.buildings
      .flatMap(b => b.rooms.filter(r => r.status === "available").map(r => `${r.name} (${b.name})`))
      .slice(0, 8);
    setRoute("rooms");
    return freeRooms.length
      ? `Free rooms now: ${freeRooms.join(", ")}.`
      : "No free rooms at the moment.";
  }

  if ((q.includes(">90") || q.includes("90%")) && q.includes("occupancy")) {
    const hot = st.buildings
      .map(b => ({ name: b.name, p: pct(b.occupancy_current, b.occupancy_capacity) }))
      .filter(x => x.p > 90)
      .sort((a, b) => b.p - a.p);
    setRoute("twin");
    return hot.length
      ? `Buildings above 90% occupancy: ${hot.map(x => `${x.name} (${x.p}%)`).join(", ")}.`
      : "No buildings are above 90% occupancy right now.";
  }

  if (q.includes("any alerts") || q.includes("alerts right now")) {
    const top = st.alerts.slice(0, 5).map(a => a.message);
    setRoute("alerts");
    return top.length ? `Active alerts: ${top.join(" | ")}` : "No active alerts right now.";
  }

  if (q.includes("next event")) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const next = [...st.eventsToday]
      .sort((a, b) => minutesFromTime(a.time) - minutesFromTime(b.time))
      .find(e => minutesFromTime(e.time) >= nowMin) ?? [...st.eventsToday].sort((a, b) => minutesFromTime(a.time) - minutesFromTime(b.time))[0];
    setRoute("events");
    return next
      ? `Next event: ${next.title} at ${next.time} in ${buildingMap.get(next.buildingId) ?? next.buildingId}.`
      : "No scheduled events today.";
  }

  if (q.includes("what do the colors mean") || q.includes("what does amber mean") || q.includes("amber mean")) {
    return "Green means normal/available (0-70%). Amber means warning (70-90%). Red means danger or alert (>90%). Cyan is selection highlight.";
  }

  if (q.includes("what is occupancy")) {
    return "Occupancy is the number of people currently in a building or room compared to its capacity.";
  }

  if (q.includes("how to use the twin")) {
    setRoute("twin");
    return "In 3D Twin: hover a building to see tooltip, click to open drawer, use camera presets at top-right, and use Find Free Room for quick navigation.";
  }

  if (q.includes("why is this building red") || q.includes("why is building red")) {
    const selected = st.buildings.find(b => b.id === st.selectedBuildingId);
    if (!selected) return "Red means occupancy is above 90% or the building status is closed/alert. Select a building and ask again for a specific reason.";
    const p = pct(selected.occupancy_current, selected.occupancy_capacity);
    return `${selected.name} is red because occupancy is ${p}%${selected.status !== "open" ? ` and status is ${selected.status}` : ""}.`;
  }

  if (q.startsWith("where is")) {
    const target = q.replace("where is", "").trim();
    if (!target) return "Tell me a place name. Example: Where is Seminar Hall?";
    const roomHit = st.buildings
      .flatMap(b => b.rooms.map(r => ({ b, r })))
      .find(x => x.r.name.toLowerCase().includes(target));
    if (roomHit) return `${roomHit.r.name} is in ${roomHit.b.name}, floor ${roomHit.r.floor}.`;
    const buildingHit = st.buildings.find(b => b.name.toLowerCase().includes(target));
    if (buildingHit) return `${buildingHit.name} is available on the Twin view map.`;
    return "I could not find that place in current campus data.";
  }

  if (q.includes("how to reach")) {
    return "Route guidance is planned next. Current scope can identify building/room location and nearest free room.";
  }

  const namedBuilding = findBuildingName(q, st.buildings.map(b => b.name));
  if (namedBuilding && q.includes("why") && q.includes("red")) {
    const b = st.buildings.find(x => x.name === namedBuilding);
    if (!b) return "I could not find that building in current data.";
    const p = pct(b.occupancy_current, b.occupancy_capacity);
    return `${b.name} is red when occupancy is above 90% or status is not open. Current occupancy is ${p}% and status is ${b.status}.`;
  }

  return ASK_AI;
}

export function CampusAssistant({ setRoute }: { setRoute: (r: RouteKey) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "bot",
      text: "CampusVista Assistant ready. Ask: Show free rooms now, Any alerts right now, or What's next event today?"
    }
  ]);

  const quickPrompts = useMemo(
    () => ["Show free rooms now", "Show buildings with >90% occupancy", "Any alerts right now?", "What is the next event today?"],
    []
  );

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: value };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    const localAnswer = answerQuery(value, setRoute);

    if (localAnswer !== "__ASK_AI__") {
      const botMsg: ChatMessage = { id: `b-${Date.now()}`, role: "bot", text: localAnswer };
      setMessages(prev => [...prev, botMsg]);
      return;
    }

    setLoading(true);
    try {
      const resp = await api.assistantQuery(value);
      const botMsg: ChatMessage = { id: `b-${Date.now()}`, role: "bot", text: resp.answer };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: "Assistant AI is unavailable right now. Try quick commands: free rooms, alerts, next event, >90% occupancy."
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-2 right-2 z-[70] w-auto rounded-xl border border-slate-700 bg-slate-900/95 shadow-sm md:bottom-20 md:left-auto md:right-4 md:w-[min(92vw,380px)]">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
            <div className="text-sm font-semibold text-white">CampusVista Assistant</div>
            <button className="text-xs text-white/70 hover:text-white" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          <div className="max-h-[42vh] space-y-2 overflow-auto p-3 md:max-h-80">
            {messages.map(m => (
              <div
                key={m.id}
                className={`rounded-lg border p-2 text-sm ${
                  m.role === "bot"
                    ? "border-white/10 bg-white/[0.03] text-white/85"
                    : "border-cyan-400/35 bg-cyan-500/10 text-cyan-100"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => void submit(p)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/80 hover:bg-white/[0.08]"
                >
                  {p}
                </button>
              ))}
            </div>
            {loading && <div className="mb-2 text-xs text-white/65">Assistant is thinking...</div>}

            <div className="flex items-center gap-2">
              <Input
                id="assistant-query"
                name="assistantQuery"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about rooms, alerts, occupancy, events..."
                onKeyDown={e => {
                  if (e.key === "Enter") void submit(query);
                }}
              />
              <Button size="sm" onClick={() => void submit(query)}>
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 right-2 z-[71] inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-100 shadow-sm md:bottom-5 md:right-4"
      >
        <MessageCircle size={16} />
        CampusVista Assistant
      </button>
    </>
  );
}
