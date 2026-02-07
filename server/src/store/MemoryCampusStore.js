"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCampusStore = void 0;
var MemoryCampusStore = /** @class */ (function () {
    function MemoryCampusStore(initial) {
        this.state = initial;
    }
    MemoryCampusStore.prototype.getState = function () {
        return this.state;
    };
    MemoryCampusStore.prototype.setState = function (next) {
        this.state = next;
    };
    MemoryCampusStore.prototype.getSummary = function () {
        var s = this.state;
        var occupancyCurrent = s.buildings.reduce(function (a, b) { return a + b.occupancy_current; }, 0);
        var occupancyCapacity = s.buildings.reduce(function (a, b) { return a + b.occupancy_capacity; }, 0);
        var energyKw = s.buildings.reduce(function (a, b) { return a + b.energy_kw; }, 0);
        var openRooms = s.buildings.reduce(function (a, b) { return a + b.rooms.filter(function (r) { return r.status === "available"; }).length; }, 0);
        var activeEvents = s.eventsToday.filter(function (e) { return e.status === "live"; }).length;
        return {
            nowTs: s.nowTs,
            lastTickTs: s.lastTickTs,
            totals: {
                occupancyCurrent: occupancyCurrent,
                occupancyCapacity: occupancyCapacity,
                energyKw: energyKw,
                openRooms: openRooms,
                activeEvents: activeEvents,
                alertCount: s.alerts.filter(function (a) { return !a.ack; }).length
            },
            health: { connected: true }
        };
    };
    MemoryCampusStore.prototype.getBuildings = function () {
        return this.state.buildings;
    };
    MemoryCampusStore.prototype.getBuilding = function (id) {
        return this.state.buildings.find(function (b) { return b.id === id; });
    };
    MemoryCampusStore.prototype.getRooms = function (buildingId) {
        var _a, _b;
        if (!buildingId)
            return this.state.buildings.flatMap(function (b) { return b.rooms; });
        return (_b = (_a = this.getBuilding(buildingId)) === null || _a === void 0 ? void 0 : _a.rooms) !== null && _b !== void 0 ? _b : [];
    };
    MemoryCampusStore.prototype.getEventsToday = function () {
        return this.state.eventsToday;
    };
    MemoryCampusStore.prototype.getAlerts = function () {
        // newest first
        return __spreadArray([], this.state.alerts, true).sort(function (a, b) { return b.ts - a.ts; });
    };
    MemoryCampusStore.prototype.updateSettings = function (patch) {
        this.state = __assign(__assign({}, this.state), { settings: __assign(__assign({}, this.state.settings), patch) });
        return this.state.settings;
    };
    MemoryCampusStore.prototype.pushAlert = function (a) {
        this.state = __assign(__assign({}, this.state), { alerts: __spreadArray([a], this.state.alerts, true).slice(0, 200) });
    };
    MemoryCampusStore.prototype.replaceAlerts = function (next) {
        this.state = __assign(__assign({}, this.state), { alerts: next.slice(0, 200) });
    };
    return MemoryCampusStore;
}());
exports.MemoryCampusStore = MemoryCampusStore;
