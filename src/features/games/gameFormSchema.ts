import { z } from "zod";

// Empty number inputs send NaN via valueAsNumber — coerce to null
const nullableNumber = z.preprocess(
  (v) => (typeof v === "number" && isNaN(v)) ? null : v,
  z.number().nullable().optional(),
);

const nullableInt = z.preprocess(
  (v) => (typeof v === "number" && isNaN(v)) ? null : v,
  z.number().int().nullable().optional(),
);

export const gameFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional().default(""),
  status: z.enum(["owned", "buy", "new_rec", "cut", "archived"]),
  bggId: nullableInt,
  bggUrl: z.string().nullable().optional(),
  buyPriority: nullableInt,
  bggRating: nullableNumber,
  bggWeight: nullableNumber,
  playersMin: nullableInt,
  playersMax: nullableInt,
  playTimeMin: nullableInt,
  playTimeMax: nullableInt,
  category: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  publishedYear: nullableInt,
  hidden: z.boolean().optional(),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;
