import type { Location } from "react-router-dom";

export function getSignInRouteState(location: Location) {
  return {
    backgroundLocation: location,
  };
}
