import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { RecommendationsPage } from "./RecommendationsPage";

const mockUseGamesQuery = vi.fn();
const mockUseProfile = vi.fn();

vi.mock("../features/games/useGamesQuery", () => ({
  useGamesQuery: () => mockUseGamesQuery(),
}));

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => mockUseProfile(),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("RecommendationsPage", () => {
  beforeEach(() => {
    mockUseProfile.mockReturnValue({ isOwner: false, isAuthenticated: false });
  });

  it("shows loading state", () => {
    mockUseGamesQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<RecommendationsPage />, { wrapper: makeWrapper() });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseGamesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed"),
    });
    render(<RecommendationsPage />, { wrapper: makeWrapper() });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("shows empty state when no recommendations", () => {
    mockUseGamesQuery.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<RecommendationsPage />, { wrapper: makeWrapper() });
    expect(screen.getByText(/no recommendations yet/i)).toBeInTheDocument();
  });

  it("renders recommendation cards for public viewers", () => {
    mockUseGamesQuery.mockReturnValue({
      data: [
        {
          id: "1",
          name: "Arnak",
          status: "new_rec",
          recommendationVerdict: "Strong fit",
          summary: "Great engine builder",
          notes: null,
          gapReason: null,
          tags: [],
        },
      ],
      isLoading: false,
      error: null,
    });
    render(<RecommendationsPage />, { wrapper: makeWrapper() });
    expect(screen.getByText("Arnak")).toBeInTheDocument();
    expect(screen.getByText("Strong fit")).toBeInTheDocument();
  });

  it("hides owner controls when not owner", () => {
    mockUseGamesQuery.mockReturnValue({
      data: [
        {
          id: "1",
          name: "Arnak",
          status: "new_rec",
          recommendationVerdict: "Strong fit",
          summary: null,
          notes: null,
          gapReason: null,
          tags: [],
        },
      ],
      isLoading: false,
      error: null,
    });
    mockUseProfile.mockReturnValue({ isOwner: false, isAuthenticated: false });
    render(<RecommendationsPage />, { wrapper: makeWrapper() });
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("shows owner controls when isOwner", () => {
    mockUseGamesQuery.mockReturnValue({
      data: [
        {
          id: "1",
          name: "Arnak",
          status: "new_rec",
          recommendationVerdict: "Strong fit",
          summary: null,
          notes: null,
          gapReason: null,
          tags: [],
        },
      ],
      isLoading: false,
      error: null,
    });
    mockUseProfile.mockReturnValue({ isOwner: true, isAuthenticated: true });
    render(<RecommendationsPage />, { wrapper: makeWrapper() });
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });
});
