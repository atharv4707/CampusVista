import { Router } from "express";
import { ICampusStore } from "../store/ICampusStore";

export function eventsRoutes(store: ICampusStore) {
  const r = Router();

  r.get("/today", (_req, res) => res.json(store.getEventsToday()));

  return r;
}
