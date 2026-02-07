import { Server as IOServer } from "socket.io";
import { config } from "../config";
import { ICampusStore } from "../store/ICampusStore";
import { tickSimulation } from "../sim/engine";
import { randInt } from "../utils/rand";

export function attachRealtime(io: IOServer, store: ICampusStore) {
  io.on("connection", socket => {
    socket.emit("campus:hello", {
      ts: Date.now(),
      msg: "Connected to CAMPUS DIGITAL TWIN realtime"
    });

    socket.on("client:sync", () => {
      socket.emit("campus:snapshot", store.getState());
    });
  });

  // simulation loop with dynamic tick
  let timer: NodeJS.Timeout | null = null;

  const loop = () => {
    const { delta, newAlerts } = tickSimulation(store);

    io.emit("campus:update", delta);
    for (const a of newAlerts) io.emit("alerts:new", a);

    const nextMs = randInt(config.tickMinMs, config.tickMaxMs);
    timer = setTimeout(loop, nextMs);
  };

  timer = setTimeout(loop, randInt(config.tickMinMs, config.tickMaxMs));

  return () => {
    if (timer) clearTimeout(timer);
  };
}
