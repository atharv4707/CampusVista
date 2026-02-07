"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingsRoutes = buildingsRoutes;
var express_1 = require("express");
function buildingsRoutes(store) {
    var r = (0, express_1.Router)();
    r.get("/", function (_req, res) { return res.json(store.getBuildings()); });
    r.get("/:id", function (req, res) {
        var b = store.getBuilding(req.params.id);
        if (!b)
            return res.status(404).json({ error: "Building not found" });
        res.json(b);
    });
    return r;
}
