"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsRoutes = alertsRoutes;
var express_1 = require("express");
function alertsRoutes(store) {
    var r = (0, express_1.Router)();
    r.get("/", function (_req, res) { return res.json(store.getAlerts()); });
    return r;
}
