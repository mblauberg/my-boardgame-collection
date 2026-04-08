import { useQuery } from "@tanstack/react-query";
import { searchBggGames } from "./bggApi";

export function useBggSearchQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["bgg", "search", normalizedQuery],
    enabled: normalizedQuery.length >= 2,
    queryFn: async () => searchBggGames(normalizedQuery),
  });
}
