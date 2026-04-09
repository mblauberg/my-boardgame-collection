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
  bggRank?: number | null;
  bggBayesAverage?: number | null;
  bggUsersRated?: number | null;
  isExpansion?: boolean | null;
  customImageFile?: File;
  customImageUrl?: string;
};

export type AddGameWizardCollectionInfo = {
  listType: LibraryListType;
  sentiment: LibrarySentiment;
  notes: string;
};
