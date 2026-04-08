import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

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
  it("renders the auth callback page instead of the not-found screen", () => {
    renderWithRouter("/auth/callback");

    expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
    expect(screen.queryByText(/missing route/i)).not.toBeInTheDocument();
  });
});
