import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import type { LibraryEntry } from "../../features/library/library.types";

const mutateAsync = vi.fn();
const useBggSearchQuery = vi.fn();
const useAccount = vi.fn();
const useProfile = vi.fn();
const useLibraryQuery = vi.fn();
const applyStatePatch = vi.fn();

vi.mock("../../features/games/useBggSearchQuery", () => ({
  useBggSearchQuery: (query: string) => useBggSearchQuery(query),
}));

vi.mock("../../features/accounts/useAccount", () => ({
  useAccount: () => useAccount(),
}));

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => useProfile(),
}));

vi.mock("../../features/library/useLibraryQuery", () => ({
  useLibraryQuery: () => useLibraryQuery(),
}));

vi.mock("../../features/library/useLibraryStateActions", () => ({
  useLibraryStateActions: () => ({
    applyStatePatch,
    isPending: false,
  }),
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

function createLibraryEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id: "entry-1",
    accountId: "account-1",
    gameId: "game-1",
    isSaved: false,
    isLoved: false,
    isInCollection: false,
    listType: "saved",
    sentiment: null,
    notes: null,
    priority: null,
    game: {
      id: "game-1",
      name: "Everdell",
      slug: "everdell",
      bggId: 999,
      bggUrl: "https://boardgamegeek.com/boardgame/999/everdell",
      status: "archived",
      buyPriority: null,
      bggRating: 8.1,
      bggWeight: 2.8,
      playersMin: 1,
      playersMax: 4,
      playTimeMin: 40,
      playTimeMax: 80,
      category: null,
      summary: "Build a woodland city.",
      notes: null,
      recommendationVerdict: null,
      recommendationColour: null,
      gapReason: null,
      isExpansionIncluded: false,
      imageUrl: "https://example.com/everdell.jpg",
      publishedYear: 2018,
      hidden: false,
      createdAt: "",
      updatedAt: "",
      tags: [],
    },
    sharedTags: [],
    userTags: [],
    ...overrides,
  };
}

function renderOverlay(props?: Partial<React.ComponentProps<typeof AddGameWizardOverlay>>) {
  return render(
    <AddGameWizardOverlay
      isOpen
      defaultListType="collection"
      defaultState={{ isSaved: false, isLoved: false, isInCollection: true }}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

describe("AddGameWizardOverlay", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    applyStatePatch.mockReset();
    useAccount.mockReturnValue({
      account: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useProfile.mockReturnValue({
      profile: null,
      isOwner: false,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useLibraryQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
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
    expect(screen.getByRole("dialog", { name: /add new game/i })).toHaveAttribute(
      "data-motion",
      "wizard-panel",
    );
    expect(screen.getByRole("heading", { name: /find your game/i })).toBeInTheDocument();
  });

  it("uses shared glass control styles for wizard controls and result cards", async () => {
    const user = userEvent.setup();
    renderOverlay();

    expect(screen.getByRole("button", { name: /close add game wizard/i })).toHaveClass(
      "glass-action-button",
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toHaveClass("glass-action-button");
    expect(screen.getByRole("button", { name: /next/i })).toHaveClass(
      "glass-action-button-active",
    );
    expect(screen.getByRole("searchbox", { name: /search boardgamegeek/i })).toHaveClass(
      "glass-input-field",
    );
    expect(screen.getByTestId("add-game-wizard-step")).toHaveAttribute("data-motion", "wizard-step");

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");

    expect(await screen.findByRole("button", { name: /select everdell/i })).toHaveClass(
      "glass-selectable-card",
    );
  });

  it("lets guests add a game locally", async () => {
    const user = userEvent.setup();

    renderOverlay();

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /game details/i });
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /library state/i });

    expect(screen.getByRole("button", { name: /add locally/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /add locally/i }));

    expect(applyStatePatch).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "guest-bgg:999",
        bggId: 999,
        slug: "everdell-guest-bgg-999",
      }),
      null,
      expect.objectContaining({
        isSaved: false,
        isLoved: false,
        isInCollection: true,
      }),
    );
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("keeps saved and in-collection mutually exclusive in the final step", async () => {
    const user = userEvent.setup();

    renderOverlay({
      defaultListType: "wishlist",
      defaultState: { isSaved: true, isLoved: false, isInCollection: false },
    });

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /game details/i });
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /library state/i });
    await user.click(screen.getByRole("checkbox", { name: /in collection/i }));

    expect(screen.getByRole("checkbox", { name: /saved/i })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /in collection/i })).toBeChecked();
  });

  it("submits synced additions for authenticated accounts", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mutateAsync.mockResolvedValue({ id: "entry-1" });
    useAccount.mockReturnValue({
      account: { id: "account-1" },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    useProfile.mockReturnValue({
      profile: { id: "account-1" },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    renderOverlay({
      onClose,
      defaultState: { isSaved: true, isLoved: false, isInCollection: false },
    });

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /game details/i });
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /library state/i });
    await user.click(screen.getByRole("checkbox", { name: /loved/i }));
    await user.click(screen.getByRole("button", { name: /add and sync/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: "account-1",
          isSaved: true,
          isLoved: true,
          isInCollection: false,
          selectedGame: expect.objectContaining({
            id: 999,
            name: "Everdell",
          }),
        }),
      ),
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("reuses existing library entries instead of syncing a duplicate add", async () => {
    const user = userEvent.setup();
    const existingEntry = createLibraryEntry({ isSaved: true });
    useAccount.mockReturnValue({
      account: { id: "account-1" },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    useProfile.mockReturnValue({
      profile: { id: "account-1" },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    useLibraryQuery.mockReturnValue({
      data: [existingEntry],
      isLoading: false,
      error: null,
    });

    renderOverlay();

    await user.type(screen.getByRole("searchbox", { name: /search boardgamegeek/i }), "Ever");
    await user.click(screen.getByRole("button", { name: /select everdell/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /game details/i });
    await user.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByRole("heading", { name: /library state/i });
    await user.click(screen.getByRole("checkbox", { name: /loved/i }));
    await user.click(screen.getByRole("button", { name: /add and sync/i }));

    expect(applyStatePatch).toHaveBeenCalledWith(
      existingEntry.game,
      existingEntry,
      expect.objectContaining({
        isSaved: false,
        isLoved: true,
        isInCollection: true,
      }),
    );
    expect(mutateAsync).not.toHaveBeenCalled();
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

    expect(await screen.findByText(/using local bgg snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/updated 9 apr 2026/i)).toBeInTheDocument();
  });
});
