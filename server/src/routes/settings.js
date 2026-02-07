"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRoutes = settingsRoutes;
var express_1 = require("express");
var zod_1 = require("zod");
var schema = zod_1.z.object({
    simulationSpeed: zod_1.z.number().min(0.5).max(2).optional(),
    occupancyThreshold: zod_1.z.number().min(50).max(99).optional(),
    energySpikeKw: zod_1.z.number().min(5).max(120).optional()
});
function settingsRoutes(store) {
    var r = (0, express_1.Router)();
    r.post("/", function (req, res) {
        var parsed = schema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        var next = store.updateSettings(parsed.data);
        res.json(next);
    });
    return r;
}
