import type { SortDirection } from "../../features/shared/filters";

export function compareValues<T>(
  a: T,
  b: T,
  direction: SortDirection,
): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  const multiplier = direction === "asc" ? 1 : -1;

  if (typeof a === "string" && typeof b === "string") {
    return multiplier * a.localeCompare(b);
  }

  if (typeof a === "number" && typeof b === "number") {
    return multiplier * (a - b);
  }

  return 0;
}
