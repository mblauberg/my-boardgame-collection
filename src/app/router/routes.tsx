import { Suspense } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";
import { RequireOwner } from "../../features/auth/RequireOwner";
import {
  appRouteDefinitions,
  appRouteEntries,
  backgroundOverlayRouteEntries,
  desktopNavRouteDefinitions,
  mobileNavRouteDefinitions,
  type AppRouteDefinition,
  type AppRouteEntry,
} from "./routeRegistry";

type AppRoutesProps = {
  location?: Location;
};

function renderRouteElement(route: AppRouteEntry) {
  if (!route.requiresOwner) {
    return route.element;
  }

  return <RequireOwner>{route.element}</RequireOwner>;
}

export function RouteLoadingFallback() {
  return <div className="py-16 text-center text-sm text-on-surface-variant">Loading...</div>;
}

export function AppRoutes({ location }: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes location={location}>
        {appRouteEntries.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={renderRouteElement(route)}
          />
        ))}
        <Route path="/recommendations" element={<Navigate replace to="/explore" />} />
      </Routes>
    </Suspense>
  );
}

export {
  appRouteDefinitions,
  backgroundOverlayRouteEntries,
  desktopNavRouteDefinitions,
  mobileNavRouteDefinitions,
};
export type { AppRouteDefinition };
