import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

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

// Clean up theme state between tests
afterEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.body.className = "";
});

