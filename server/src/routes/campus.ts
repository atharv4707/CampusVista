import { Router } from "express";
import { ICampusStore } from "../store/ICampusStore";

export function campusRoutes(store: ICampusStore) {
  const r = Router();

  r.get("/summary", (_req, res) => {
    res.json(store.getSummary());
  });

  return r;
}
