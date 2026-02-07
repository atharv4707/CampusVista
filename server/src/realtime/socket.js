"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachRealtime = attachRealtime;
var config_1 = require("../config");
var engine_1 = require("../sim/engine");
var rand_1 = require("../utils/rand");
function attachRealtime(io, store) {
    io.on("connection", function (socket) {
        socket.emit("campus:hello", {
            ts: Date.now(),
            msg: "Connected to CAMPUS DIGITAL TWIN realtime"
        });
        socket.on("client:sync", function () {
            socket.emit("campus:snapshot", store.getState());
        });
    });
    // simulation loop with dynamic tick
    var timer = null;
    var loop = function () {
        var _a = (0, engine_1.tickSimulation)(store), delta = _a.delta, newAlerts = _a.newAlerts;
        io.emit("campus:update", delta);
        for (var _i = 0, newAlerts_1 = newAlerts; _i < newAlerts_1.length; _i++) {
            var a = newAlerts_1[_i];
            io.emit("alerts:new", a);
        }
        var nextMs = (0, rand_1.randInt)(config_1.config.tickMinMs, config_1.config.tickMaxMs);
        timer = setTimeout(loop, nextMs);
    };
    timer = setTimeout(loop, (0, rand_1.randInt)(config_1.config.tickMinMs, config_1.config.tickMaxMs));
    return function () {
        if (timer)
            clearTimeout(timer);
    };
}
