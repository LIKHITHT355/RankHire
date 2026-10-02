import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isApiConfigured } from "../services/api.js";

// Keeps route data in the shared QueryClient so returning to a page can use
// the most recent successful result instead of starting its local state over.
export function useCachedApiData(queryKey, loader, options = {}) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;
  const configured = isApiConfigured();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: loader,
    enabled: configured && enabled,
    staleTime,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const setData = useCallback(
    (updater) => queryClient.setQueryData(queryKey, updater),
    [queryClient, queryKey],
  );
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey }),
    [queryClient, queryKey],
  );

  return {
    data: query.data ?? null,
    error: query.error?.message || null,
    loading: query.isLoading,
    configured,
    reload: query.refetch,
    invalidate,
    setData,
  };
}
