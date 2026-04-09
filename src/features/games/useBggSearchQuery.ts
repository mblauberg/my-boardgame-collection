import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../lib/utils/useDebounce";
import { searchBggGames } from "./bggApi";

export function useBggSearchQuery(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 1000);

  return useQuery({
    queryKey: ["bgg", "search", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    retry: false,
    queryFn: async () => searchBggGames(debouncedQuery),
  });
}
