export const gamesKeys = {
  all: ["games"] as const,
  lists: () => [...gamesKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...gamesKeys.lists(), filters] as const,
  details: () => [...gamesKeys.all, "detail"] as const,
  detail: (slug: string) => [...gamesKeys.details(), slug] as const,
};
