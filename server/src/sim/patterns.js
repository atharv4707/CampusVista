"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayPhase = getDayPhase;
exports.targetOccupancyMultiplier = targetOccupancyMultiplier;
exports.baseEnergyMultiplier = baseEnergyMultiplier;
// Very lightweight “time of day” shaping (server time).
function getDayPhase(date) {
    if (date === void 0) { date = new Date(); }
    var h = date.getHours() + date.getMinutes() / 60;
    // Morning peak ~10-12, Lunch peak ~13, Afternoon moderate
    if (h >= 9 && h < 12.5)
        return "morning_peak";
    if (h >= 12.5 && h < 14.2)
        return "lunch_peak";
    if (h >= 14.2 && h < 17.2)
        return "afternoon";
    return "off_peak";
}
function targetOccupancyMultiplier(kind, phase) {
    if (kind === "canteen") {
        if (phase === "lunch_peak")
            return 0.92;
        if (phase === "morning_peak")
            return 0.45;
        return 0.30;
    }
    if (kind === "auditorium") {
        if (phase === "morning_peak" || phase === "afternoon")
            return 0.35;
        return 0.15;
    }
    if (kind === "hostel") {
        if (phase === "morning_peak")
            return 0.25;
        if (phase === "lunch_peak")
            return 0.35;
        return 0.55;
    }
    if (kind === "parking")
        return phase === "morning_peak" ? 0.7 : 0.45;
    // academic blocks
    if (phase === "morning_peak")
        return 0.78;
    if (phase === "lunch_peak")
        return 0.52;
    if (phase === "afternoon")
        return 0.68;
    return 0.30;
}
function baseEnergyMultiplier(kind, phase) {
    if (kind === "canteen")
        return phase === "lunch_peak" ? 1.25 : 0.95;
    if (kind === "auditorium")
        return phase === "afternoon" ? 1.15 : 0.85;
    if (kind === "hostel")
        return phase === "off_peak" ? 1.1 : 0.9;
    if (kind === "parking")
        return 0.6;
    return phase === "morning_peak" ? 1.15 : phase === "afternoon" ? 1.05 : 0.85;
}
