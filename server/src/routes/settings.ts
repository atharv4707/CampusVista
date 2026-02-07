import { Router } from "express";
import { z } from "zod";
import { ICampusStore } from "../store/ICampusStore";

const schema = z.object({
  simulationSpeed: z.number().min(0.5).max(2).optional(),
  occupancyThreshold: z.number().min(50).max(99).optional(),
  energySpikeKw: z.number().min(5).max(120).optional()
});

export function settingsRoutes(store: ICampusStore) {
  const r = Router();

  r.post("/", (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const next = store.updateSettings(parsed.data);
    res.json(next);
  });

  return r;
}
