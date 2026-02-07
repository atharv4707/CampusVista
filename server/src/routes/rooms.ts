import { Router } from "express";
import { ICampusStore } from "../store/ICampusStore";

export function roomsRoutes(store: ICampusStore) {
  const r = Router();

  r.get("/", (req, res) => {
    const buildingId = typeof req.query.buildingId === "string" ? req.query.buildingId : undefined;
    res.json(store.getRooms(buildingId));
  });

  return r;
}
