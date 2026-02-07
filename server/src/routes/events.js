"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRoutes = eventsRoutes;
var express_1 = require("express");
function eventsRoutes(store) {
    var r = (0, express_1.Router)();
    r.get("/today", function (_req, res) { return res.json(store.getEventsToday()); });
    return r;
}
