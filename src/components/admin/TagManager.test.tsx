import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Tag } from "../../types/domain";
import { TagManager } from "./TagManager";

// Mock tag mutations
const mockCreateTag = vi.fn();
const mockUpdateTag = vi.fn();

vi.mock("../../features/tags/useTagMutations", () => ({
  useCreateTag: () => ({ mutateAsync: mockCreateTag, isPending: false }),
  useUpdateTag: () => ({ mutateAsync: mockUpdateTag, isPending: false }),
}));

const tagFixtures: Tag[] = [
  { id: "t1", name: "Racing", slug: "racing", tagType: "theme", colour: "#ff0000" },
  { id: "t2", name: "Card Game", slug: "card-game", tagType: "mechanic", colour: null },
];

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("TagManager", () => {
  beforeEach(() => {
    mockCreateTag.mockReset();
    mockUpdateTag.mockReset();
  });

  it("renders all existing tags", () => {
    render(<TagManager tags={tagFixtures} />, { wrapper: makeWrapper() });

    expect(screen.getByText("Racing")).toBeInTheDocument();
    expect(screen.getByText("Card Game")).toBeInTheDocument();
  });

  it("groups tags by tag_type", () => {
    render(<TagManager tags={tagFixtures} />, { wrapper: makeWrapper() });

    expect(screen.getByText("theme")).toBeInTheDocument();
    expect(screen.getByText("mechanic")).toBeInTheDocument();
  });

  it("validates and saves a new tag", async () => {
    const user = userEvent.setup();
    mockCreateTag.mockResolvedValue({ id: "t3", name: "Worker Placement", slug: "worker-placement" });

    render(<TagManager tags={tagFixtures} />, { wrapper: makeWrapper() });

    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.type(screen.getByLabelText(/tag name/i), "Worker Placement");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Worker Placement" }),
      );
    });
  });

  it("shows a validation error when tag name is empty", async () => {
    const user = userEvent.setup();

    render(<TagManager tags={tagFixtures} />, { wrapper: makeWrapper() });

    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
