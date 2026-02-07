import { Router } from "express";
import { ICampusStore } from "../store/ICampusStore";

export function alertsRoutes(store: ICampusStore) {
  const r = Router();

  r.get("/", (_req, res) => res.json(store.getAlerts()));

  return r;
}
