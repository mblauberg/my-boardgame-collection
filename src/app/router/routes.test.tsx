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

  it("renders the auth callback page instead of the not-found screen", () => {
    renderWithRouter("/auth/callback");

    expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
    expect(screen.queryByText(/missing route/i)).not.toBeInTheDocument();
  });

  it("renders the sign-in methods detail route", () => {
    renderWithRouter("/settings/sign-in-methods");

    expect(screen.getByText(/sign-in methods mobile page/i)).toBeInTheDocument();
  });
});
