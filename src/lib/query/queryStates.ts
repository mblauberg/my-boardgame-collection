/**
 * Type guards and utilities for React Query states
 */

/**
 * Check if query is in initial loading state (no data yet)
 */
export function isLoadingState<T>(query: { isLoading: boolean; data: T | undefined }): boolean {
  return query.isLoading && query.data === undefined;
}

/**
 * Type guard to check if query has data
 */
export function hasData<T>(query: { data: T | undefined }): query is { data: T } {
  return query.data !== undefined;
}

/**
 * Check if query is refetching with existing data
 */
export function isRefetching<T>(query: { 
  isLoading: boolean; 
  isFetching: boolean;
  data: T | undefined 
}): boolean {
  return query.isFetching && query.data !== undefined;
}
