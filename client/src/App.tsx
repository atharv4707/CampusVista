import { useEffect, useState } from "react";
import { createCampusSocket } from "./lib/socket";
import { campusStore } from "./store/campusStore";
import { AppShell } from "./components/layout/AppShell";

export type RouteKey = "overview" | "twin" | "rooms" | "events" | "energy" | "alerts" | "settings";

export function App() {
  const [, force] = useState(0);
  useEffect(() => campusStore.subscribe(() => force(x => x + 1)), []);

  const [route, setRoute] = useState<RouteKey>("overview");

  useEffect(() => {
    campusStore.bootstrap().catch(console.error);
  }, []);

  useEffect(() => {
    const socket = createCampusSocket({
      onConnect: () => campusStore.setConnected(true),
      onDisconnect: () => campusStore.setConnected(false),
      onDelta: d => campusStore.applyDelta(d),
      onAlert: a => campusStore.pushAlert(a)
    });

    // In React Strict Mode dev, initial mount can unmount immediately.
    // Deferring connect avoids closing a CONNECTING socket during that cycle.
    const connectTimer = window.setTimeout(() => socket.connect(), 0);

    return () => {
      window.clearTimeout(connectTimer);
      if (socket.connected || socket.active) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let t: number | undefined;

    const run = async () => {
      const st = campusStore.get();
      if (!st.connected) {
        await campusStore.pollOnce().catch(() => {});
      }
      t = window.setTimeout(run, st.connected ? 5000 : 3500);
    };

    run();
    return () => {
      if (t !== undefined) {
        window.clearTimeout(t);
      }
    };
  }, []);

  return <AppShell route={route} setRoute={setRoute} />;
}
