import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../pages/AuthCallbackPage", () => ({
  AuthCallbackPage: () => <div>Completing sign in</div>,
}));

vi.mock("../../pages/SignInMethodsPage", () => ({
  SignInMethodsPage: () => <div>Sign-in methods mobile page</div>,
}));

import { AppRoutes, appRouteDefinitions } from "./routes";

function renderWithRouter(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AppRoutes", () => {
  it("registers saved in the app route definitions and removes buy order", () => {
    expect(appRouteDefinitions).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "/saved", label: "Saved" })]),
    );
    expect(appRouteDefinitions).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "/buy-order" })]),
    );
  });

  it("stores navigation and overlay metadata in the route registry", () => {
    expect(appRouteDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/",
          label: "Collection",
          showInDesktopNav: true,
          showInMobileNav: true,
          mobileNavIcon: "shelves",
        }),
        expect.objectContaining({
          path: "/saved",
          label: "Saved",
          showInDesktopNav: true,
          showInMobileNav: true,
          mobileNavIcon: "bookmark",
        }),
        expect.objectContaining({
          path: "/explore",
          label: "Explore",
          showInDesktopNav: true,
          showInMobileNav: true,
          mobileNavIcon: "explore",
        }),
        expect.objectContaining({
          path: "/signin",
          label: "Sign In",
          allowBackgroundOverlay: true,
        }),
        expect.objectContaining({
          path: "/game/:slug",
          label: "Game Detail",
          allowBackgroundOverlay: true,
        }),
      ]),
    );
  });

  it("renders the auth callback page instead of the not-found screen", async () => {
    renderWithRouter("/auth/callback");

    expect(await screen.findByText(/completing sign in/i)).toBeInTheDocument();
    expect(screen.queryByText(/missing route/i)).not.toBeInTheDocument();
  });

  it("renders the sign-in methods detail route", async () => {
    renderWithRouter("/settings/sign-in-methods");

    expect(await screen.findByText(/sign-in methods mobile page/i)).toBeInTheDocument();
  });
});
