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
exports.seedState = seedState;
var rand_1 = require("../utils/rand");
var buildingsBase = [
    { id: "b_admin", name: "Admin Block", kind: "admin", floors: 3, occupancy_capacity: 320, roomsCount: 10, pos: [-10, 0, -6], size: [6, 3, 5] },
    { id: "b_library", name: "Library", kind: "library", floors: 2, occupancy_capacity: 220, roomsCount: 6, pos: [-2, 0, -8], size: [6, 2.6, 5] },
    { id: "b_cse", name: "CSE Block", kind: "cse", floors: 4, occupancy_capacity: 520, roomsCount: 18, pos: [8, 0, -6], size: [8, 4, 6] },
    { id: "b_mech", name: "Mechanical Block", kind: "mechanical", floors: 3, occupancy_capacity: 420, roomsCount: 14, pos: [14, 0, 2], size: [7, 3.2, 6] },
    { id: "b_ece", name: "ECE Block", kind: "ece", floors: 3, occupancy_capacity: 380, roomsCount: 12, pos: [2, 0, 2], size: [7, 3.2, 5.5] },
    { id: "b_workshop", name: "Workshop", kind: "workshop", floors: 1, occupancy_capacity: 180, roomsCount: 4, pos: [18, 0, -6], size: [7, 2, 5] },
    { id: "b_canteen", name: "Canteen", kind: "canteen", floors: 1, occupancy_capacity: 260, roomsCount: 4, pos: [-12, 0, 4], size: [7, 2.1, 5] },
    { id: "b_audi", name: "Auditorium", kind: "auditorium", floors: 1, occupancy_capacity: 600, roomsCount: 2, pos: [-2, 0, 6], size: [10, 2.2, 7] },
    { id: "b_hostel", name: "Hostel", kind: "hostel", floors: 5, occupancy_capacity: 900, roomsCount: 20, pos: [10, 0, 10], size: [9, 5, 7] },
    { id: "b_parking", name: "Parking", kind: "parking", floors: 1, occupancy_capacity: 120, roomsCount: 1, pos: [-18, 0, 12], size: [10, 1.2, 7] }
];
function makeRooms(buildingId, floors, count) {
    var types = ["classroom", "lab", "office", "common"];
    var rooms = Array.from({ length: count }, function (_, i) {
        var floor = floors === 1 ? 0 : (0, rand_1.randInt)(0, floors - 1);
        var t = (0, rand_1.pick)(__spreadArray([], types, true));
        return {
            room_id: "".concat(buildingId, "_r").concat(i + 1),
            name: "".concat(t.toUpperCase(), " ").concat(i + 1),
            floor: floor,
            type: t,
            status: Math.random() < 0.7 ? "available" : "occupied",
            current: Math.random() < 0.35 ? "Regular Lecture" : undefined
        };
    });
    return rooms.map(function (r) { return (__assign({}, r)); });
}
function seedEvents(buildings) {
    var times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];
    var types = ["lecture", "workshop", "seminar", "sports", "exam", "cultural"];
    return Array.from({ length: 10 }, function (_, i) {
        var b = (0, rand_1.pick)(buildings.filter(function (x) { return x.kind !== "parking"; }));
        var time = times[i % times.length];
        return {
            id: "e_".concat(i + 1),
            title: (0, rand_1.pick)([
                "AI Seminar",
                "DBMS Revision",
                "Placement Talk",
                "Hackathon Briefing",
                "Guest Lecture",
                "Cultural Practice",
                "Project Review"
            ]),
            buildingId: b.id,
            time: time,
            type: (0, rand_1.pick)(types),
            audience: (0, rand_1.randInt)(40, 240),
            status: "scheduled"
        };
    });
}
function seedState() {
    var buildings = buildingsBase.map(function (b) {
        var rooms = makeRooms(b.id, b.floors, b.roomsCount);
        var occ = (0, rand_1.randInt)(Math.floor(b.occupancy_capacity * 0.2), Math.floor(b.occupancy_capacity * 0.65));
        return {
            id: b.id,
            name: b.name,
            kind: b.kind,
            floors: b.floors,
            occupancy_capacity: b.occupancy_capacity,
            occupancy_current: occ,
            energy_kw: (0, rand_1.randInt)(25, 120),
            status: "open",
            rooms: rooms,
            pos: b.pos,
            size: b.size
        };
    });
    var eventsToday = seedEvents(buildings);
    return {
        nowTs: Date.now(),
        lastTickTs: Date.now(),
        buildings: buildings,
        eventsToday: eventsToday,
        alerts: [],
        settings: {
            simulationSpeed: 1,
            occupancyThreshold: 90,
            energySpikeKw: 35
        }
    };
}
