"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var config_1 = require("./config");
var MemoryCampusStore_1 = require("./store/MemoryCampusStore");
var seed_1 = require("./sim/seed");
var campus_1 = require("./routes/campus");
var buildings_1 = require("./routes/buildings");
var rooms_1 = require("./routes/rooms");
var events_1 = require("./routes/events");
var alerts_1 = require("./routes/alerts");
var settings_1 = require("./routes/settings");
var assistant_1 = require("./routes/assistant");
var socket_1 = require("./realtime/socket");
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
var httpServer = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(httpServer, {
    cors: { origin: true, credentials: true }
});
var store = new MemoryCampusStore_1.MemoryCampusStore((0, seed_1.seedState)());
// REST
app.get("/health", function (_req, res) { return res.json({ ok: true, ts: Date.now() }); });
app.use("/api/campus", (0, campus_1.campusRoutes)(store));
app.use("/api/buildings", (0, buildings_1.buildingsRoutes)(store));
app.use("/api/rooms", (0, rooms_1.roomsRoutes)(store));
app.use("/api/events", (0, events_1.eventsRoutes)(store));
app.use("/api/alerts", (0, alerts_1.alertsRoutes)(store));
app.use("/api/settings", (0, settings_1.settingsRoutes)(store));
app.use("/api/assistant", (0, assistant_1.assistantRoutes)(store));
// Realtime simulation
(0, socket_1.attachRealtime)(io, store);
httpServer.listen(config_1.config.port, function () {
    // eslint-disable-next-line no-console
    console.log("[server] listening on http://localhost:".concat(config_1.config.port));
});
