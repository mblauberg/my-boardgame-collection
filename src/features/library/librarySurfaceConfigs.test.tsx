import { render, screen } from "@testing-library/react";
import {
  getOwnedLibrarySurfaceConfig,
  getPublicLibrarySurfaceConfig,
} from "./librarySurfaceConfigs";

describe("library surface configs", () => {
  it("returns collection-owned copy and defaults from one shared source", () => {
    const config = getOwnedLibrarySurfaceConfig("collection");

    render(<>{config.header.title}</>);

    expect(screen.getByText("Collection")).toHaveClass("text-primary");
    expect(config.header.eyebrow).toBe("Curated Collection");
    expect(config.searchPlaceholder).toBe("Search your collection...");
    expect(config.cardContext).toBe("collection");
    expect(config.addGameDefaultState).toEqual({
      isSaved: false,
      isLoved: false,
      isInCollection: true,
    });
    expect(config.getGameLinkState()).toEqual({ from: "/" });
  });

  it("returns saved public copy and routing defaults from one shared source", () => {
    const config = getPublicLibrarySurfaceConfig("saved");

    expect(config.header.eyebrow).toBe("Public Saved");
    expect(config.header.description).toBe("A public view of this account's saved games.");
    expect(config.header.missingDescription).toBe("This public saved list could not be found.");
    expect(config.getGameLinkState("alice")).toEqual({ from: "/u/alice/saved" });
  });
});
