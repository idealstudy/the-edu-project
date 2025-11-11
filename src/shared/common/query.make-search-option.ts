import { queryOptions } from '@tanstack/react-query';

type QueryKeyTypes = string | number | boolean | null | undefined;
type QueryKey = readonly QueryKeyTypes[];

type MakeSearchOptionArgs<TParams, TData> = {
  key: QueryKey;
  keyFromParams: (p: TParams) => QueryKey;
  searchFn: (params: TParams) => Promise<TData>;
  params: TParams;
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  enabled?: boolean;
};

export const makeSearchOption = <TParams, TData>({
  key,
  keyFromParams,
  searchFn,
  params,
  staleTime = 10_000,
  gcTime = 5 * 60_000,
  retry = 0,
  enabled = true,
}: MakeSearchOptionArgs<TParams, TData>) => {
  return queryOptions({
    queryKey: [...key, ...keyFromParams(params)] as const,
    queryFn: () => searchFn(params),
    staleTime,
    gcTime,
    retry,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled,
  });
};
