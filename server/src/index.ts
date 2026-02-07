import express = require("express");
import cors = require("cors");
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { config } from "./config";
import { MemoryCampusStore } from "./store/MemoryCampusStore";
import { seedState } from "./sim/seed";
import { campusRoutes } from "./routes/campus";
import { buildingsRoutes } from "./routes/buildings";
import { roomsRoutes } from "./routes/rooms";
import { eventsRoutes } from "./routes/events";
import { alertsRoutes } from "./routes/alerts";
import { settingsRoutes } from "./routes/settings";
import { assistantRoutes } from "./routes/assistant";
import { attachRealtime } from "./realtime/socket";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: true, credentials: true }
});

const store = new MemoryCampusStore(seedState());

// REST
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.use("/api/campus", campusRoutes(store));
app.use("/api/buildings", buildingsRoutes(store));
app.use("/api/rooms", roomsRoutes(store));
app.use("/api/events", eventsRoutes(store));
app.use("/api/alerts", alertsRoutes(store));
app.use("/api/settings", settingsRoutes(store));
app.use("/api/assistant", assistantRoutes(store));

// Realtime simulation
attachRealtime(io, store);

httpServer.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${config.port}`);
});
