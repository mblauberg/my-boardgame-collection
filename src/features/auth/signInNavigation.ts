import type { Location } from "react-router-dom";

export type SignInRouteState = {
  backgroundLocation?: Location;
  returnTo: string;
};

function normalizeReturnToPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

export function getReturnToPath(location: Pick<Location, "pathname" | "search" | "hash">) {
  return normalizeReturnToPath(`${location.pathname}${location.search}${location.hash}`);
}

export function getSignInRouteState(location: Location): SignInRouteState {
  return {
    backgroundLocation: location,
    returnTo: getReturnToPath(location),
  };
}

export function getReturnToFromState(state: unknown) {
  if (typeof state !== "object" || state === null || !("returnTo" in state)) {
    return "/";
  }

  const returnTo = (state as { returnTo?: unknown }).returnTo;
  return typeof returnTo === "string" ? normalizeReturnToPath(returnTo) : "/";
}

export function buildAuthRedirectUrl(returnTo: string) {
  const url = new URL("/auth/callback", window.location.origin);
  const normalizedReturnTo = normalizeReturnToPath(returnTo);

  if (normalizedReturnTo !== "/") {
    url.searchParams.set("next", normalizedReturnTo);
  }

  return url.toString();
}

export function getPostSignInPath(needsPasskeyPrompt: boolean, returnTo: string) {
  const normalizedReturnTo = normalizeReturnToPath(returnTo);

  if (!needsPasskeyPrompt) {
    return normalizedReturnTo;
  }

  const url = new URL(normalizedReturnTo, window.location.origin);
  url.searchParams.set("passkey_prompt", "1");
  return `${url.pathname}${url.search}${url.hash}`;
}
