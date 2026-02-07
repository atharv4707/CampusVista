"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assistantRoutes = assistantRoutes;
var express_1 = require("express");
var zod_1 = require("zod");
var config_1 = require("../config");
var schema = zod_1.z.object({
    question: zod_1.z.string().min(1).max(500)
});
function buildContext(store) {
    var summary = store.getSummary();
    var buildings = store.getBuildings().slice(0, 12).map(function (b) { return ({
        id: b.id,
        name: b.name,
        status: b.status,
        occupancy_current: b.occupancy_current,
        occupancy_capacity: b.occupancy_capacity,
        openRooms: b.rooms.filter(function (r) { return r.status === "available"; }).length
    }); });
    var alerts = store.getAlerts().slice(0, 8).map(function (a) { return ({
        ts: a.ts,
        severity: a.severity,
        message: a.message,
        buildingId: a.buildingId
    }); });
    var events = store.getEventsToday().slice(0, 8).map(function (e) { return ({
        title: e.title,
        time: e.time,
        status: e.status,
        buildingId: e.buildingId
    }); });
    return { summary: summary, buildings: buildings, alerts: alerts, events: events };
}
function queryGemini(question, store) {
    return __awaiter(this, void 0, void 0, function () {
        var model, url, context, prompt, response, text, json, answer;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!config_1.config.geminiApiKey) {
                        return [2 /*return*/, {
                                answer: "Gemini API key is not configured on server. Set GEMINI_API_KEY in server environment to enable AI answers.",
                                source: "fallback"
                            }];
                    }
                    model = encodeURIComponent(config_1.config.geminiModel);
                    url = "https://generativelanguage.googleapis.com/v1beta/models/".concat(model, ":generateContent?key=").concat(config_1.config.geminiApiKey);
                    context = buildContext(store);
                    prompt = [
                        "You are Campus Assistant for a college digital twin dashboard.",
                        "Answer only from provided campus data context.",
                        "If data is missing, say that clearly and suggest a relevant dashboard action.",
                        "Keep answer concise and practical (2-5 lines).",
                        "Color meaning: Green 0-70 normal, Amber 70-90 warning, Red >90 danger/alert, Cyan selection highlight.",
                        "",
                        "User question: ".concat(question),
                        "Campus data context: ".concat(JSON.stringify(context))
                    ].join("\n");
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{ role: "user", parts: [{ text: prompt }] }],
                                generationConfig: { temperature: 0.2, maxOutputTokens: 280 }
                            })
                        })];
                case 1:
                    response = _e.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text().catch(function () { return ""; })];
                case 2:
                    text = _e.sent();
                    throw new Error(text || "Gemini error ".concat(response.status));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    json = (_e.sent());
                    answer = (_d = (_c = (_b = (_a = json.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.map(function (p) { return p.text || ""; }).join("").trim();
                    return [2 /*return*/, {
                            answer: answer || "I could not generate a response right now. Please try again.",
                            source: "gemini"
                        }];
            }
        });
    });
}
function assistantRoutes(store) {
    var _this = this;
    var r = (0, express_1.Router)();
    r.post("/query", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var parsed, result, error_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsed = schema.safeParse(req.body);
                    if (!parsed.success)
                        return [2 /*return*/, res.status(400).json({ error: parsed.error.flatten() })];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, queryGemini(parsed.data.question, store)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, res.json(result)];
                case 3:
                    error_1 = _a.sent();
                    message = error_1 instanceof Error ? error_1.message : "unknown error";
                    return [2 /*return*/, res.status(502).json({
                            answer: "Campus Assistant AI is temporarily unavailable. You can still use quick commands like free rooms, alerts, and next event.",
                            source: "fallback",
                            error: message
                        })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    return r;
}
