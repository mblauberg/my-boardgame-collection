import type { LibraryListType, LibrarySentiment } from "../../features/library/library.types";

export type AddGameWizardSelectedGame = {
  id: number;
  name: string;
  yearPublished: number | null;
  bggUrl: string;
  imageUrl: string | null;
  playersMin: number | null;
  playersMax: number | null;
  playTimeMin: number | null;
  playTimeMax: number | null;
  averageRating: number | null;
  averageWeight: number | null;
  summary: string | null;
};

export type AddGameWizardCollectionInfo = {
  listType: LibraryListType;
  sentiment: LibrarySentiment;
  notes: string;
};
