import { z } from "zod";

export const recommendationEditorSchema = z.object({
  recommendationVerdict: z.string().max(500).nullable(),
  recommendationColour: z.string().nullable(),
  summary: z.string().max(1000).nullable(),
  notes: z.string().max(1000).nullable(),
  gapReason: z.string().max(500).nullable(),
});

export type RecommendationEditorValues = z.infer<typeof recommendationEditorSchema>;
