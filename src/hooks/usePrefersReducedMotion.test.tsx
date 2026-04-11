import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type MatchMediaListener = (event: MediaQueryListEvent) => void;

function installMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<MatchMediaListener>();

  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_event: string, listener: MatchMediaListener) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: MatchMediaListener) => {
      listeners.delete(listener);
    },
    addListener: (listener: MatchMediaListener) => {
      listeners.add(listener);
    },
    removeListener: (listener: MatchMediaListener) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => true,
  }));

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMediaMock,
  });

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

describe("usePrefersReducedMotion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    installMatchMediaMock(false);
  });

  it("returns true when prefers-reduced-motion matches", () => {
    installMatchMediaMock(true);

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });

  it("updates when the media query match changes", () => {
    const matchMediaController = installMatchMediaMock(false);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      matchMediaController.setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
