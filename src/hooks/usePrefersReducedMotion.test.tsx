import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type MatchMediaListener = (event: MediaQueryListEvent) => void;

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const NO_PREFERENCE_QUERY = "(prefers-reduced-motion: no-preference)";

type MatchMediaState = {
  reduce: boolean;
  noPreference: boolean;
};

function installMatchMediaMock(initialState: MatchMediaState) {
  let state = initialState;
  const listenersByQuery = new Map<string, Set<MatchMediaListener>>();

  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: query === REDUCE_MOTION_QUERY ? state.reduce : query === NO_PREFERENCE_QUERY ? state.noPreference : false,
    media: query,
    onchange: null,
    addEventListener: (_event: string, listener: MatchMediaListener) => {
      const listeners = listenersByQuery.get(query) ?? new Set<MatchMediaListener>();
      listeners.add(listener);
      listenersByQuery.set(query, listeners);
    },
    removeEventListener: (_event: string, listener: MatchMediaListener) => {
      listenersByQuery.get(query)?.delete(listener);
    },
    addListener: (listener: MatchMediaListener) => {
      const listeners = listenersByQuery.get(query) ?? new Set<MatchMediaListener>();
      listeners.add(listener);
      listenersByQuery.set(query, listeners);
    },
    removeListener: (listener: MatchMediaListener) => {
      listenersByQuery.get(query)?.delete(listener);
    },
    dispatchEvent: () => true,
  }));

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMediaMock,
  });

  return {
    setMatches(nextState: MatchMediaState) {
      state = nextState;
      listenersByQuery.forEach((listeners, query) => {
        const matches = query === REDUCE_MOTION_QUERY
          ? state.reduce
          : query === NO_PREFERENCE_QUERY
            ? state.noPreference
            : false;
        const event = { matches } as MediaQueryListEvent;
        listeners.forEach((listener) => listener(event));
      });
    },
  };
}

describe("usePrefersReducedMotion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    installMatchMediaMock({ reduce: false, noPreference: true });
  });

  it("returns true when prefers-reduced-motion matches", () => {
    installMatchMediaMock({ reduce: true, noPreference: false });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });

  it("returns false when no-preference also matches", () => {
    installMatchMediaMock({ reduce: true, noPreference: true });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });

  it("updates when the media query match changes", () => {
    const matchMediaController = installMatchMediaMock({ reduce: false, noPreference: true });
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      matchMediaController.setMatches({ reduce: true, noPreference: false });
    });

    expect(result.current).toBe(true);
  });
});
