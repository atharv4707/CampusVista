import { useMemo } from "react";
import type { RouteKey } from "../../App";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { OverviewPage } from "../../pages/OverviewPage";
import { TwinPage } from "../../pages/TwinPage";
import { RoomsPage } from "../../pages/RoomsPage";
import { EventsPage } from "../../pages/EventsPage";
import { EnergyPage } from "../../pages/EnergyPage";
import { AlertsPage } from "../../pages/AlertsPage";
import { SettingsPage } from "../../pages/SettingsPage";
import { CampusAssistant } from "../assistant/CampusAssistant";

export function AppShell({
  route,
  setRoute
}: {
  route: RouteKey;
  setRoute: (r: RouteKey) => void;
}) {
  const Page = useMemo(() => {
    switch (route) {
      case "overview":
        return <OverviewPage />;
      case "twin":
        return <TwinPage />;
      case "rooms":
        return <RoomsPage />;
      case "events":
        return <EventsPage />;
      case "energy":
        return <EnergyPage />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage />;
    }
  }, [route]);

  return (
    <div className="h-full w-full">
      <div className="flex h-full">
        <div className="hidden md:block">
          <Sidebar route={route} setRoute={setRoute} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar setRoute={setRoute} />
          <div className="flex-1 overflow-hidden p-3 md:p-4">{Page}</div>

          <div className="md:hidden">
            <MobileNav route={route} setRoute={setRoute} />
          </div>
        </div>
      </div>
      <CampusAssistant setRoute={setRoute} />
    </div>
  );
}
