import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { ICampusStore } from "../store/ICampusStore";

const schema = z.object({
  question: z.string().min(1).max(500)
});

function buildContext(store: ICampusStore) {
  const summary = store.getSummary();
  const buildings = store.getBuildings().slice(0, 12).map(b => ({
    id: b.id,
    name: b.name,
    status: b.status,
    occupancy_current: b.occupancy_current,
    occupancy_capacity: b.occupancy_capacity,
    openRooms: b.rooms.filter(r => r.status === "available").length
  }));
  const alerts = store.getAlerts().slice(0, 8).map(a => ({
    ts: a.ts,
    severity: a.severity,
    message: a.message,
    buildingId: a.buildingId
  }));
  const events = store.getEventsToday().slice(0, 8).map(e => ({
    title: e.title,
    time: e.time,
    status: e.status,
    buildingId: e.buildingId
  }));

  return { summary, buildings, alerts, events };
}

async function queryGemini(question: string, store: ICampusStore) {
  if (!config.geminiApiKey) {
    return {
      answer:
        "Gemini API key is not configured on server. Set GEMINI_API_KEY in server environment to enable AI answers.",
      source: "fallback" as const
    };
  }

  const model = encodeURIComponent(config.geminiModel);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;
  const context = buildContext(store);

  const prompt = [
    "You are Campus Assistant for a college digital twin dashboard.",
    "Answer only from provided campus data context.",
    "If data is missing, say that clearly and suggest a relevant dashboard action.",
    "Keep answer concise and practical (2-5 lines).",
    "Color meaning: Green 0-70 normal, Amber 70-90 warning, Red >90 danger/alert, Cyan selection highlight.",
    "",
    `User question: ${question}`,
    `Campus data context: ${JSON.stringify(context)}`
  ].join("\n");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 280 }
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Gemini error ${response.status}`);
  }

  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const answer = json.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();

  return {
    answer: answer || "I could not generate a response right now. Please try again.",
    source: "gemini" as const
  };
}

export function assistantRoutes(store: ICampusStore) {
  const r = Router();

  r.post("/query", async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const result = await queryGemini(parsed.data.question, store);
      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      return res.status(502).json({
        answer:
          "Campus Assistant AI is temporarily unavailable. You can still use quick commands like free rooms, alerts, and next event.",
        source: "fallback",
        error: message
      });
    }
  });

  return r;
}
