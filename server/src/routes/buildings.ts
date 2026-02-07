import { Router } from "express";
import { ICampusStore } from "../store/ICampusStore";

export function buildingsRoutes(store: ICampusStore) {
  const r = Router();

  r.get("/", (_req, res) => res.json(store.getBuildings()));
  r.get("/:id", (req, res) => {
    const b = store.getBuilding(req.params.id);
    if (!b) return res.status(404).json({ error: "Building not found" });
    res.json(b);
  });

  return r;
}
