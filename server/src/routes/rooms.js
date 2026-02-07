"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomsRoutes = roomsRoutes;
var express_1 = require("express");
function roomsRoutes(store) {
    var r = (0, express_1.Router)();
    r.get("/", function (req, res) {
        var buildingId = typeof req.query.buildingId === "string" ? req.query.buildingId : undefined;
        res.json(store.getRooms(buildingId));
    });
    return r;
}
