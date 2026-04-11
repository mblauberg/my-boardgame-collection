import type { ReactNode } from "react";
import { COLLECTION_PRESETS, SAVED_PRESETS } from "../../components/library/QuickFilterPresets";
import type { LibraryFilters } from "./libraryFilters";
import type { LibrarySurface } from "./library.types";

type OwnedLibrarySurfaceConfig = {
  header: {
    eyebrow: string;
    title: ReactNode;
    description: string;
    loadingDescription: string;
    errorTitle: string;
    errorContext: string;
  };
  guestMessage: string;
  presets: Array<{ label: string; filters: Partial<LibraryFilters> }>;
  searchPlaceholder: string;
  cardContext: LibrarySurface;
  addGameDefaultState: {
    isSaved: boolean;
    isLoved: boolean;
    isInCollection: boolean;
  };
  getGameLinkState: () => { from: string };
};

type PublicLibrarySurfaceConfig = {
  header: {
    eyebrow: string;
    description: string;
    loadingDescription: string;
    errorTitle: string;
    errorContext: string;
    missingDescription: string;
  };
  getGameLinkState: (username: string) => { from: string };
};

const ownedLibrarySurfaceConfigs: Record<LibrarySurface, OwnedLibrarySurfaceConfig> = {
  collection: {
    header: {
      eyebrow: "Curated Collection",
      title: <>Your <span className="text-primary">Collection</span></>,
      description:
        "Games you own and love. Build your personal library and track the titles that make it to your shelf.",
      loadingDescription: "Loading your collection...",
      errorTitle: "Collection unavailable",
      errorContext: "collection",
    },
    guestMessage: "You're browsing as a guest. Your collection is stored locally on this device.",
    presets: COLLECTION_PRESETS,
    searchPlaceholder: "Search your collection...",
    cardContext: "collection",
    addGameDefaultState: {
      isSaved: false,
      isLoved: false,
      isInCollection: true,
    },
    getGameLinkState: () => ({ from: "/" }),
  },
  saved: {
    header: {
      eyebrow: "On Your Radar",
      title: <>Your <span className="text-primary">Saved</span> Games</>,
      description:
        "Games you're interested in trying. Save titles to explore later and keep track of what's on your radar.",
      loadingDescription: "Loading saved games...",
      errorTitle: "Saved games unavailable",
      errorContext: "saved games",
    },
    guestMessage: "You're browsing as a guest. Your saves are stored locally on this device.",
    presets: SAVED_PRESETS,
    searchPlaceholder: "Search saved games...",
    cardContext: "saved",
    addGameDefaultState: {
      isSaved: true,
      isLoved: false,
      isInCollection: false,
    },
    getGameLinkState: () => ({ from: "/saved" }),
  },
};

const publicLibrarySurfaceConfigs: Record<LibrarySurface, PublicLibrarySurfaceConfig> = {
  collection: {
    header: {
      eyebrow: "Public Collection",
      description: "A public view of this account's collection.",
      loadingDescription: "Loading this public collection...",
      errorTitle: "Public collection unavailable",
      errorContext: "public collection",
      missingDescription: "This public collection could not be found.",
    },
    getGameLinkState: (username: string) => ({ from: `/u/${username}/collection` }),
  },
  saved: {
    header: {
      eyebrow: "Public Saved",
      description: "A public view of this account's saved games.",
      loadingDescription: "Loading this public saved list...",
      errorTitle: "Public saved games unavailable",
      errorContext: "public saved games",
      missingDescription: "This public saved list could not be found.",
    },
    getGameLinkState: (username: string) => ({ from: `/u/${username}/saved` }),
  },
};

export function getOwnedLibrarySurfaceConfig(surface: LibrarySurface): OwnedLibrarySurfaceConfig {
  return ownedLibrarySurfaceConfigs[surface];
}

export function getPublicLibrarySurfaceConfig(surface: LibrarySurface): PublicLibrarySurfaceConfig {
  return publicLibrarySurfaceConfigs[surface];
}
