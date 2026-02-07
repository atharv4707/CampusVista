"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusRoutes = campusRoutes;
var express_1 = require("express");
function campusRoutes(store) {
    var r = (0, express_1.Router)();
    r.get("/summary", function (_req, res) {
        res.json(store.getSummary());
    });
    return r;
}
