import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AppProviders } from "./AppProviders";

const { mockUsePrefersReducedMotion } = vi.hoisted(() => ({
  mockUsePrefersReducedMotion: vi.fn<() => boolean, []>(() => false),
}));

vi.mock("../../hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: mockUsePrefersReducedMotion,
}));

vi.mock("../../features/library/useGuestLibrarySync", () => ({
  useGuestLibrarySync: vi.fn(),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");

  return {
    MotionConfig: ({
      children,
      reducedMotion,
    }: {
      children?: ReactNode;
      reducedMotion?: "always" | "never" | "user";
    }) =>
      React.createElement(
        "div",
        {
          "data-testid": "motion-config",
          "data-reduced-motion": reducedMotion,
        },
        children,
      ),
  };
});

describe("AppProviders", () => {
  it("forces motion on when reduced motion is not explicitly requested", () => {
    mockUsePrefersReducedMotion.mockReturnValue(false);

    render(
      <AppProviders>
        <div>App content</div>
      </AppProviders>,
    );

    expect(screen.getByTestId("motion-config")).toHaveAttribute(
      "data-reduced-motion",
      "never",
    );
  });

  it("switches Motion into reduced mode when the device explicitly prefers it", () => {
    mockUsePrefersReducedMotion.mockReturnValue(true);

    render(
      <AppProviders>
        <div>App content</div>
      </AppProviders>,
    );

    expect(screen.getByTestId("motion-config")).toHaveAttribute(
      "data-reduced-motion",
      "always",
    );
  });
});
