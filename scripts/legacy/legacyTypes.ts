export type LegacyGame = {
  name: string;
  bgg?: number;
  w?: number;
  p?: string;
  t?: string;
  cat?: string;
  sum?: string;
  s?: string;
  verdict?: string;
  col?: string;
  why?: string;
  reason?: string;
};

export type LegacyData = {
  owned: LegacyGame[];
  planned: LegacyGame[];
  newRecommendations: LegacyGame[];
  stillCut: LegacyGame[];
};
