"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.randInt = randInt;
exports.randFloat = randFloat;
exports.pick = pick;
exports.jitter = jitter;
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function randInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}
function randFloat(min, max) {
    return min + Math.random() * (max - min);
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function jitter(value, amt) {
    return value + (Math.random() * 2 - 1) * amt;
}
