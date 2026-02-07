import { io, Socket } from "socket.io-client";
import type { Alert, CampusDelta } from "./types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:8080";

export type SocketHandlers = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onDelta?: (d: CampusDelta) => void;
  onAlert?: (a: Alert) => void;
};

export function createCampusSocket(h: SocketHandlers) {
  const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelayMax: 4000
  });

  socket.on("connect", () => h.onConnect?.());
  socket.on("disconnect", () => h.onDisconnect?.());
  socket.on("campus:update", (d: CampusDelta) => h.onDelta?.(d));
  socket.on("alerts:new", (a: Alert) => h.onAlert?.(a));

  return socket;
}
