import { renderHook } from "@testing-library/react";

const mockUseLibraryQuery = vi.fn();

vi.mock("./useLibraryQuery", () => ({
  useLibraryQuery: () => mockUseLibraryQuery(),
}));

import { useOwnedLibrarySurfaceQuery } from "./useOwnedLibrarySurfaceQuery";

describe("useOwnedLibrarySurfaceQuery", () => {
  beforeEach(() => {
    mockUseLibraryQuery.mockReset();
  });

  it("selects collection entries for the collection surface", () => {
    mockUseLibraryQuery.mockReturnValue({
      data: [
        { id: "collection-1", isInCollection: true, isSaved: false },
        { id: "saved-1", isInCollection: false, isSaved: true },
        { id: "both-1", isInCollection: true, isSaved: true },
      ],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useOwnedLibrarySurfaceQuery("collection"));

    expect(result.current.data).toEqual([
      { id: "collection-1", isInCollection: true, isSaved: false },
      { id: "both-1", isInCollection: true, isSaved: true },
    ]);
  });

  it("selects saved entries for the saved surface", () => {
    mockUseLibraryQuery.mockReturnValue({
      data: [
        { id: "collection-1", isInCollection: true, isSaved: false },
        { id: "saved-1", isInCollection: false, isSaved: true },
        { id: "both-1", isInCollection: true, isSaved: true },
      ],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useOwnedLibrarySurfaceQuery("saved"));

    expect(result.current.data).toEqual([
      { id: "saved-1", isInCollection: false, isSaved: true },
      { id: "both-1", isInCollection: true, isSaved: true },
    ]);
  });
});
