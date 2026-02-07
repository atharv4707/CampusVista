import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8080),
  clientOrigin: String(process.env.CLIENT_ORIGIN || "http://localhost:5173"),
  tickMinMs: Number(process.env.TICK_MIN_MS || 3000),
  tickMaxMs: Number(process.env.TICK_MAX_MS || 5000),
  geminiApiKey: String(process.env.GEMINI_API_KEY || ""),
  geminiModel: String(process.env.GEMINI_MODEL || "gemini-2.0-flash")
};
