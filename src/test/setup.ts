import * as matchers from "@testing-library/jest-dom/matchers";
import type { ReactNode } from "react";
import { afterEach, expect, vi } from "vitest";

expect.extend(matchers);

type MotionComponentProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

const MOTION_ONLY_PROPS = new Set([
  "animate",
  "exit",
  "initial",
  "layout",
  "layoutId",
  "transition",
  "variants",
  "viewport",
  "whileHover",
  "whileInView",
  "whileTap",
]);

function stripMotionProps(props: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !MOTION_ONLY_PROPS.has(key)),
  );
}

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const componentCache = new Map<string, React.ComponentType<MotionComponentProps>>();

  const createMotionComponent = (tagName: string) =>
    React.forwardRef<HTMLElement, MotionComponentProps>(function MockMotionComponent(
      { children, ...props },
      ref,
    ) {
      return React.createElement(tagName, { ...stripMotionProps(props), ref }, children as ReactNode);
    });

  return {
    AnimatePresence: ({ children }: { children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    LayoutGroup: ({ children }: { children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    MotionConfig: ({ children }: { children?: ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          const tagName = typeof prop === "string" ? prop : "div";
          const cached = componentCache.get(tagName);
          if (cached) {
            return cached;
          }

          const component = createMotionComponent(tagName);
          componentCache.set(tagName, component);
          return component;
        },
      },
    ),
  };
});

// Mock IntersectionObserver for tests - immediately trigger intersection
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    // Immediately trigger intersection in tests
    setTimeout(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], this as any);
    }, 0);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  }),
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

// Clean up theme state between tests
afterEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.body.className = "";
});
