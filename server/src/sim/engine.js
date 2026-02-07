"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tickSimulation = tickSimulation;
var rand_1 = require("../utils/rand");
var patterns_1 = require("./patterns");
function mkId(prefix) {
    return "".concat(prefix, "_").concat(Math.random().toString(16).slice(2), "_").concat(Date.now().toString(16));
}
function tickSimulation(store) {
    var state = store.getState();
    var phase = (0, patterns_1.getDayPhase)(new Date());
    var speed = (0, rand_1.clamp)(state.settings.simulationSpeed, 0.5, 2);
    var nowTs = Date.now();
    var buildingUpdates = [];
    var roomUpdates = [];
    var eventUpdates = [];
    var newAlerts = [];
    // Update events statuses based on time window (simple)
    var hhmmToMinutes = function (t) {
        var _a = t.split(":").map(Number), h = _a[0], m = _a[1];
        return h * 60 + m;
    };
    var nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    for (var _i = 0, _a = state.eventsToday; _i < _a.length; _i++) {
        var e = _a[_i];
        var start = hhmmToMinutes(e.time);
        var end = start + 70;
        var prev = e.status;
        var next = prev;
        if (nowMins >= start && nowMins < end)
            next = "live";
        else if (nowMins >= end)
            next = "completed";
        else
            next = "scheduled";
        if (next !== prev) {
            e.status = next;
            eventUpdates.push({ id: e.id, status: next });
        }
    }
    for (var _b = 0, _c = state.buildings; _b < _c.length; _b++) {
        var b = _c[_b];
        var targetMult = (0, patterns_1.targetOccupancyMultiplier)(b.kind, phase);
        var targetOcc = Math.floor(b.occupancy_capacity * targetMult);
        // random-walk towards target
        var diff = targetOcc - b.occupancy_current;
        var step = (0, rand_1.clamp)(Math.round(diff * (0, rand_1.randFloat)(0.05, 0.16) * speed), -45, 45);
        var noise = (0, rand_1.randInt)(-10, 10);
        var nextOcc = (0, rand_1.clamp)(b.occupancy_current + step + noise, 0, b.occupancy_capacity);
        // building status occasionally changes
        var nextStatus = b.status;
        if (Math.random() < 0.012 * speed)
            nextStatus = (0, rand_1.pick)(["open", "open", "open", "maintenance", "closed"]);
        // energy follows occupancy + phase
        var base = 18 + (b.occupancy_capacity / 25);
        var occFactor = 0.12 * (nextOcc / Math.max(1, b.occupancy_capacity)) * b.occupancy_capacity;
        var nextEnergy = (0, patterns_1.baseEnergyMultiplier)(b.kind, phase) * (base + occFactor) + (0, rand_1.randFloat)(-6, 6);
        nextEnergy = (0, rand_1.clamp)(nextEnergy, 5, 260);
        // Apply
        var prevEnergy = b.energy_kw;
        b.occupancy_current = nextOcc;
        b.energy_kw = Number(nextEnergy.toFixed(1));
        b.status = nextStatus;
        buildingUpdates.push({
            id: b.id,
            occupancy_current: b.occupancy_current,
            energy_kw: b.energy_kw,
            status: b.status
        });
        // Rooms: a few flips per tick
        var flips = (0, rand_1.randInt)(1, Math.max(2, Math.floor(b.rooms.length / 6)));
        for (var i = 0; i < flips; i++) {
            var r = b.rooms[(0, rand_1.randInt)(0, b.rooms.length - 1)];
            var prev = r.status;
            var roll = Math.random();
            var next = prev;
            if (b.status !== "open") {
                next = "closed";
            }
            else {
                if (roll < 0.60)
                    next = "available";
                else if (roll < 0.96)
                    next = "occupied";
                else
                    next = "closed";
            }
            if (next !== prev) {
                r.status = next;
                r.current =
                    next === "occupied"
                        ? (0, rand_1.pick)(["Lecture", "Lab Session", "Project Work", "Seminar Prep"]) + " \u2014 ".concat((0, rand_1.pick)(["FY", "SY", "TY", "Final"]))
                        : undefined;
                roomUpdates.push({ buildingId: b.id, room_id: r.room_id, status: r.status, current: r.current });
            }
        }
        // Alerts: overcrowding
        var occPct = (b.occupancy_current / Math.max(1, b.occupancy_capacity)) * 100;
        if (occPct > state.settings.occupancyThreshold && Math.random() < 0.35) {
            newAlerts.push({
                id: mkId("a_occ"),
                ts: nowTs,
                severity: occPct > 97 ? "critical" : "high",
                type: "overcrowding",
                buildingId: b.id,
                message: "".concat(b.name, " overcrowding: ").concat(occPct.toFixed(0), "% occupancy")
            });
        }
        // Alerts: energy spike (delta)
        var deltaE = b.energy_kw - prevEnergy;
        if (deltaE > state.settings.energySpikeKw && Math.random() < 0.55) {
            newAlerts.push({
                id: mkId("a_energy"),
                ts: nowTs,
                severity: deltaE > state.settings.energySpikeKw * 1.5 ? "critical" : "high",
                type: "energy_spike",
                buildingId: b.id,
                message: "".concat(b.name, " energy spike: +").concat(deltaE.toFixed(1), " kW")
            });
        }
        // Alerts: room conflict (rare)
        if (Math.random() < 0.02 * speed) {
            var rr = b.rooms.find(function (x) { return x.status === "occupied"; });
            if (rr) {
                newAlerts.push({
                    id: mkId("a_conf"),
                    ts: nowTs,
                    severity: "medium",
                    type: "room_conflict",
                    buildingId: b.id,
                    roomId: rr.room_id,
                    message: "Room conflict detected: ".concat(b.name, " / ").concat(rr.name)
                });
            }
        }
    }
    // Persist alerts
    for (var _d = 0, newAlerts_1 = newAlerts; _d < newAlerts_1.length; _d++) {
        var a = newAlerts_1[_d];
        store.pushAlert(a);
    }
    // Update timestamps in state
    state.nowTs = nowTs;
    state.lastTickTs = nowTs;
    store.setState(state);
    var delta = {
        ts: nowTs,
        buildings: buildingUpdates,
        rooms: roomUpdates.length ? roomUpdates : undefined,
        events: eventUpdates.length ? eventUpdates : undefined
    };
    return { delta: delta, newAlerts: newAlerts };
}
