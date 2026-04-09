import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mutateAsync = vi.fn();
const useBggSearchQuery = vi.fn();
const useSession = vi.fn();

vi.mock("../../features/games/useBggSearchQuery", () => ({
  useBggSearchQuery: (query: string) => useBggSearchQuery(query),
}));

vi.mock("../../features/auth/useSession", () => ({
  useSession: () => useSession(),
}));

vi.mock("../../features/library/useLibraryEntryMutations", () => ({
  useSaveBggGameToLibrary: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

import { AddGameWizardOverlay } from "./AddGameWizardOverlay";

const result = {
  id: 999,
  name: "Everdell",
  yearPublished: 2018,
  bggUrl: "https://boardgamegeek.com/boardgame/999/everdell",
  imageUrl: "https://example.com/everdell.jpg",
  playersMin: 1,
  playersMax: 4,
  playTimeMin: 40,
  playTimeMax: 80,
  averageRating: 8.1,
  averageWeight: 2.8,
  summary: "Build a woodland city.",
};

const apiSource = {
  kind: "api",
  label: "Live BGG",
  updatedAt: null,
} as const;

const snapshotSource = {
  kind: "snapshot",
  label: "Local BGG snapshot",
  updatedAt: "2026-04-09T00:00:00.000Z",
} as const;

function renderOverlay(props?: Partial<React.ComponentProps<typeof AddGameWizardOverlay>>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(
    <AddGameWizardOverlay isOpen defaultListType="collection" onClose={vi.fn()} {...props} />,
    { wrapper: Wrapper },
  );
}

describe("AddGameWizardOverlay", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    useSession.mockReturnValue({
      session: { user: { id: "user-1" } },
      user: { id: "user-1" },
      isAuthenticated: true,
      isLoading: false,
    });
    useBggSearchQuery.mockImplementation((query: string) => ({
      data:
        query.trim().length >= 2
          ? {
              results: [result],
              source: apiSource,
            }
          : {
              results: [],
              source: apiSource,
            },
      isLoading: false,
      error: null,
    }));
  });

  it("renders the search step when open", () => {
    renderOverlay();

    expect(screen.getByRole("dialog", { name: /add new game/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /find your game/i })).toBeInTheDocument();
  });

  it("disables next until a search result is selected", async () => {
    const user = userEvent.setup();

    renderOverlay();

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));

    expect(nextButton).toBeEnabled();
  });

  it("preserves search query and selection when moving back from details", async () => {
    const user = userEvent.setup();

    renderOverlay();

    const searchInput = screen.getByRole("searchbox", { name: /search boardgamegeek/i });
    await user.type(searchInput, "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByRole("heading", { name: /game details/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByRole("searchbox", { name: /search boardgamegeek/i })).toHaveValue("Ever");
    expect(screen.getByRole("button", { name: /select everdell/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("defaults the final destination from the launching page", async () => {
    const user = userEvent.setup();

    renderOverlay({ defaultListType: "wishlist" });

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByRole("radio", { name: /wishlist/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /collection/i })).not.toBeChecked();
  });

  it("submits destination, sentiment, and notes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mutateAsync.mockResolvedValue({ id: "entry-1" });

    renderOverlay({ onClose });

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("radio", { name: /wishlist/i }));
    await user.click(screen.getByRole("radio", { name: /^like$/i }));
    await user.type(screen.getByRole("textbox", { name: /notes/i }), "Need this for game night.");
    await user.click(screen.getByRole("button", { name: /^add game$/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          listType: "wishlist",
          sentiment: "like",
          notes: "Need this for game night.",
          selectedGame: expect.objectContaining({
            id: 999,
            name: "Everdell",
          }),
        }),
      ),
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("stays open and shows an error when save fails", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue(new Error("Save failed."));

    renderOverlay();

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /^add game$/i }));

    expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /collection info/i })).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderOverlay({ onClose });

    await user.click(screen.getByRole("button", { name: /close add game wizard/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("shows local snapshot metadata when fallback results are being used", async () => {
    const user = userEvent.setup();

    useBggSearchQuery.mockImplementation((query: string) => ({
      data:
        query.trim().length >= 2
          ? {
              results: [result],
              source: snapshotSource,
            }
          : {
              results: [],
              source: snapshotSource,
            },
      isLoading: false,
      error: null,
    }));

    renderOverlay();

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");

    expect(screen.getByText(/using local bgg snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/updated 9 apr 2026/i)).toBeInTheDocument();
  });
});
